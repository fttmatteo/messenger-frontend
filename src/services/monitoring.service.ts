import apiClient from './api-client'

export interface DailyStats {
    assigned: number
    delivered: number
    returned: number
    canceled: number
    pending: number
    total: number
}

export interface ActivityEvent {
    id: number
    status: string
    timestamp: string
    plateNumber: string
    dealershipName: string
    latitude?: number
    longitude?: number
    changedByName?: string
    changedByRole?: string
}

export interface MessengerActivityResponse {
    dailyStats: DailyStats
    timeline: ActivityEvent[]
}

class MonitoringService {
    /**
     * Obtiene la actividad de un mensajero para una fecha específica.
     */
    async getMessengerActivity(messengerId: number, date: Date): Promise<MessengerActivityResponse> {
        const dateStr = date.toISOString().split('T')[0]
        const response = await apiClient.get(`/monitoring/messenger/${messengerId}/activity`, {
            params: { date: dateStr }
        })
        return response.data
    }
}

export const monitoringService = new MonitoringService()
