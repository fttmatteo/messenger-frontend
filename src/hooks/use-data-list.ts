import { useState, useMemo, useEffect } from "react"

export type SortDirection = "asc" | "desc"

// Type for values that can be compared during sorting
type ComparableValue = string | number | boolean | Date | null | undefined

export interface UseDataListOptions<T> {
    data: T[]
    searchQuery: string
    /**
     * Function to check if an item matches the search query.
     * Return true if it matches, false otherwise.
     */
    searchFilter: (item: T, query: string) => boolean
    /**
     * Optional custom filter function for additional filtering (e.g. by status or role).
     * Return true if it matches, false otherwise.
     */
    customFilter?: (item: T) => boolean
    /**
     * Map of sort fields to functions that return the value to sort by.
     * Use this for nested properties or custom sort logic.
     * Example: { 'plateNumber': (item) => item.plate.plateNumber }
     */
    sortValueResolvers?: Record<string, (item: T) => ComparableValue>
    initialItemsPerPage?: number
    defaultSortField?: string | null
    defaultSortDirection?: SortDirection
}

export interface UseDataListReturn<T> {
    // Processed Data
    filteredAndSortedData: T[]
    paginatedData: T[]

    // Pagination
    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    // Sorting
    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

    // Explicit Sort Setters
    setSortField: (field: string | null) => void
    setSortDirection: (direction: SortDirection) => void
}

/**
 * Generic hook to manage client-side filtering, sorting, and pagination.
 */
export function useDataList<T>({
    data,
    searchQuery,
    searchFilter,
    customFilter,
    sortValueResolvers = {},
    initialItemsPerPage = 10,
    defaultSortField = null,
    defaultSortDirection = "asc"
}: UseDataListOptions<T>): UseDataListReturn<T> {
    // Sorting state
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

    // Filter and Sort
    const filteredAndSortedData = useMemo(() => {
        let result = data.filter((item) => {
            // 1a. Search Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                if (!searchFilter(item, query)) {
                    return false
                }
            }

            // 1b. Custom Filter
            if (customFilter && !customFilter(item)) {
                return false
            }

            return true
        })

        // 2. Apply sorting
        if (sortField) {
            const resolver = sortValueResolvers[sortField] ||
                ((item: T) => item[sortField as keyof T])

            result = [...result].sort((a, b) => {
                const valA = resolver(a)
                const valB = resolver(b)

                // Handle null/undefined values - push them to the end
                if (valA == null && valB == null) return 0
                if (valA == null) return 1
                if (valB == null) return -1

                let comparison = 0

                // Handle string comparison nicely (localeCompare)
                if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB)
                } else if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime()
                } else {
                    // Fallback for numbers, booleans, etc.
                    if (valA < valB) comparison = -1
                    if (valA > valB) comparison = 1
                }

                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [data, searchQuery, sortField, sortDirection, searchFilter, customFilter, sortValueResolvers])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedData.slice(start, start + itemsPerPage)
    }, [filteredAndSortedData, currentPage, itemsPerPage])

    // Reset to page 1 when filters or sort change
    useEffect(() => {
        // eslint-disable-next-line
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, itemsPerPage, customFilter])

    const handleSort = (field: string) => {
        if (sortField === field) {
            // Same field clicked - cycle: asc → desc → null (clear)
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else {
                // Was desc, now clear the sort
                setSortField(null)
                setSortDirection("asc") // Reset direction for next use
            }
        } else {
            // New field - start with ascending
            setSortField(field)
            setSortDirection("asc")
        }
    }

    return {
        filteredAndSortedData,
        paginatedData,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort,
        setSortField,
        setSortDirection
    }
}
