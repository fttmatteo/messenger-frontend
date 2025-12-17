/**
 * Servicio API de Service Delivery (Entregas)
 * 
 * Funciones para comunicarse con el backend:
 * - GET /services - Listar entregas
 * - GET /services/{id} - Obtener por ID
 * - POST /services/create - Crear con imagen (OCR)
 * - PUT /services/{id}/status - Cambiar estado
 * - GET /services/messenger/{document} - Por mensajero
 * - GET /services/status/{status} - Por estado
 * - POST /services/{id}/complete - Marcar como completada
 * - PUT /services/{id}/observations - Agregar observaciones
 */

import axiosClient from '@/config/axios-client'
import { 
    ServiceDelivery, 
    CreateServiceRequest, 
    UpdateServiceStatusRequest,
    UpdateObservationsRequest,
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
    const response = await axiosClient.get<ServiceDelivery[]>(SERVICES_URL)
    return response.data
}

/**
 * Obtiene una entrega por ID
 * @param id - ID de la entrega
 * @returns Entrega encontrada
 */
export async function getServiceById(id: number): Promise<ServiceDelivery> {
    const response = await axiosClient.get<ServiceDelivery>(`${SERVICES_URL}/${id}`)
    return response.data
}

/**
 * Obtiene entregas por estado
 * @param status - Estado a filtrar
 * @returns Lista de entregas con ese estado
 */
export async function getServicesByStatus(status: ServiceStatus): Promise<ServiceDelivery[]> {
    const response = await axiosClient.get<ServiceDelivery[]>(`${SERVICES_URL}/status/${status}`)
    return response.data
}

/**
 * Obtiene entregas asignadas a un mensajero
 * @param document - Documento del mensajero
 * @returns Lista de entregas del mensajero
 */
export async function getServicesByMessenger(document: string): Promise<ServiceDelivery[]> {
    const response = await axiosClient.get<ServiceDelivery[]>(`${SERVICES_URL}/messenger/${document}`)
    return response.data
}

/**
 * Crea una nueva entrega con imagen de placa (OCR)
 * @param data - Datos de la entrega incluyendo imagen
 * @returns Entrega creada (con placa extraída por OCR)
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
 * @param data - Nuevo estado
 * @returns Entrega actualizada
 */
export async function updateServiceStatus(id: number, data: UpdateServiceStatusRequest): Promise<ServiceDelivery> {
    const response = await axiosClient.put<ServiceDelivery>(`${SERVICES_URL}/${id}/status`, data)
    return response.data
}

/**
 * Marca una entrega como completada
 * @param id - ID de la entrega
 * @returns Entrega completada
 */
export async function completeService(id: number): Promise<ServiceDelivery> {
    const response = await axiosClient.post<ServiceDelivery>(`${SERVICES_URL}/${id}/complete`)
    return response.data
}

/**
 * Agrega observaciones a una entrega
 * @param id - ID de la entrega
 * @param data - Observaciones
 * @returns Entrega actualizada
 */
export async function updateObservations(id: number, data: UpdateObservationsRequest): Promise<ServiceDelivery> {
    const response = await axiosClient.put<ServiceDelivery>(`${SERVICES_URL}/${id}/observations`, data)
    return response.data
}
