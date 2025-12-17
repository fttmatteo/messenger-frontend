/**
 * Tipos de Concesionarios (Dealerships)
 * 
 * Define las interfaces para el módulo de gestión de concesionarios.
 * Corresponde a los DTOs del backend.
 */

/**
 * Concesionario completo (respuesta del backend)
 */
export interface Dealership {
    /** ID único del concesionario */
    id: number
    /** Nombre del concesionario */
    name: string
    /** Dirección física */
    address: string
    /** Teléfono de contacto */
    phone: string
    /** Zona geográfica */
    zone: string
    /** Latitud (coordenada GPS) */
    latitude?: number
    /** Longitud (coordenada GPS) */
    longitude?: number
    /** Fecha de creación */
    createdAt?: string
    /** Fecha de última actualización */
    updatedAt?: string
}

/**
 * Request para crear/actualizar concesionario
 */
export interface CreateDealershipRequest {
    /** Nombre del concesionario (requerido) */
    name: string
    /** Dirección física (requerido) */
    address: string
    /** Teléfono de contacto (requerido) */
    phone: string
    /** Zona geográfica (requerido) */
    zone: string
}

/**
 * Request para actualizar concesionario (igual a create)
 */
export type UpdateDealershipRequest = CreateDealershipRequest

/**
 * Respuesta de geocodificación
 */
export interface GeocodeDealershipResponse {
    dealership: Dealership
    /** Indica si se encontraron coordenadas */
    geocoded: boolean
}

/**
 * Zonas disponibles
 */
export const DEALERSHIP_ZONES = [
    'NORTE',
    'SUR',
    'CENTRO',
    'ESTE',
    'OESTE',
] as const

export type DealershipZone = typeof DEALERSHIP_ZONES[number]
