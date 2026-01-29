import { useEffect, useState, useCallback } from "react"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
import { showToast } from "@/config/toast-config"
import { useDataList } from "@/hooks/use-data-list"
import { getErrorMessage } from "@/lib/error-utils"

type SortDirection = "asc" | "desc"
type RoleFilter = "all" | "ADMIN" | "MESSENGER"

interface UseEmployeesOptions {
    searchQuery: string
}

interface UseEmployeesReturn {
    employees: Employee[]
    loading: boolean
    filteredAndSortedEmployees: Employee[]
    paginatedEmployees: Employee[]
    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

    roleFilter: RoleFilter
    setRoleFilter: (filter: RoleFilter) => void

    fetchEmployees: () => Promise<void>
}

/**
 * Hook para gestionar y filtrar la lista de empleados.
 * Proporciona funcionalidades de búsqueda, filtrado por rol y ordenación.
 */
export function useEmployees({ searchQuery }: UseEmployeesOptions): UseEmployeesReturn {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")

    const searchFilter = useCallback((employee: Employee, query: string) => {
        return (
            employee.fullName.toLowerCase().includes(query) ||
            String(employee.document).includes(query) ||
            employee.phone.includes(query) ||
            employee.role.toLowerCase().includes(query)
        )
    }, [])

    const customFilter = useCallback((employee: Employee) => {
        if (roleFilter !== "all" && employee.role !== roleFilter) {
            return false
        }
        return true
    }, [roleFilter])

    const sortValueResolvers = {
        "fullName": (e: Employee) => e.fullName,
        "role": (e: Employee) => e.role,
        "document": (e: Employee) => String(e.document)
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
    } = useDataList<Employee>({
        data: employees,
        searchQuery,
        searchFilter,
        customFilter,
        sortValueResolvers,
        defaultSortField: null,
        initialItemsPerPage: 10
    })

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const data = await employeeService.getAll()
            setEmployees(data)
        } catch (error) {
            showToast.error("Error al cargar empleados", {
                description: getErrorMessage(error)
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    return {
        employees,
        loading,
        filteredAndSortedEmployees: filteredAndSortedData,
        paginatedEmployees: paginatedData,

        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,

        sortField,
        sortDirection,
        handleSort,

        roleFilter,
        setRoleFilter,

        fetchEmployees,
    }
}
