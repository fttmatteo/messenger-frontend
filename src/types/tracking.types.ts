export interface TrackingHistoryItem {
    id?: number
    latitude: number
    longitude: number
    timestamp: string
    speed?: number
}

// Re-export LiveTrackingUpdate if we want to centralize, 
// but for now keeping it compatible with existing imports
export type { LiveTrackingUpdate } from '@/services/tracking.service'
