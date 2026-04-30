import apiClient from './api-client'
import type { Employee } from '@/types/employee.types'

export interface ProfileUpdateRequest {
    fullName: string
    phone: string
    password?: string
}

export const profileService = {
    getMe: async (): Promise<Employee> => {
        const response = await apiClient.get<Employee>('/profile/me')
        return response.data
    },

    updateMe: async (data: ProfileUpdateRequest): Promise<Employee> => {
        const response = await apiClient.put<Employee>('/profile/me', data)
        return response.data
    }
}
