import apiClient from './api-client'
import type {
    LocationResponse,
    DistanceResponse,
    RouteRequest,
    RouteResponse,
} from '@/types/location.types'

class LocationService {
    /**
     * Geocode an address to coordinates
     */
    async geocode(address: string): Promise<LocationResponse> {
        const response = await apiClient.post('/locations/geocode', { address })
        return response.data
    }

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(lat: number, lng: number): Promise<LocationResponse> {
        const response = await apiClient.get('/locations/reverse', {
            params: { lat, lng }
        })
        return response.data
    }

    /**
     * Calculate distance between two points
     */
    async calculateDistance(
        fromLat: number,
        fromLng: number,
        toLat: number,
        toLng: number
    ): Promise<DistanceResponse> {
        const response = await apiClient.get('/locations/distance', {
            params: { fromLat, fromLng, toLat, toLng }
        })
        return response.data
    }

    /**
     * Calculate optimal route through dealerships
     */
    async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
        const response = await apiClient.post('/locations/route', request)
        return response.data
    }
}

export const locationService = new LocationService()
