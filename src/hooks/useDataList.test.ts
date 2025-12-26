import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDataList } from './useDataList'

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

describe('useDataList', () => {
    describe('filtering', () => {
        it('should return all data when no search query is provided', () => {
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

        it('should filter data based on search query', () => {
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

        it('should apply custom filter along with search filter', () => {
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

    describe('sorting', () => {
        it('should sort data in ascending order', () => {
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

        it('should sort data in descending order', () => {
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

        it('should use custom sort resolver for nested properties', () => {
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

        it('should toggle sort direction when same field is clicked', () => {
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

            // Initial: asc
            expect(result.current.sortDirection).toBe('asc')

            // Click same field: should become desc
            act(() => {
                result.current.handleSort('value')
            })
            expect(result.current.sortDirection).toBe('desc')

            // Click again: should clear sort
            act(() => {
                result.current.handleSort('value')
            })
            expect(result.current.sortField).toBeNull()
        })

        it('should reset to asc when sorting by a new field', () => {
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

    describe('pagination', () => {
        it('should paginate data correctly', () => {
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

        it('should change page correctly', () => {
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

        it('should reset to page 1 when search query changes', () => {
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

            // Go to page 2
            act(() => {
                result.current.setCurrentPage(2)
            })
            expect(result.current.currentPage).toBe(2)

            // Change search query
            searchQuery = 'a'
            rerender()

            // Should reset to page 1
            expect(result.current.currentPage).toBe(1)
        })

        it('should update items per page', () => {
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
    })
})
