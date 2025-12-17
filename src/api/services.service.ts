/**
 * Servicio API de Service Delivery (Entregas)
 * 
 * Funciones para comunicarse con el backend:
 * - GET /services/all - Listar entregas
 * - GET /services/find/{id} - Obtener por ID
 * - POST /services/create - Crear con imagen (OCR)
 * - PUT /services/update/{id} - Cambiar estado (status, obs, fotos)
 * - GET /services/find/{messengerId} - Por mensajero (ambiguo en backend, intentamos ID)
 * - GET /services/find/{status} - Por estado
 */

import axiosClient from '@/config/axios-client'
import {
    ServiceDelivery,
    CreateServiceRequest,
    UpdateServiceStatusRequest,
    ServiceStatus
} from '@/types'

/**
 * Base URL para endpoints de entregas
 */
const SERVICES_URL = '/services'

/**
 * Obtiene todas las entregas
 * @returns Lista de entregas
 */
export async function getServices(): Promise<ServiceDelivery[]> {
    const response = await axiosClient.get<ServiceDelivery[]>(`${SERVICES_URL}/all`)
    return response.data
}

/**
 * Obtiene una entrega por ID
 * @param id - ID de la entrega
 * @returns Entrega encontrada
 */
export async function getServiceById(id: number): Promise<ServiceDelivery> {
    const response = await axiosClient.get<ServiceDelivery>(`${SERVICES_URL}/find/${id}`)
    return response.data
}

/**
 * Obtiene entregas por estado
 * @param status - Estado a filtrar
 * @returns Lista de entregas con ese estado
 */
export async function getServicesByStatus(status: ServiceStatus): Promise<ServiceDelivery[]> {
    // Nota: El backend usa /find/{status} que podría conflictuar con ID si no se distingue bien.
    const response = await axiosClient.get<ServiceDelivery[]>(`${SERVICES_URL}/find/${status}`)
    return response.data
}

/**
 * Obtiene entregas asignadas a un mensajero
 * @param messengerId - ID del mensajero (backend pide ID, no documento string en path var)
 * @returns Lista de entregas del mensajero
 */
export async function getServicesByMessenger(messengerId: number): Promise<ServiceDelivery[]> {
    const response = await axiosClient.get<ServiceDelivery[]>(`${SERVICES_URL}/find/${messengerId}`)
    return response.data
}

/**
 * Crea una nueva entrega con imagen de placa (OCR)
 * @param data - Datos de la entrega incluyendo imagen
 * @returns Entrega creada
 */
export async function createService(data: CreateServiceRequest): Promise<ServiceDelivery> {
    const formData = new FormData()
    formData.append('image', data.image)
    formData.append('dealershipId', data.dealershipId.toString())
    if (data.messengerDocument) {
        formData.append('messengerDocument', data.messengerDocument)
    }

    const response = await axiosClient.post<ServiceDelivery>(`${SERVICES_URL}/create`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

/**
 * Actualiza el estado de una entrega
 * @param id - ID de la entrega
 * @param data - Nuevo estado y evidencias (si las hay)
 * @returns Entrega actualizada
 */
export async function updateServiceStatus(id: number, data: UpdateServiceStatusRequest): Promise<ServiceDelivery> {
    const formData = new FormData()
    formData.append('status', data.status)

    if (data.observation) {
        formData.append('observation', data.observation)
    }

    if (data.signature) {
        formData.append('signature', data.signature)
    }

    if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo) => {
            formData.append('photos', photo)
        })
    }

    // El backend usa PUT /services/update/{id}
    const response = await axiosClient.put<ServiceDelivery>(`${SERVICES_URL}/update/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

// Eliminadas querys de observations y complete que no existen en backend
