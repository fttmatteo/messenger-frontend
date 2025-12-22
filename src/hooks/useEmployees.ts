import { useEffect, useState, useCallback } from "react"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
import { toast } from "sonner"
import { useDataList } from "@/hooks/useDataList"

// Type Definitions
type SortDirection = "asc" | "desc"
type RoleFilter = "all" | "ADMIN" | "MESSENGER"

interface UseEmployeesOptions {
    searchQuery: string
}

interface UseEmployeesReturn {
    // Data
    employees: Employee[]
    loading: boolean
    filteredAndSortedEmployees: Employee[]
    paginatedEmployees: Employee[]

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
    roleFilter: RoleFilter
    setRoleFilter: (filter: RoleFilter) => void

    // Actions
    fetchEmployees: () => Promise<void>
}

/**
 * Custom hook for managing employees list state, filtering, sorting, and pagination.
 * Centralizes all data management logic from the Empleados page.
 */
export function useEmployees({ searchQuery }: UseEmployeesOptions): UseEmployeesReturn {
    // Core state
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")

    // Search Filter Logic
    const searchFilter = useCallback((employee: Employee, query: string) => {
        return (
            employee.fullName.toLowerCase().includes(query) ||
            String(employee.document).includes(query) ||
            employee.phone.includes(query) ||
            employee.role.toLowerCase().includes(query)
        )
    }, [])

    // Custom Filter Logic (Role)
    const customFilter = useCallback((employee: Employee) => {
        if (roleFilter !== "all" && employee.role !== roleFilter) {
            return false
        }
        return true
    }, [roleFilter])

    // Sort Resolvers
    const sortValueResolvers = {
        "fullName": (e: Employee) => e.fullName,
        "role": (e: Employee) => e.role,
        "document": (e: Employee) => String(e.document)
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
    } = useDataList<Employee>({
        data: employees,
        searchQuery,
        searchFilter,
        customFilter,
        sortValueResolvers,
        defaultSortField: null,
        initialItemsPerPage: 10
    })

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const data = await employeeService.getAll()
            setEmployees(data)
        } catch (error: any) {
            toast.error("Error al cargar empleados", {
                description: error.message,
                id: "error-cargar-empleados"
            })
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchEmployees()
    }, [])

    return {
        // Data
        employees,
        loading,
        filteredAndSortedEmployees: filteredAndSortedData,
        paginatedEmployees: paginatedData,

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
        roleFilter,
        setRoleFilter,

        // Actions
        fetchEmployees,
    }
}
