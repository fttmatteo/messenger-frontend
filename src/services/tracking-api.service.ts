import axios from 'axios';
import type { LiveTrackingUpdate } from './tracking.service';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const trackingApiService = {
    getActiveMessengers: async (): Promise<LiveTrackingUpdate[]> => {
        const response = await api.get<LiveTrackingUpdate[]>('/tracking/active');
        return response.data;
    },

    getHistory: async (messengerId: number, date: string) => {
        const response = await api.get(`/tracking/history/${messengerId}`, {
            params: { date }
        });
        return response.data;
    },

    getLastLocation: async (messengerId: number): Promise<LiveTrackingUpdate> => {
        const response = await api.get<LiveTrackingUpdate>(`/tracking/messenger/${messengerId}`);
        return response.data;
    }
};
