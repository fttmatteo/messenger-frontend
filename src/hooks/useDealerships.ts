import { useEffect, useState, useMemo, useCallback } from "react"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { toast } from "sonner"
import { useDataList } from "@/hooks/useDataList"
import { getErrorMessage } from "@/lib/error-utils"

// Type Definitions
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
    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

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
    const [zoneFilter, setZoneFilter] = useState<string>("all")

    // Get unique zones from dealerships
    const uniqueZones = useMemo(() => {
        const zones = new Set(dealerships.map(d => d.zone))
        return Array.from(zones).sort()
    }, [dealerships])

    // Search Filter Logic
    const searchFilter = useCallback((dealership: Dealership, query: string) => {
        return (
            String(dealership.idDealership).includes(query) ||
            dealership.name.toLowerCase().includes(query) ||
            dealership.address.toLowerCase().includes(query) ||
            dealership.phone.includes(query) ||
            dealership.zone.toLowerCase().includes(query)
        )
    }, [])

    // Custom Filter Logic (Zone)
    const customFilter = useCallback((dealership: Dealership) => {
        if (zoneFilter !== "all" && dealership.zone !== zoneFilter) {
            return false
        }
        return true
    }, [zoneFilter])

    // Sort Resolvers
    const sortValueResolvers = {
        "name": (d: Dealership) => d.name,
        "zone": (d: Dealership) => d.zone,
        "isGeolocated": (d: Dealership) => d.isGeolocated
    }

    // Use Generic Hook
    const {
        filteredAndSortedData,
        paginatedData,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort
    } = useDataList<Dealership>({
        data: dealerships,
        searchQuery,
        searchFilter,
        customFilter,
        sortValueResolvers,
        defaultSortField: null,
        initialItemsPerPage: 10
    })

    // Fetch dealerships
    const fetchDealerships = async () => {
        try {
            setLoading(true)
            const data = await dealershipService.getAll()
            setDealerships(data)
        } catch (error) {
            toast.error("Error al cargar concesionarios", {
                description: getErrorMessage(error),
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
        filteredAndSortedDealerships: filteredAndSortedData,
        paginatedDealerships: paginatedData,
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
