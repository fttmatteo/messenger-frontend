import { useEffect, useState, useMemo } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { toast } from "sonner"
import { getStatusBadge } from "@/lib/status-utils"

// Type Definitions
type SortField = "plateNumber" | "dealershipName" | "messengerName" | "currentStatus" | "createdAt" | null
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
    sortField: SortField
    sortDirection: SortDirection
    handleSort: (field: SortField) => void

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

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [statusFilter, setStatusFilter] = useState<ServiceStatus[]>([])

    // Filter and sort services
    const filteredAndSortedServices = useMemo(() => {
        let result = services.filter((service) => {
            // Search filter
            const query = searchQuery.toLowerCase()
            const matchesSearch = !searchQuery.trim() ||
                String(service.idServiceDelivery).includes(query) ||
                service.plate.plateNumber.toLowerCase().includes(query) ||
                service.dealership.name.toLowerCase().includes(query) ||
                service.messenger.fullName.toLowerCase().includes(query) ||
                service.currentStatus.toLowerCase().includes(query) ||
                getStatusBadge(service.currentStatus).label.toLowerCase().includes(query)

            if (!matchesSearch) return false

            // Status filter
            if (statusFilter.length > 0 && !statusFilter.includes(service.currentStatus)) {
                return false
            }

            return true
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "plateNumber":
                        comparison = a.plate.plateNumber.localeCompare(b.plate.plateNumber)
                        break
                    case "dealershipName":
                        comparison = a.dealership.name.localeCompare(b.dealership.name)
                        break
                    case "messengerName":
                        comparison = a.messenger.fullName.localeCompare(b.messenger.fullName)
                        break
                    case "currentStatus":
                        comparison = a.currentStatus.localeCompare(b.currentStatus)
                        break
                    case "createdAt":
                        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [services, searchQuery, statusFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage)
    const paginatedServices = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedServices.slice(start, start + itemsPerPage)
    }, [filteredAndSortedServices, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, statusFilter, itemsPerPage])

    // Sorting handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

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
        filteredAndSortedServices,
        paginatedServices,

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
