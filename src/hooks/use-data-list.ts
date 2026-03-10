import { useState, useMemo, useEffect } from "react"

export type SortDirection = "asc" | "desc"

type ComparableValue = string | number | boolean | Date | null | undefined

/**
 * Interfaz de opciones para useDataList.
 */
export interface UseDataListOptions<T> {
    data: T[]
    searchQuery: string
    searchFilter: (item: T, query: string) => boolean
    customFilter?: (item: T) => boolean
    sortValueResolvers?: Record<string, (item: T) => ComparableValue>
    initialItemsPerPage?: number
    defaultSortField?: string | null
    defaultSortDirection?: SortDirection
}

/**
 * Interfaz de retorno para useDataList.
 */
export interface UseDataListReturn<T> {
    filteredAndSortedData: T[]
    paginatedData: T[]

    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void
    setSortField: (field: string | null) => void
    setSortDirection: (direction: SortDirection) => void
}

/**
 * Hook genérico para gestionar filtrado, ordenación y paginación en el lado del cliente.
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
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection)


    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)


    const filteredAndSortedData = useMemo(() => {
        let result = data.filter((item) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                if (!searchFilter(item, query)) {
                    return false
                }
            }

            if (customFilter && !customFilter(item)) {
                return false
            }

            return true
        })

        if (sortField) {
            const resolver = sortValueResolvers[sortField] ||
                ((item: T) => item[sortField as keyof T])

            result = [...result].sort((a, b) => {
                const valA = resolver(a)
                const valB = resolver(b)

                if (valA == null && valB == null) return 0
                if (valA == null) return 1
                if (valB == null) return -1

                let comparison = 0

                if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB)
                } else if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime()
                } else {
                    if (valA < valB) comparison = -1
                    if (valA > valB) comparison = 1
                }

                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [data, searchQuery, sortField, sortDirection, searchFilter, customFilter, sortValueResolvers])


    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedData.slice(start, start + itemsPerPage)
    }, [filteredAndSortedData, currentPage, itemsPerPage])

    useEffect(() => {
        // eslint-disable-next-line
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, itemsPerPage, customFilter])

    const handleSort = (field: string) => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else {
                setSortField(null)
                setSortDirection("asc")
            }
        } else {
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
