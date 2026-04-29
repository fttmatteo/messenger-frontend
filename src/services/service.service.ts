import { z } from 'zod'
import apiClient from './api-client'
import type { ServiceDelivery, CreateServiceRequest, UpdateServiceStatusRequest, DailyStats, PaginatedResponse, ServiceStatus } from '@/types/service.types'
import { ServiceDeliverySchema, PaginatedSchema } from '@/schemas/api-schemas'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ServiceDelivery')

/**
 * Servicio encargado de la gestión integral de las entregas de placas.
 * Centraliza las operaciones CRUD, la lógica de actualización de estados con evidencias,
 * y la administración de la papelera de servicios para roles administrativos.
 */
class ServiceDeliveryService {
    /**
     * @deprecated El endpoint /services/allServices ha sido eliminado del backend por rendimiento.
     * Usar getAllPaginated en su lugar.
     */
    async getAll(): Promise<ServiceDelivery[]> {
        throw new Error('getAll() IS REMOVED. Use getAllPaginated() instead.')
    }

    /**
     * Recupera servicios con soporte para paginación, ordenamiento y filtrado avanzado.
     * @param params - Objeto con criterios de búsqueda (página, tamaño, estado, término de búsqueda).
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
        return PaginatedSchema(ServiceDeliverySchema).parse(response.data)
    }

    /**
     * Obtiene los detalles de un servicio específico por su UUID.
     * Verifica permisos de propiedad si el usuario es un mensajero.
     * @param uuid - UUID público del servicio.
     */
    async getById(uuid: string): Promise<ServiceDelivery> {
        const response = await apiClient.get(`/services/findByServiceId/${uuid}`)
        return ServiceDeliverySchema.parse(response.data)
    }

    /**
     * Crea un nuevo servicio de entrega.
     * Permite adjuntar una imagen para procesamiento OCR y registrar metadatos iniciales GPS.
     * @param request - Datos del nuevo servicio.
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
        return ServiceDeliverySchema.parse(response.data)
    }

    /**
     * Extrae la placa de una imagen mediante OCR sin crear el servicio.
     * Permite previsualizar la placa detectada y corregirla si es necesario.
     * @param image - Imagen de la placa a procesar
     * @returns Objeto con la placa detectada y estado de éxito
     */
    async extractPlate(image: File): Promise<{ plate: string | null; success: boolean; message: string }> {
        const formData = new FormData()
        formData.append('image', image)

        const response = await apiClient.post('/services/extractPlate', formData)
        return response.data
    }

    /**
     * Actualiza el estado de un servicio capturando evidencias obligatorias.
     * @param uuid - UUID del servicio a actualizar.
     * @param request - Información del nuevo estado y archivos de respaldo.
     */
    async updateStatus(uuid: string, request: UpdateServiceStatusRequest): Promise<ServiceDelivery> {
        const formData = new FormData()
        formData.append('status', request.status)

        if (request.observation) {
            formData.append('observation', request.observation)
        }

        if (request.signature) {
            formData.append('signature', request.signature)
        }

        if (request.signatureGif) {
            formData.append('signatureGif', request.signatureGif)
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

        const response = await apiClient.put(`/services/updateService/${uuid}`, formData)
        return ServiceDeliverySchema.parse(response.data)
    }

    /**
     * Eliminar servicio (solo admin)
     */
    async delete(uuid: string): Promise<void> {
        await apiClient.delete(`/services/deleteService/${uuid}`)
    }

    /**
     * Lista los servicios que han sido marcados como eliminados pero aún están en la papelera.
     * Soporta paginación para eficiencia en administración.
     * Solo accesible por usuarios con rol ADMIN.
     */
    async getTrash(params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ServiceDelivery>> {
        const response = await apiClient.get('/services/trash', {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10
            }
        })
        return PaginatedSchema(ServiceDeliverySchema).parse(response.data)
    }

    /**
     * Restaura un servicio previamente eliminado de la papelera.
     * @param uuid - UUID del servicio a restaurar.
     */
    async restore(uuid: string): Promise<ServiceDelivery> {
        const response = await apiClient.post(`/services/trash/restore/${uuid}`)
        return ServiceDeliverySchema.parse(response.data)
    }

    /**
     * Vaciar papelera eliminando permanentemente todos los servicios - Solo Admin
     */
    async emptyTrash(): Promise<{ message: string; deletedCount: number }> {
        const response = await apiClient.delete('/services/trash/empty')
        return response.data
    }

    /**
     * Eliminar permanentemente un solo servicio de la papelera - Solo Admin
     */
    async permanentDelete(uuid: string): Promise<{ message: string }> {
        const response = await apiClient.delete(`/services/trash/${uuid}`)
        return response.data
    }

    /**
     * Reasignar un servicio a otro mensajero - Solo Admin
     * Solo se permite cuando el servicio está en estado CANCELED
     */
    async reassign(uuid: string, messengerId: number): Promise<ServiceDelivery> {
        const response = await apiClient.put(`/services/reassign/${uuid}`, { messengerId })
        return ServiceDeliverySchema.parse(response.data)
    }

    /**
     * Obtener estadísticas diarias para un mensajero
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
