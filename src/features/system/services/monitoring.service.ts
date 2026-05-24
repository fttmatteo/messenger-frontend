import apiClient from '@/shared/services/api-client'
import { format } from 'date-fns'

/**
 * Estadísticas diarias detalladas de un mensajero.
 */
export interface DailyStats {
    assigned: number
    delivered: number
    returned: number
    canceled: number
    pending: number
    total: number
}

/**
 * Representa un evento individual en la línea de tiempo de actividad.
 */
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

/**
 * Servicio encargado de proporcionar datos detallados para el monitoreo administrativo.
 * Ofrece estadísticas de rendimiento y cronogramas de actividad para el seguimiento en tiempo real.
 */
class MonitoringService {
    /**
     * Obtiene el resumen de actividad y estadísticas de un mensajero para una fecha determinada.
     * @param messengerUuid - UUID público del mensajero.
     * @param date - Fecha para la cual se desea consultar la actividad.
     * @param page - Número de página.
     * @param size - Tamaño de página.
     */
    async getMessengerActivity(messengerUuid: string, date: Date, page = 0, size = 100): Promise<MessengerActivityResponse> {
        const dateStr = format(date, 'yyyy-MM-dd')
        const response = await apiClient.get(`/monitoring/messenger/${messengerUuid}/activity`, {
            params: { date: dateStr, page, size }
        })
        return response.data
    }
}

export const monitoringService = new MonitoringService()
