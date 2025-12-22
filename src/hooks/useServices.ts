import { useEffect, useState, useCallback } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { toast } from "sonner"
import { getStatusBadge } from "@/lib/status-utils"
import { useDataList } from "@/hooks/useDataList"

// Type Definitions
type SortDirection = "asc" | "desc"


interface UseServicesOptions {
    searchQuery: string
}

interface UseServicesReturn {
    // Data
    services: ServiceDelivery[]
    loading: boolean
    filteredAndSortedServices: ServiceDelivery[]
    paginatedServices: ServiceDelivery[]

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
    statusFilter: ServiceStatus[]
    setStatusFilter: (filter: ServiceStatus[]) => void

    // Actions
    fetchServices: () => Promise<void>
}

/**
 * Custom hook for managing services list state, filtering, sorting, and pagination.
 * Centralizes all data management logic from the Servicios page.
 */
export function useServices({ searchQuery }: UseServicesOptions): UseServicesReturn {
    // Core state
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<ServiceStatus[]>([])

    // Search Filter Logic
    const searchFilter = useCallback((service: ServiceDelivery, query: string) => {
        return (
            String(service.idServiceDelivery).includes(query) ||
            service.plate.plateNumber.toLowerCase().includes(query) ||
            service.dealership.name.toLowerCase().includes(query) ||
            service.messenger.fullName.toLowerCase().includes(query) ||
            service.currentStatus.toLowerCase().includes(query) ||
            getStatusBadge(service.currentStatus).label.toLowerCase().includes(query)
        )
    }, [])

    // Custom Filter Logic (Status)
    const customFilter = useCallback((service: ServiceDelivery) => {
        if (statusFilter.length > 0 && !statusFilter.includes(service.currentStatus)) {
            return false
        }
        return true
    }, [statusFilter])

    // Sort Resolvers
    const sortValueResolvers = {
        "plateNumber": (s: ServiceDelivery) => s.plate.plateNumber,
        "dealershipName": (s: ServiceDelivery) => s.dealership.name,
        "messengerName": (s: ServiceDelivery) => s.messenger.fullName,
        "currentStatus": (s: ServiceDelivery) => s.currentStatus,
        "createdAt": (s: ServiceDelivery) => new Date(s.createdAt)
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
    } = useDataList<ServiceDelivery>({
        data: services,
        searchQuery,
        searchFilter,
        customFilter,
        sortValueResolvers,
        defaultSortField: null,
        initialItemsPerPage: 10
    })

    // Fetch services
    const fetchServices = async () => {
        try {
            setLoading(true)
            const data = await serviceDeliveryService.getAll()
            setServices(data)
        } catch (error: any) {
            toast.error("Error al cargar servicios", {
                description: error.message,
                id: "error-cargar-servicios"
            })
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchServices()
    }, [])

    return {
        // Data
        services,
        loading,
        filteredAndSortedServices: filteredAndSortedData,
        paginatedServices: paginatedData,

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
        statusFilter,
        setStatusFilter,

        // Actions
        fetchServices,
    }
}
