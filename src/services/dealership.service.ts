import type { Dealership, CreateDealershipRequest, UpdateDealershipRequest } from '@/types/dealership.types'

const API_URL = '/dealerships'

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    }
}

export const dealershipService = {
    async getAll(): Promise<Dealership[]> {
        const response = await fetch(`${API_URL}/allDealerships`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al obtener concesionarios')
        }

        return response.json()
    },

    async getById(id: number): Promise<Dealership> {
        const response = await fetch(`${API_URL}/findDealership/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al obtener concesionario')
        }

        return response.json()
    },

    async create(data: CreateDealershipRequest): Promise<string> {
        const response = await fetch(`${API_URL}/createDealership`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al crear concesionario')
        }

        return response.text()
    },

    async update(id: number, data: UpdateDealershipRequest): Promise<string> {
        const response = await fetch(`${API_URL}/updateDealership/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al actualizar concesionario')
        }

        return response.text()
    },

    async delete(id: number): Promise<string> {
        const response = await fetch(`${API_URL}/deleteDealership/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al eliminar concesionario')
        }

        return response.text()
    },

    async geocode(id: number): Promise<Dealership> {
        const response = await fetch(`${API_URL}/geocodeDealership/${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al geocodificar concesionario')
        }

        return response.json()
    },
}
