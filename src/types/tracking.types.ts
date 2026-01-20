/**
 * Representa un punto individual en el historial de rastreo GPS de un mensajero.
 */
export interface TrackingHistoryItem {
    id?: number
    latitude: number
    longitude: number
    timestamp: string
    speed?: number
}

export type { LiveTrackingUpdate } from '@/services/tracking.service'
