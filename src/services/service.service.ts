import apiClient from './api-client'
import type { ServiceDelivery, CreateServiceRequest, UpdateServiceStatusRequest } from '@/types/service.types'

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
     * Get service by ID
     * Validates ownership for MESSENGER role
     */
    async getById(id: number): Promise<ServiceDelivery> {
        const response = await apiClient.get(`/services/findService/${id}`)
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

        const response = await apiClient.put(`/services/updateServiceStatus/${id}`, formData)
        return response.data
    }

    /**
     * Delete service (admin only)
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/services/deleteService/${id}`)
    }
}

export const serviceDeliveryService = new ServiceDeliveryService()
