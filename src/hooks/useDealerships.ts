import { useEffect, useState, useMemo } from "react"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { toast } from "sonner"

// Type Definitions
type SortField = "name" | "zone" | "isGeolocated" | null
type SortDirection = "asc" | "desc"

interface UseDealershipsOptions {
    searchQuery: string
}

interface UseDealershipsReturn {
    // Data
    dealerships: Dealership[]
    loading: boolean
    filteredAndSortedDealerships: Dealership[]
    paginatedDealerships: Dealership[]
    uniqueZones: string[]

    // Pagination
    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    // Sorting
    sortField: SortField
    sortDirection: SortDirection
    handleSort: (field: SortField) => void

    // Filtering
    zoneFilter: string
    setZoneFilter: (filter: string) => void

    // Actions
    fetchDealerships: () => Promise<void>
}

/**
 * Custom hook for managing dealerships list state, filtering, sorting, and pagination.
 * Centralizes all data management logic from the Concesionarios page.
 */
export function useDealerships({ searchQuery }: UseDealershipsOptions): UseDealershipsReturn {
    // Core state
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loading, setLoading] = useState(true)

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [zoneFilter, setZoneFilter] = useState<string>("all")

    // Get unique zones from dealerships
    const uniqueZones = useMemo(() => {
        const zones = new Set(dealerships.map(d => d.zone))
        return Array.from(zones).sort()
    }, [dealerships])

    // Filter and sort dealerships
    const filteredAndSortedDealerships = useMemo(() => {
        let result = dealerships.filter((dealership) => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch = (
                    String(dealership.idDealership).includes(query) ||
                    dealership.name.toLowerCase().includes(query) ||
                    dealership.address.toLowerCase().includes(query) ||
                    dealership.phone.includes(query) ||
                    dealership.zone.toLowerCase().includes(query)
                )
                if (!matchesSearch) return false
            }

            // Zone filter
            if (zoneFilter !== "all" && dealership.zone !== zoneFilter) {
                return false
            }

            return true
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "name":
                        comparison = a.name.localeCompare(b.name)
                        break
                    case "zone":
                        comparison = a.zone.localeCompare(b.zone)
                        break
                    case "isGeolocated":
                        comparison = (a.isGeolocated === b.isGeolocated) ? 0 : a.isGeolocated ? -1 : 1
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [dealerships, searchQuery, zoneFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedDealerships.length / itemsPerPage)
    const paginatedDealerships = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedDealerships.slice(start, start + itemsPerPage)
    }, [filteredAndSortedDealerships, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, zoneFilter, itemsPerPage])

    // Sorting handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Fetch dealerships
    const fetchDealerships = async () => {
        try {
            setLoading(true)
            const data = await dealershipService.getAll()
            setDealerships(data)
        } catch (error: any) {
            toast.error("Error al cargar concesionarios", {
                description: error.message,
                id: "error-cargar-concesionarios"
            })
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchDealerships()
    }, [])

    return {
        // Data
        dealerships,
        loading,
        filteredAndSortedDealerships,
        paginatedDealerships,
        uniqueZones,

        // Pagination
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,

        // Sorting
        sortField,
        sortDirection,
        handleSort,

        // Filtering  
        zoneFilter,
        setZoneFilter,

        // Actions
        fetchDealerships,
    }
}
