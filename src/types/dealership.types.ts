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

export interface CreateDealershipRequest {
    name: string
    address: string
    phone: string
    zone: string
}

export type UpdateDealershipRequest = CreateDealershipRequest
