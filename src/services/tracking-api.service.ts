import axios from 'axios';
import type { LiveTrackingUpdate } from './tracking.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Enviar cookies automáticamente
});

// Ya no necesitamos interceptor - las cookies se envían automáticamente

export const trackingApiService = {
    getActiveMessengers: async (): Promise<LiveTrackingUpdate[]> => {
        const response = await api.get<LiveTrackingUpdate[]>('/tracking/active', {
            params: { t: Date.now() }
        });
        return response.data;
    },

    getHistory: async (messengerId: number, date: string) => {
        const response = await api.get(`/tracking/history/${messengerId}`, {
            params: { date }
        });
        return response.data;
    },

    getLastLocation: async (messengerId: number): Promise<LiveTrackingUpdate | null> => {
        const response = await api.get<LiveTrackingUpdate | null>(`/tracking/messenger/${messengerId}`);
        return response.data;
    },

    getHistoryByService: async (serviceId: number) => {
        const response = await api.get(`/tracking/service/${serviceId}`);
        return response.data;
    }
};
