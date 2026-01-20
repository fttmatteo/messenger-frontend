import { useEffect, useState, useMemo, useCallback } from "react"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { toast } from "sonner"
import { useDataList } from "@/hooks/use-data-list"
import { getErrorMessage } from "@/lib/error-utils"

type SortDirection = "asc" | "desc"

interface UseDealershipsOptions {
    searchQuery: string
}

interface UseDealershipsReturn {
    dealerships: Dealership[]
    loading: boolean
    filteredAndSortedDealerships: Dealership[]
    paginatedDealerships: Dealership[]
    uniqueZones: string[]

    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

    zoneFilter: string
    setZoneFilter: (filter: string) => void

    fetchDealerships: () => Promise<void>
}

/**
 * Hook para gestionar y filtrar la lista de concesionarios.
 * Incluye lógica de búsqueda, filtrado por zona y ordenación.
 */
export function useDealerships({ searchQuery }: UseDealershipsOptions): UseDealershipsReturn {
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loading, setLoading] = useState(true)
    const [zoneFilter, setZoneFilter] = useState<string>("all")
    const uniqueZones = useMemo(() => {
        const zones = new Set(dealerships.map(d => d.zone))
        return Array.from(zones).sort()
    }, [dealerships])

    const searchFilter = useCallback((dealership: Dealership, query: string) => {
        return (
            String(dealership.idDealership).includes(query) ||
            dealership.name.toLowerCase().includes(query) ||
            dealership.address.toLowerCase().includes(query) ||
            dealership.phone.includes(query) ||
            dealership.zone.toLowerCase().includes(query)
        )
    }, [])

    const customFilter = useCallback((dealership: Dealership) => {
        if (zoneFilter !== "all" && dealership.zone !== zoneFilter) {
            return false
        }
        return true
    }, [zoneFilter])

    const sortValueResolvers = {
        "name": (d: Dealership) => d.name,
        "zone": (d: Dealership) => d.zone,
        "isGeolocated": (d: Dealership) => d.isGeolocated
    }

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

    useEffect(() => {
        fetchDealerships()
    }, [])

    return {
        dealerships,
        loading,
        filteredAndSortedDealerships: filteredAndSortedData,
        paginatedDealerships: paginatedData,
        uniqueZones,

        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,

        sortField,
        sortDirection,
        handleSort,

        zoneFilter,
        setZoneFilter,

        fetchDealerships,
    }
}
