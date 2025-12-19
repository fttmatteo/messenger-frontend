import apiClient from './api-client'
import type { Dealership, CreateDealershipRequest, UpdateDealershipRequest } from '@/types/dealership.types'

export const dealershipService = {
    async getAll(): Promise<Dealership[]> {
        const response = await apiClient.get('/dealerships/allDealerships')
        return response.data
    },

    async getById(id: number): Promise<Dealership> {
        const response = await apiClient.get(`/dealerships/findDealership/${id}`)
        return response.data
    },

    async create(data: CreateDealershipRequest): Promise<string> {
        const response = await apiClient.post('/dealerships/createDealership', data)
        return response.data
    },

    async update(id: number, data: UpdateDealershipRequest): Promise<string> {
        const response = await apiClient.put(`/dealerships/updateDealership/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<string> {
        const response = await apiClient.delete(`/dealerships/deleteDealership/${id}`)
        return response.data
    },

    async geocode(id: number): Promise<Dealership> {
        const response = await apiClient.post(`/dealerships/geocodeDealership/${id}`)
        return response.data
    },
}
