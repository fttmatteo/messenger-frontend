import { useEffect, useState, useMemo } from "react"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
import { toast } from "sonner"

// Type Definitions
type SortField = "fullName" | "role" | "document" | null
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
    sortField: SortField
    sortDirection: SortDirection
    handleSort: (field: SortField) => void

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

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")

    // Filter and sort employees
    const filteredAndSortedEmployees = useMemo(() => {
        let result = employees.filter((employee) => {
            // Search filter
            const query = searchQuery.toLowerCase()
            const matchesSearch = !searchQuery.trim() ||
                employee.fullName.toLowerCase().includes(query) ||
                employee.userName.toLowerCase().includes(query) ||
                String(employee.document).includes(query) ||
                employee.phone.includes(query) ||
                employee.role.toLowerCase().includes(query)

            if (!matchesSearch) return false

            // Role filter
            if (roleFilter !== "all" && employee.role !== roleFilter) {
                return false
            }

            return true
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "fullName":
                        comparison = a.fullName.localeCompare(b.fullName)
                        break
                    case "role":
                        comparison = a.role.localeCompare(b.role)
                        break
                    case "document":
                        comparison = String(a.document).localeCompare(String(b.document))
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [employees, searchQuery, roleFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage)
    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedEmployees.slice(start, start + itemsPerPage)
    }, [filteredAndSortedEmployees, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, roleFilter, itemsPerPage])

    // Sorting handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

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
        filteredAndSortedEmployees,
        paginatedEmployees,

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
