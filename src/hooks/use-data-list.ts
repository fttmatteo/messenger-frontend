import { useState, useMemo, useEffect } from "react"

export type SortDirection = "asc" | "desc"

type ComparableValue = string | number | boolean | Date | null | undefined

export interface UseDataListOptions<T> {
    data: T[]
    searchQuery: string
    /**
     * Función para verificar si un ítem coincide con la consulta de búsqueda.
     * Devuelve true si coincide, false en caso contrario.
     */
    searchFilter: (item: T, query: string) => boolean
    /**
     * Función de filtrado personalizada opcional para filtrado adicional (ej. por estado o rol).
     * Devuelve true si coincide, false en caso contrario.
     */
    customFilter?: (item: T) => boolean
    /**
     * Mapa de campos de ordenación a funciones que devuelven el valor por el cual ordenar.
     * Use esto para propiedades anidadas o lógica de ordenación personalizada.
     * Ejemplo: { 'plateNumber': (item) => item.plate.plateNumber }
     */
    sortValueResolvers?: Record<string, (item: T) => ComparableValue>
    initialItemsPerPage?: number
    defaultSortField?: string | null
    defaultSortDirection?: SortDirection
}

export interface UseDataListReturn<T> {
    // Datos Procesados
    filteredAndSortedData: T[]
    paginatedData: T[]

    // Paginación
    currentPage: number
    totalPages: number
    itemsPerPage: number
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void

    // Ordenación
    sortField: string | null
    sortDirection: SortDirection
    handleSort: (field: string) => void

    // Setters de Ordenación Explícitos
    setSortField: (field: string | null) => void
    setSortDirection: (direction: SortDirection) => void
}

/**
 * Hook genérico para gestionar filtrado, ordenación y paginación en el lado del cliente.
 */
export function useDataList<T>({
    data,
    searchQuery,
    searchFilter,
    customFilter,
    sortValueResolvers = {},
    initialItemsPerPage = 10,
    defaultSortField = null,
    defaultSortDirection = "asc"
}: UseDataListOptions<T>): UseDataListReturn<T> {
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection)


    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)


    const filteredAndSortedData = useMemo(() => {
        let result = data.filter((item) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                if (!searchFilter(item, query)) {
                    return false
                }
            }

            if (customFilter && !customFilter(item)) {
                return false
            }

            return true
        })

        if (sortField) {
            const resolver = sortValueResolvers[sortField] ||
                ((item: T) => item[sortField as keyof T])

            result = [...result].sort((a, b) => {
                const valA = resolver(a)
                const valB = resolver(b)

                if (valA == null && valB == null) return 0
                if (valA == null) return 1
                if (valB == null) return -1

                let comparison = 0

                if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB)
                } else if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime()
                } else {
                    if (valA < valB) comparison = -1
                    if (valA > valB) comparison = 1
                }

                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [data, searchQuery, sortField, sortDirection, searchFilter, customFilter, sortValueResolvers])


    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedData.slice(start, start + itemsPerPage)
    }, [filteredAndSortedData, currentPage, itemsPerPage])

    useEffect(() => {
        // eslint-disable-next-line
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, itemsPerPage, customFilter])

    const handleSort = (field: string) => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else {
                setSortField(null)
                setSortDirection("asc") // Reiniciar dirección para el siguiente uso
            }
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    return {
        filteredAndSortedData,
        paginatedData,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort,
        setSortField,
        setSortDirection
    }
}
