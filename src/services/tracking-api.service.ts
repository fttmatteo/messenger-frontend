import type { LiveTrackingUpdate } from './tracking.service';
import apiClient from './api-client';

export const trackingApiService = {
    getActiveMessengers: async (): Promise<LiveTrackingUpdate[]> => {
        const response = await apiClient.get<LiveTrackingUpdate[]>('/tracking/active', {
            params: { t: Date.now() }
        });
        return response.data;
    },

    getHistory: async (messengerId: number, date: string) => {
        const response = await apiClient.get(`/tracking/history/${messengerId}`, {
            params: { date }
        });
        return response.data;
    },

    getLastLocation: async (messengerId: number): Promise<LiveTrackingUpdate | null> => {
        const response = await apiClient.get<LiveTrackingUpdate | null>(`/tracking/messenger/${messengerId}`);
        return response.data;
    },

    getHistoryByService: async (serviceId: number) => {
        const response = await apiClient.get(`/tracking/service/${serviceId}`);
        return response.data;
    }
};
