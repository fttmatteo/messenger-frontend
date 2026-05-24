import type { LiveTrackingUpdate } from './tracking.service';
import apiClient from '@/shared/services/api-client';

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
     * Recupera el historial de ubicaciones de un mensajero para una fecha específica con paginación.
     * @param messengerUuid - UUID del mensajero.
     * @param date - Fecha de consulta (formato YYYY-MM-DD).
     * @param page - Número de página (0-indexed).
     * @param size - Tamaño de la página.
     */
    getHistory: async (messengerUuid: string, date: string, page = 0, size = 100) => {
        const response = await apiClient.get(`/tracking/history/pageable/${messengerUuid}`, {
            params: { date, page, size }
        });
        return response.data;
    },

    /**
     * Obtiene la última ubicación registrada de un mensajero específico.
     * @param messengerUuid - UUID del mensajero.
     */
    getLastLocation: async (messengerUuid: string): Promise<LiveTrackingUpdate | null> => {
        const response = await apiClient.get<LiveTrackingUpdate | null>(`/tracking/messenger/${messengerUuid}`);
        return response.data;
    },

    /**
     * Obtiene el historial de ubicaciones asociadas a un servicio de entrega concreto.
     * @param serviceUuid - UUID del servicio.
     */
    getHistoryByService: async (serviceUuid: string) => {
        const response = await apiClient.get(`/tracking/service/${serviceUuid}`);
        return response.data;
    },

    /**
     * Obtiene las últimas ubicaciones de un grupo de mensajeros en una sola llamada.
     * REQUISITO DEL BACKEND: Se requiere el endpoint POST /tracking/messengers/bulk-locations
     */
    getBulkLastLocations: async (uuids: string[]): Promise<Record<string, LiveTrackingUpdate>> => {
        if (!uuids.length) return {};
        const response = await apiClient.post<Record<string, LiveTrackingUpdate>>('/tracking/messengers/bulk-locations', { uuids });
        return response.data;
    }
};
