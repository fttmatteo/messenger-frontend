/**
 * Tipos de Tracking (Seguimiento en Tiempo Real)
 * 
 * Define las interfaces para el módulo de tracking GPS.
 */

/**
 * Estado del mensajero
 */
export type MessengerStatus = 'ONLINE' | 'OFFLINE' | 'BUSY'

/**
 * Actualización de ubicación (enviada por mensajeros)
 */
export interface LocationUpdate {
    /** ID del mensajero */
    messengerId: number
    /** Latitud GPS */
    latitude: number
    /** Longitud GPS */
    longitude: number
    /** Precisión en metros */
    accuracy?: number
    /** Velocidad en km/h */
    speed?: number
    /** Dirección en grados */
    heading?: number
    /** Estado del mensajero */
    status: MessengerStatus
    /** ID del dispositivo */
    deviceId?: string
    /** Timestamp de la actualización */
    timestamp?: string
}

/**
 * Ubicación de mensajero activo (respuesta del backend)
 */
export interface ActiveMessenger {
    /** ID del mensajero */
    messengerId: number
    /** Nombre del mensajero */
    messengerName: string
    /** Documento del mensajero */
    messengerDocument: string
    /** Latitud actual */
    latitude: number
    /** Longitud actual */
    longitude: number
    /** Velocidad actual */
    speed?: number
    /** Dirección del movimiento */
    heading?: number
    /** Estado del mensajero */
    status: MessengerStatus
    /** Última actualización */
    lastUpdate: string
    /** Número de entregas activas */
    activeDeliveries?: number
}

/**
 * Historial de ubicación
 */
export interface LocationHistory {
    /** ID del registro */
    id: number
    /** ID del mensajero */
    messengerId: number
    /** Latitud */
    latitude: number
    /** Longitud */
    longitude: number
    /** Velocidad */
    speed?: number
    /** Timestamp */
    timestamp: string
}

/**
 * Mensaje WebSocket de tracking
 */
export interface TrackingWebSocketMessage {
    type: 'LOCATION_UPDATE' | 'STATUS_CHANGE' | 'DELIVERY_UPDATE'
    payload: LocationUpdate | ActiveMessenger
}
