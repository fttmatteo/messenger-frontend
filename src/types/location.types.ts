// Location and Route Types

export interface LocationResponse {
    latitude: number
    longitude: number
    formattedAddress?: string
}

export interface DistanceResponse {
    distanceMeters: number | null
    durationSeconds: number | null
}

export interface RouteRequest {
    originLatitude: number
    originLongitude: number
    dealershipIds: number[]
}

export interface RouteWaypoint {
    dealershipId: number
    dealershipName: string
    latitude: number
    longitude: number
    distanceFromPrevious: number
    durationFromPrevious: number
    order: number
}

export interface RouteResponse {
    waypoints: RouteWaypoint[]
    totalDistance: number
    totalDuration: number
    encodedPolyline?: string
}

export interface TrackingHistoryItem {
    id: number
    messengerId: number
    messengerName?: string
    latitude: number
    longitude: number
    timestamp: string
    speed?: number
    heading?: number
    accuracy?: number
    serviceId?: number
}
