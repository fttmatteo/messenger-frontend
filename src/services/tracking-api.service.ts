import type { LiveTrackingUpdate } from './tracking.service';
import apiClient from './api-client';

/**
 * Servicio encargado de las consultas relacionadas con el rastreo de mensajeros.
 * Proporciona acceso a la ubicación actual en tiempo real y al historial de movimientos
 * tanto por mensajero como por servicio específico.
 */
export const trackingApiService = {
    /**
     * Obtiene la lista de todos los mensajeros activos con su última ubicación conocida.
     */
    getActiveMessengers: async (): Promise<LiveTrackingUpdate[]> => {
        const response = await apiClient.get<LiveTrackingUpdate[]>('/tracking/active', {
            params: { t: Date.now() }
        });
        return response.data;
    },

    /**
     * Recupera el historial de ubicaciones de un mensajero para una fecha específica.
     * @param messengerId - ID del mensajero.
     * @param date - Fecha de consulta (formato YYYY-MM-DD).
     */
    getHistory: async (messengerId: number, date: string) => {
        const response = await apiClient.get(`/tracking/history/${messengerId}`, {
            params: { date }
        });
        return response.data;
    },

    /**
     * Obtiene la última ubicación registrada de un mensajero específico.
     * @param messengerId - ID del mensajero.
     */
    getLastLocation: async (messengerId: number): Promise<LiveTrackingUpdate | null> => {
        const response = await apiClient.get<LiveTrackingUpdate | null>(`/tracking/messenger/${messengerId}`);
        return response.data;
    },

    /**
     * Obtiene el historial de ubicaciones asociadas a un servicio de entrega concreto.
     * @param serviceId - ID del servicio.
     */
    getHistoryByService: async (serviceId: number) => {
        const response = await apiClient.get(`/tracking/service/${serviceId}`);
        return response.data;
    }
};
