// Tipos de Ubicación y Ruta

/**
 * Respuesta de geocodificación que asocia coordenadas con una dirección física.
 */
export interface LocationResponse {
    latitude: number
    longitude: number
    formattedAddress?: string
}

/**
 * Resultado del cálculo de distancia y tiempo estimado entre dos puntos.
 */
export interface DistanceResponse {
    distanceMeters: number | null
    durationSeconds: number | null
}

/**
 * Petición para generar una ruta optimizada entre varios destinos.
 */
export interface RouteRequest {
    originLatitude: number
    originLongitude: number
    dealershipIds: number[]
}

/**
 * Punto de paso individual dentro de una ruta generada.
 */
export interface RouteWaypoint {
    dealershipId: number
    dealershipName: string
    latitude: number
    longitude: number
    distanceFromPrevious: number
    durationFromPrevious: number
    order: number
}

/**
 * Respuesta que contiene la ruta completa optimizada y sus metadatos de viaje.
 */
export interface RouteResponse {
    waypoints: RouteWaypoint[]
    totalDistance: number
    totalDuration: number
    encodedPolyline?: string
}

/**
 * Registro individual del historial de movimientos de un mensajero.
 */
export interface TrackingHistoryItem {
    id: number
    messengerId: number
    messengerName?: string
    latitude: number
    longitude: number
    timestamp: string
    recordedAt?: string
    lastUpdate?: string
    speed?: number
    heading?: number
    accuracy?: number
    serviceId?: number
}

/**
 * Petición para optimizar la ruta de múltiples servicios de entrega.
 */
export interface OptimizeDeliveriesRequest {
    currentLatitude: number
    currentLongitude: number
    serviceUuids: string[]
}

/**
 * Paso individual en una ruta de entrega optimizada.
 */
export interface DeliveryRouteStep {
    serviceUuid: string
    action: 'PICKUP' | 'DELIVERY'
    dealershipId: number
    dealershipName: string
    latitude: number
    longitude: number
    order: number
}

/**
 * Respuesta con la ruta de entrega optimizada completa.
 */
export interface OptimizeDeliveriesResponse {
    steps: DeliveryRouteStep[]
    distanceMeters: number | null
    distanceKilometers: number | null
    durationSeconds: number | null
    durationFormatted: string | null
    polyline: string | null
}

