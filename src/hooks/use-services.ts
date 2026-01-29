import { useEffect, useState, useCallback } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { showToast } from "@/config/toast-config"
import { getErrorMessage } from "@/lib/error-utils"

type SortDirection = "asc" | "desc"

interface UseServicesOptions {
    searchQuery?: string
}

interface UseServicesReturn {
    services: ServiceDelivery[]
    loading: boolean

    currentPage: number
    totalPages: number
    totalElements: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

    statusFilter: ServiceStatus[]
    setStatusFilter: (filter: ServiceStatus[]) => void

    fetchServices: () => Promise<void>
}

/**
 * Hook para gestionar la lista paginada de servicios en la vista de administración.
 * Maneja filtros por estado, búsqueda, ordenación y navegación entre páginas.
 */
export function useServices({ searchQuery }: UseServicesOptions = {}): UseServicesReturn {
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortField, setSortField] = useState<string | null>("createdAt")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const [statusFilter, setStatusFilter] = useState<ServiceStatus[]>([])
    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            const response = await serviceDeliveryService.getAllPaginated({
                page: currentPage - 1,
                size: itemsPerPage,
                sortBy: sortField ?? undefined,
                sortDirection: sortDirection,
                status: statusFilter.length > 0 ? statusFilter : undefined,
                search: searchQuery
            })

            setServices(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            showToast.error("Error al cargar servicios", {
                description: getErrorMessage(error)
            })
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, sortField, sortDirection, statusFilter, searchQuery])

    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else {
                setSortField(null)
                setSortDirection("desc")
            }
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
        setCurrentPage(1)
    }, [sortField, sortDirection])

    const handleSetCurrentPage = useCallback((page: number) => {
        if (page >= 1 && (totalPages === 0 || page <= totalPages)) {
            setCurrentPage(page)
        }
    }, [totalPages])

    const handleSetItemsPerPage = useCallback((items: number) => {
        setItemsPerPage(items)
        setCurrentPage(1)
    }, [])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter, searchQuery])

    return {
        services,
        loading,

        currentPage,
        totalPages,
        totalElements,
        itemsPerPage,
        setCurrentPage: handleSetCurrentPage,
        setItemsPerPage: handleSetItemsPerPage,

        sortField,
        sortDirection,
        handleSort,

        statusFilter,
        setStatusFilter,

        fetchServices,
    }
}
