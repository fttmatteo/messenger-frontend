import { renderHook, act, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { useServices } from "../use-services"
import { serviceDeliveryService } from "@/services/service.service"
import { showToast } from "@/config/toast-config"

vi.mock("@/services/service.service", () => ({
    serviceDeliveryService: {
        getAllPaginated: vi.fn()
    }
}))

vi.mock("@/config/toast-config", () => ({
    showToast: {
        error: vi.fn()
    }
}))

import type { ServiceDelivery } from "@/types/service.types"

const mockService: ServiceDelivery = {
    idServiceDelivery: 1,
    uuid: 'service-uuid-1',
    plate: { idPlate: 1, plateNumber: 'ABC123', plateType: 'CAR' },
    dealership: { idDealership: 1, uuid: 'dealer-uuid-1', name: 'Test', address: 'Add', phone: '123', zone: 'Z' },
    originDealership: { idDealership: 2, uuid: 'dealer-uuid-2', name: 'Origin Test', address: 'Origin Add', phone: '456', zone: 'OZ' },
    currentStatus: 'PENDING',
    photos: [],
    history: [],
    createdAt: new Date().toISOString()
}

const mockPaginatedResponse = {
    content: [mockService],
    currentPage: 0,
    pageSize: 10,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true
}

describe("useServices", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(serviceDeliveryService.getAllPaginated).mockResolvedValue(mockPaginatedResponse)
    })

    it("should fetch services on mount", async () => {
        const { result } = renderHook(() => useServices())

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.services).toHaveLength(1)
        expect(serviceDeliveryService.getAllPaginated).toHaveBeenCalledWith(expect.objectContaining({
            page: 0,
            size: 10
        }))
    })

    it("should handle pagination", async () => {
        vi.mocked(serviceDeliveryService.getAllPaginated).mockResolvedValue({
            ...mockPaginatedResponse,
            totalPages: 5,
            totalElements: 50
        })

        const { result } = renderHook(() => useServices())

        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.setCurrentPage(2)
        })

        expect(result.current.currentPage).toBe(2)

        await waitFor(() => {
            expect(serviceDeliveryService.getAllPaginated).toHaveBeenLastCalledWith(expect.objectContaining({
                page: 1
            }))
        })
    })

    it("should not set page out of bounds", async () => {
        vi.mocked(serviceDeliveryService.getAllPaginated).mockResolvedValue({
            ...mockPaginatedResponse,
            totalPages: 2
        })

        const { result } = renderHook(() => useServices())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.setCurrentPage(3)
        })
        expect(result.current.currentPage).toBe(1)

        act(() => {
            result.current.setCurrentPage(0)
        })
        expect(result.current.currentPage).toBe(1)
    })

    it("should carry sorting and items per page correctly", async () => {
        const { result } = renderHook(() => useServices())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.setItemsPerPage(25)
        })
        expect(result.current.itemsPerPage).toBe(25)
        expect(result.current.currentPage).toBe(1)

        await waitFor(() => {
            expect(serviceDeliveryService.getAllPaginated).toHaveBeenLastCalledWith(expect.objectContaining({
                size: 25
            }))
        })
    })

    it("should toggle sorting states", async () => {
        const { result } = renderHook(() => useServices())
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.sortField).toBe("createdAt")
        expect(result.current.sortDirection).toBe("desc")

        act(() => {
            result.current.handleSort("plate")
        })
        expect(result.current.sortField).toBe("plate")
        expect(result.current.sortDirection).toBe("asc")

        act(() => {
            result.current.handleSort("plate")
        })
        expect(result.current.sortField).toBe("plate")
        expect(result.current.sortDirection).toBe("desc")

        act(() => {
            result.current.handleSort("plate")
        })
        expect(result.current.sortField).toBe(null)
        expect(result.current.sortDirection).toBe("desc")
    })

    it("should search and filter by status", async () => {
        const { result, rerender } = renderHook(({ search }) => useServices({ searchQuery: search }), {
            initialProps: { search: "initial" }
        })

        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.setStatusFilter(["PENDING"])
        })

        expect(result.current.statusFilter).toEqual(["PENDING"])

        await waitFor(() => {
            expect(serviceDeliveryService.getAllPaginated).toHaveBeenLastCalledWith(expect.objectContaining({
                status: ["PENDING"],
                search: "initial"
            }))
        })

        rerender({ search: "new" })
        await waitFor(() => {
            expect(serviceDeliveryService.getAllPaginated).toHaveBeenLastCalledWith(expect.objectContaining({
                search: "new"
            }))
        })
    })

    it("should show error toast on API failure", async () => {
        vi.mocked(serviceDeliveryService.getAllPaginated).mockRejectedValue(new Error("Network Error"))

        const { result } = renderHook(() => useServices())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(showToast.error).toHaveBeenCalledWith("Error al cargar servicios", expect.any(Object))
        })
    })
})
