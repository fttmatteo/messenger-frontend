/**
 * Servicio API de Concesionarios
 * 
 * Funciones para comunicarse con el backend:
 * - GET /dealerships
 * - GET /dealerships/{id}
 * - POST /dealerships
 * - PUT /dealerships/{id}
 * - DELETE /dealerships/{id}
 * - POST /dealerships/{id}/geocode
 */

import axiosClient from '@/config/axios-client'
import { Dealership, CreateDealershipRequest, UpdateDealershipRequest } from '@/types'

/**
 * Base URL para endpoints de concesionarios
 */
const DEALERSHIPS_URL = '/dealerships'

/**
 * Obtiene todos los concesionarios
 * @returns Lista de concesionarios
 */
export async function getDealerships(): Promise<Dealership[]> {
    const response = await axiosClient.get<Dealership[]>(DEALERSHIPS_URL)
    return response.data
}

/**
 * Obtiene un concesionario por ID
 * @param id - ID del concesionario
 * @returns Concesionario encontrado
 */
export async function getDealershipById(id: number): Promise<Dealership> {
    const response = await axiosClient.get<Dealership>(`${DEALERSHIPS_URL}/${id}`)
    return response.data
}

/**
 * Crea un nuevo concesionario
 * @param data - Datos del concesionario
 * @returns Concesionario creado
 */
export async function createDealership(data: CreateDealershipRequest): Promise<Dealership> {
    const response = await axiosClient.post<Dealership>(`${DEALERSHIPS_URL}/create`, data)
    return response.data
}

/**
 * Actualiza un concesionario existente
 * @param id - ID del concesionario
 * @param data - Datos actualizados
 * @returns Concesionario actualizado
 */
export async function updateDealership(id: number, data: UpdateDealershipRequest): Promise<Dealership> {
    const response = await axiosClient.put<Dealership>(`${DEALERSHIPS_URL}/${id}`, data)
    return response.data
}

/**
 * Elimina un concesionario
 * @param id - ID del concesionario a eliminar
 */
export async function deleteDealership(id: number): Promise<void> {
    await axiosClient.delete(`${DEALERSHIPS_URL}/${id}`)
}

/**
 * Geocodifica la dirección de un concesionario
 * Obtiene las coordenadas GPS a partir de la dirección
 * @param id - ID del concesionario
 * @returns Concesionario con coordenadas actualizadas
 */
export async function geocodeDealership(id: number): Promise<Dealership> {
    const response = await axiosClient.post<Dealership>(`${DEALERSHIPS_URL}/${id}/geocode`)
    return response.data
}
