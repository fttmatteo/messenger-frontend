import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMemo } from 'react'
import { useDataList } from './use-data-list'

interface TestItem {
    id: number
    name: string
    value: number
    nested: {
        property: string
    }
}

const createTestData = (): TestItem[] => [
    { id: 1, name: 'Apple', value: 30, nested: { property: 'A' } },
    { id: 2, name: 'Banana', value: 10, nested: { property: 'B' } },
    { id: 3, name: 'Cherry', value: 20, nested: { property: 'C' } },
    { id: 4, name: 'Date', value: 40, nested: { property: 'D' } },
    { id: 5, name: 'Elderberry', value: 50, nested: { property: 'E' } },
]

/**
 * Suite de pruebas para el hook personalizado useDataList.
 * Evalúa las funcionalidades de filtrado basado en búsqueda, filtros personalizados,
 * ordenación ascendente/descendente (incluyendo propiedades anidadas) y paginación reactiva.
 */
describe('useDataList', () => {
    describe('filtrado', () => {
        it('debe devolver todos los datos cuando no se proporciona una consulta de búsqueda', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: (item, query) => item.name.toLowerCase().includes(query),
                })
            )

            expect(result.current.filteredAndSortedData).toHaveLength(5)
        })

        it('debe filtrar los datos basándose en la consulta de búsqueda', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: 'apple',
                    searchFilter: (item, query) => item.name.toLowerCase().includes(query),
                })
            )

            expect(result.current.filteredAndSortedData).toHaveLength(1)
            expect(result.current.filteredAndSortedData[0].name).toBe('Apple')
        })

        it('debe aplicar el filtro personalizado junto con el filtro de búsqueda', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: (item, query) => item.name.toLowerCase().includes(query),
                    customFilter: (item) => item.value > 25,
                })
            )

            expect(result.current.filteredAndSortedData).toHaveLength(3)
            expect(result.current.filteredAndSortedData.every(item => item.value > 25)).toBe(true)
        })
    })

    describe('ordenación', () => {
        it('debe ordenar los datos en orden ascendente', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    defaultSortField: 'value',
                    defaultSortDirection: 'asc',
                })
            )

            const values = result.current.filteredAndSortedData.map(item => item.value)
            expect(values).toEqual([10, 20, 30, 40, 50])
        })

        it('debe ordenar los datos en orden descendente', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    defaultSortField: 'value',
                    defaultSortDirection: 'desc',
                })
            )

            const values = result.current.filteredAndSortedData.map(item => item.value)
            expect(values).toEqual([50, 40, 30, 20, 10])
        })

        it('debe usar un resolvedor de ordenación personalizado para propiedades anidadas', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    defaultSortField: 'nestedProp',
                    defaultSortDirection: 'asc',
                    sortValueResolvers: {
                        nestedProp: (item) => item.nested.property,
                    },
                })
            )

            const props = result.current.filteredAndSortedData.map(item => item.nested.property)
            expect(props).toEqual(['A', 'B', 'C', 'D', 'E'])
        })

        it('debe alternar la dirección de ordenación cuando se hace clic en el mismo campo', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    defaultSortField: 'value',
                    defaultSortDirection: 'asc',
                })
            )

            expect(result.current.sortDirection).toBe('asc')

            act(() => {
                result.current.handleSort('value')
            })
            expect(result.current.sortDirection).toBe('desc')

            act(() => {
                result.current.handleSort('value')
            })
            expect(result.current.sortField).toBeNull()
        })

        it('debe reiniciar a asc cuando se ordena por un nuevo campo', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    defaultSortField: 'value',
                    defaultSortDirection: 'desc',
                })
            )

            act(() => {
                result.current.handleSort('name')
            })

            expect(result.current.sortField).toBe('name')
            expect(result.current.sortDirection).toBe('asc')
        })
    })

    describe('paginación', () => {
        it('debe paginar los datos correctamente', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    initialItemsPerPage: 2,
                })
            )

            expect(result.current.paginatedData).toHaveLength(2)
            expect(result.current.totalPages).toBe(3)
            expect(result.current.currentPage).toBe(1)
        })

        it('debe cambiar de página correctamente', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    initialItemsPerPage: 2,
                })
            )

            act(() => {
                result.current.setCurrentPage(2)
            })

            expect(result.current.currentPage).toBe(2)
            expect(result.current.paginatedData).toHaveLength(2)
        })

        it('debe reiniciar a la página 1 cuando cambia la consulta de búsqueda', () => {
            const data = createTestData()
            let searchQuery = ''

            const { result, rerender } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery,
                    searchFilter: (item, query) => item.name.toLowerCase().includes(query),
                    initialItemsPerPage: 2,
                })
            )

            act(() => {
                result.current.setCurrentPage(2)
            })
            expect(result.current.currentPage).toBe(2)

            searchQuery = 'a'
            rerender()

            expect(result.current.currentPage).toBe(1)
        })

        it('debe actualizar los ítems por página', () => {
            const data = createTestData()
            const { result } = renderHook(() =>
                useDataList({
                    data,
                    searchQuery: '',
                    searchFilter: () => true,
                    initialItemsPerPage: 2,
                })
            )

            act(() => {
                result.current.setItemsPerPage(5)
            })

            expect(result.current.itemsPerPage).toBe(5)
            expect(result.current.paginatedData).toHaveLength(5)
            expect(result.current.totalPages).toBe(1)
        })

        it('debe reiniciar a la página 1 cuando cambia customFilter', () => {
            const data = createTestData()

            const { result, rerender } = renderHook(
                ({ filterVal }) => {
                    const customFilter = useMemo(() => (item: TestItem) => item.value > filterVal, [filterVal])
                    return useDataList({
                        data,
                        searchQuery: '',
                        searchFilter: () => true,
                        customFilter,
                        initialItemsPerPage: 2,
                    })
                },
                {
                    initialProps: { filterVal: 0 }
                }
            )

            act(() => {
                result.current.setCurrentPage(2)
            })
            expect(result.current.currentPage).toBe(2)

            rerender({ filterVal: 25 })

            expect(result.current.currentPage).toBe(1)
        })
    })
})
