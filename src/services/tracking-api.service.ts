import axios from 'axios';
import type { LiveTrackingUpdate } from './tracking.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: `${API_URL}/tracking`,
});

api.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const { token } = JSON.parse(userStr);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const trackingApiService = {
    getActiveMessengers: async (): Promise<LiveTrackingUpdate[]> => {
        const response = await api.get<LiveTrackingUpdate[]>('/active');
        return response.data;
    },

    getHistory: async (messengerId: number, date: string) => {
        const response = await api.get(`/history/${messengerId}`, {
            params: { date }
        });
        return response.data;
    },

    getLastLocation: async (messengerId: number): Promise<LiveTrackingUpdate> => {
        const response = await api.get<LiveTrackingUpdate>(`/messenger/${messengerId}`);
        return response.data;
    }
};
