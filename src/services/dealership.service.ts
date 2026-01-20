import apiClient from './api-client'
import type { Dealership, CreateDealershipRequest, UpdateDealershipRequest } from '@/types/dealership.types'

/**
 * Servicio encargado de la gestión de concesionarios.
 * Proporciona métodos CRUD para administrar los puntos de destino de las entregas,
 * incluyendo la geocodificación de sus direcciones físicas.
 */
export const dealershipService = {
    /**
     * Recupera la lista completa de concesionarios registrados.
     */
    async getAll(): Promise<Dealership[]> {
        const response = await apiClient.get('/dealerships/allDealerships')
        return response.data
    },

    /**
     * Obtiene la información detallada de un concesionario por su ID.
     * @param id - ID único del concesionario.
     */
    async getById(id: number): Promise<Dealership> {
        const response = await apiClient.get(`/dealerships/findByDealershipId/${id}`)
        return response.data
    },

    /**
     * Registra un nuevo concesionario en el sistema.
     * @param data - Datos para la creación del concesionario.
     */
    async create(data: CreateDealershipRequest): Promise<Dealership> {
        const response = await apiClient.post('/dealerships/createDealership', data)
        return response.data
    },

    /**
     * Actualiza la información de un concesionario existente.
     * @param id - ID único del concesionario a actualizar.
     * @param data - Nuevos datos para el concesionario.
     */
    async update(id: number, data: UpdateDealershipRequest): Promise<Dealership> {
        const response = await apiClient.put(`/dealerships/updateDealership/${id}`, data)
        return response.data
    },

    /**
     * Elimina (lógicamente) un concesionario del sistema.
     * @param id - ID único del concesionario a eliminar.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/dealerships/deleteDealership/${id}`)
    },

    /**
     * Ejecuta el proceso de geocodificación para obtener coordenadas GPS a partir de la dirección.
     * @param id - ID único del concesionario a geocodificar.
     */
    async geocode(id: number): Promise<Dealership> {
        const response = await apiClient.post(`/dealerships/geocodeDealership/${id}`)
        return response.data
    },
}
