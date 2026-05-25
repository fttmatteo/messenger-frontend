import apiClient from '@/shared/services/api-client'
import type {
    LocationResponse,
    DistanceResponse,
    RouteRequest,
    RouteResponse,
    OptimizeDeliveriesRequest,
    OptimizeDeliveriesResponse,
} from '@/features/location/types/location.types'

/**
 * Servicio encargado de las operaciones de geolocalización y rutas.
 * Proporciona integración con servicios de mapas para geocodificación (directa e inversa),
 * cálculo de distancias y generación de rutas optimizadas.
 */
class LocationService {
    /**
     * Convierte una dirección de texto en coordenadas geográficas (latitud/longitud).
     */
    async geocode(address: string): Promise<LocationResponse> {
        const response = await apiClient.post('/locations/geocode', { address })
        return response.data
    }

    /**
     * Convierte coordenadas geográficas en una dirección física legible.
     */
    async reverseGeocode(lat: number, lng: number): Promise<LocationResponse> {
        const response = await apiClient.get('/locations/reverse', {
            params: { lat, lng }
        })
        return response.data
    }

    /**
     * Calcula la distancia de viaje y el tiempo estimado entre dos puntos geográficos.
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
     * Genera una ruta óptima considerando múltiples puntos de paso (concesionarios).
     * @param request - Parámetros de la ruta incluyendo origen, destino y paradas.
     */
    async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
        const response = await apiClient.post('/locations/route', request)
        return response.data
    }

    /**
     * Genera una ruta optimizada para múltiples entregas con orígenes y destinos independientes.
     */
    async optimizeDeliveriesRoute(request: OptimizeDeliveriesRequest): Promise<OptimizeDeliveriesResponse> {
        const response = await apiClient.post('/locations/route/optimize-services', request)
        return response.data
    }
}

export const locationService = new LocationService()
