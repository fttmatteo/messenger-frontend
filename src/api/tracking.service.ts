/**
 * Servicio API de Tracking
 * 
 * Funciones para comunicarse con el backend:
 * - POST /api/tracking/update - Actualizar ubicación
 * - GET /api/tracking/messenger/{id} - Última ubicación
 * - GET /api/tracking/active - Mensajeros activos
 * - GET /api/tracking/history/{id} - Historial
 * - GET /api/tracking/service/{id} - Historial por servicio
 */

import axiosClient from '@/config/axios-client'
import { LocationUpdate, ActiveMessenger, LocationHistory } from '@/types'

/**
 * Base URL para endpoints de tracking
 */
const TRACKING_URL = '/api/tracking'

/**
 * Actualiza la ubicación de un mensajero
 * @param data - Datos de ubicación
 */
export async function updateLocation(data: LocationUpdate): Promise<void> {
    await axiosClient.post(`${TRACKING_URL}/update`, data)
}

/**
 * Obtiene la última ubicación de un mensajero
 * @param messengerId - ID del mensajero
 */
export async function getLastLocation(messengerId: number): Promise<ActiveMessenger> {
    const response = await axiosClient.get<ActiveMessenger>(`${TRACKING_URL}/messenger/${messengerId}`)
    return response.data
}

/**
 * Obtiene todos los mensajeros activos con su ubicación
 */
export async function getActiveMessengers(): Promise<ActiveMessenger[]> {
    const response = await axiosClient.get<ActiveMessenger[]>(`${TRACKING_URL}/active`)
    return response.data
}

/**
 * Obtiene el historial de ubicaciones de un mensajero en una fecha
 * @param messengerId - ID del mensajero
 * @param date - Fecha en formato YYYY-MM-DD
 */
export async function getLocationHistory(messengerId: number, date: string): Promise<LocationHistory[]> {
    const response = await axiosClient.get<LocationHistory[]>(`${TRACKING_URL}/history/${messengerId}`, {
        params: { date }
    })
    return response.data
}

/**
 * Obtiene el historial de ubicaciones asociado a un servicio
 * @param serviceId - ID del servicio
 */
export async function getServiceLocationHistory(serviceId: number): Promise<LocationHistory[]> {
    const response = await axiosClient.get<LocationHistory[]>(`${TRACKING_URL}/service/${serviceId}`)
    return response.data
}
