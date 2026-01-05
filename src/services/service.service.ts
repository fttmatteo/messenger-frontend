import apiClient from './api-client'
import type { ServiceDelivery, CreateServiceRequest, UpdateServiceStatusRequest, DailyStats, PaginatedResponse, ServiceStatus } from '@/types/service.types'

class ServiceDeliveryService {
    /**
     * Get all services (filtered by role automatically in backend)
     * ADMIN: gets all services
     * MESSENGER: gets only assigned services
     */
    async getAll(): Promise<ServiceDelivery[]> {
        const response = await apiClient.get('/services/allServices')
        return response.data
    }

    /**
     * Get all services with pagination
     * ADMIN: gets all services
     * MESSENGER: gets only assigned services
     */
    async getAllPaginated(params: {
        page?: number
        size?: number
        sortBy?: string
        sortDirection?: 'asc' | 'desc'
        status?: ServiceStatus[]
        search?: string
    } = {}): Promise<PaginatedResponse<ServiceDelivery>> {
        const response = await apiClient.get('/services/allServicesPageable', {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy ?? 'createdAt',
                sortDirection: params.sortDirection ?? 'desc',
                status: params.status?.join(','),
                search: params.search
            }
        })
        return response.data
    }

    /**
     * Get service by ID
     * Validates ownership for MESSENGER role
     */
    async getById(id: number): Promise<ServiceDelivery> {
        const response = await apiClient.get(`/services/findByServiceId/${id}`)
        return response.data
    }

    /**
     * Create new service with image
     * Supports OCR or manual plate entry
     */
    async create(request: CreateServiceRequest): Promise<ServiceDelivery> {
        const formData = new FormData()
        formData.append('image', request.image)
        formData.append('dealershipId', request.dealershipId)

        if (request.messengerDocument) {
            formData.append('messengerDocument', request.messengerDocument)
        }

        if (request.manualPlateNumber) {
            formData.append('manualPlateNumber', request.manualPlateNumber)
        }

        if (request.latitude) {
            formData.append('latitude', request.latitude.toString())
        }

        if (request.longitude) {
            formData.append('longitude', request.longitude.toString())
        }

        const response = await apiClient.post('/services/createService', formData)
        return response.data
    }

    /**
     * Update service status with evidence
     * Required evidence varies by target status
     */
    async updateStatus(id: number, request: UpdateServiceStatusRequest): Promise<ServiceDelivery> {
        const formData = new FormData()
        formData.append('status', request.status)

        if (request.observation) {
            formData.append('observation', request.observation)
        }

        if (request.signature) {
            formData.append('signature', request.signature)
        }

        if (request.photos && request.photos.length > 0) {
            request.photos.forEach(photo => {
                formData.append('photos', photo)
            })
        }

        if (request.latitude) {
            formData.append('latitude', request.latitude.toString())
        }

        if (request.longitude) {
            formData.append('longitude', request.longitude.toString())
        }

        const response = await apiClient.put(`/services/updateService/${id}`, formData)
        return response.data
    }

    /**
     * Delete service (admin only)
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/services/deleteService/${id}`)
    }

    /**
     * Get all deleted services (trash) - Admin only
     */
    async getTrash(): Promise<ServiceDelivery[]> {
        const response = await apiClient.get('/services/trash')
        return response.data
    }

    /**
     * Restore a service from trash - Admin only
     */
    async restore(id: number): Promise<ServiceDelivery> {
        const response = await apiClient.post(`/services/trash/restore/${id}`)
        return response.data
    }

    /**
     * Empty trash permanently deleting all services - Admin only
     */
    async emptyTrash(): Promise<{ message: string; deletedCount: number }> {
        const response = await apiClient.delete('/services/trash/empty')
        return response.data
    }

    /**
     * Permanently delete a single service from trash - Admin only
     */
    async permanentDelete(id: number): Promise<{ message: string }> {
        const response = await apiClient.delete(`/services/trash/${id}`)
        return response.data
    }

    /**
     * Reassign a service to another messenger - Admin only
     * Only allowed when service is in CANCELED status
     */
    async reassign(id: number, messengerId: number): Promise<ServiceDelivery> {
        const response = await apiClient.put(`/services/reassign/${id}`, { messengerId })
        return response.data
    }

    /**
     * Get daily statistics for a messenger
     */
    async getDailyStats(messengerId: number, from: Date, to: Date): Promise<DailyStats[]> {
        const fromDate = from.toISOString().split('T')[0]
        const toDate = to.toISOString().split('T')[0]
        const response = await apiClient.get('/services/stats/daily', {
            params: {
                messengerId,
                from: fromDate,
                to: toDate
            }
        })
        return response.data
    }
}

export const serviceDeliveryService = new ServiceDeliveryService()
