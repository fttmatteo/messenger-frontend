import axios from 'axios'
import type { ServiceDelivery, CreateServiceRequest, UpdateServiceStatusRequest } from '@/types/service.types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

class ServiceDeliveryService {
    private getAuthHeader() {
        const token = localStorage.getItem('token')
        return {
            'Authorization': `Bearer ${token}`
        }
    }

    /**
     * Get all services (filtered by role automatically in backend)
     * ADMIN: gets all services
     * MESSENGER: gets only assigned services
     */
    async getAll(): Promise<ServiceDelivery[]> {
        const response = await axios.get(`${API_URL}/services/allServices`, {
            headers: this.getAuthHeader()
        })
        return response.data
    }

    /**
     * Get service by ID
     * Validates ownership for MESSENGER role
     */
    async getById(id: number): Promise<ServiceDelivery> {
        const response = await axios.get(`${API_URL}/services/findService/${id}`, {
            headers: this.getAuthHeader()
        })
        return response.data
    }

    /**
     * Create new service with image
     * Supports OCR or manual plate entry
     */
    async create(request: CreateServiceRequest): Promise<void> {
        const formData = new FormData()
        formData.append('image', request.image)
        formData.append('dealershipId', request.dealershipId)

        if (request.messengerDocument) {
            formData.append('messengerDocument', request.messengerDocument)
        }

        if (request.manualPlateNumber) {
            formData.append('manualPlateNumber', request.manualPlateNumber)
        }

        await axios.post(`${API_URL}/services/createService`, formData, {
            headers: {
                ...this.getAuthHeader(),
                // Don't set Content-Type, axios will set it with boundary
            }
        })
    }

    /**
     * Update service status with evidence
     * Required evidence varies by target status
     */
    async updateStatus(id: number, request: UpdateServiceStatusRequest): Promise<void> {
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

        await axios.put(`${API_URL}/services/updateServiceStatus/${id}`, formData, {
            headers: {
                ...this.getAuthHeader(),
                // Don't set Content-Type, axios will set it with boundary
            }
        })
    }

    /**
     * Delete service (admin only)
     */
    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/services/deleteService/${id}`, {
            headers: this.getAuthHeader()
        })
    }
}

export const serviceDeliveryService = new ServiceDeliveryService()
