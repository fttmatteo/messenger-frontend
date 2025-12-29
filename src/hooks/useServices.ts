import { useEffect, useState, useCallback } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

// Type Definitions
type SortDirection = "asc" | "desc"

interface UseServicesReturn {
    // Data
    services: ServiceDelivery[]
    loading: boolean

    // Pagination
    currentPage: number
    totalPages: number
    totalElements: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    // Sorting
    sortField: string
    sortDirection: SortDirection
    handleSort: (field: string) => void

    // Filtering
    statusFilter: ServiceStatus[]
    setStatusFilter: (filter: ServiceStatus[]) => void

    // Actions
    fetchServices: () => Promise<void>
}

/**
 * Custom hook for managing services list with SERVER-SIDE pagination.
 * Fetches paginated data from backend instead of loading everything.
 */
export function useServices(): UseServicesReturn {
    // Core state
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Sorting state
    const [sortField, setSortField] = useState<string>("createdAt")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // Filtering state
    const [statusFilter, setStatusFilter] = useState<ServiceStatus[]>([])

    // Fetch services with pagination
    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            const response = await serviceDeliveryService.getAllPaginated({
                page: currentPage,
                size: itemsPerPage,
                sortBy: sortField,
                sortDirection: sortDirection
            })

            setServices(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            toast.error("Error al cargar servicios", {
                description: getErrorMessage(error),
                id: "error-cargar-servicios"
            })
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, sortField, sortDirection])

    // Handle sorting
    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            // New field, default to ascending
            setSortField(field)
            setSortDirection("asc")
        }
        // Reset to first page when sorting changes
        setCurrentPage(0)
    }, [sortField])

    // Custom setCurrentPage that validates the page number
    const handleSetCurrentPage = useCallback((page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page)
        }
    }, [totalPages])

    // Custom setItemsPerPage that resets to first page
    const handleSetItemsPerPage = useCallback((items: number) => {
        setItemsPerPage(items)
        setCurrentPage(0)
    }, [])

    // Fetch when parameters change
    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    // Reset to first page when status filter changes
    useEffect(() => {
        setCurrentPage(0)
    }, [statusFilter])

    return {
        // Data
        services,
        loading,

        // Pagination
        currentPage,
        totalPages,
        totalElements,
        itemsPerPage,
        setCurrentPage: handleSetCurrentPage,
        setItemsPerPage: handleSetItemsPerPage,

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
