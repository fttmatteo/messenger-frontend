/**
 * Representa la entidad de un concesionario o punto de entrega en el sistema.
 */
export interface Dealership {
    idDealership: number
    name: string
    address: string
    phone: string
    zone: string
    latitude?: number
    longitude?: number
    isGeolocated?: boolean
}

/**
 * Atributos requeridos para registrar un nuevo concesionario.
 */
export interface CreateDealershipRequest {
    name: string
    address: string
    phone: string
    zone: string
}

export type UpdateDealershipRequest = CreateDealershipRequest
