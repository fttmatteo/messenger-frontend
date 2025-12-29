import { Client } from '@stomp/stompjs';
import { authService } from './auth.service';

const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    // Remove trailing slash if present to avoid "//ws/tracking"
    const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    if (base.startsWith('https')) {
        return base.replace('https', 'wss') + '/ws/tracking';
    }
    return base.replace('http', 'ws') + '/ws/tracking';
};

const getAuthToken = () => {
    return authService.getToken() || '';
};

export interface LiveTrackingUpdate {
    messengerId: number;
    messengerName: string;
    latitude: number;
    longitude: number;
    lastUpdate?: string; // ISO string
    status: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
    speed: number;
    heading: number;
    accuracy?: number;
}

const STORAGE_KEY = 'tracking_offline_queue';
const MAX_QUEUE_SIZE = 100;

class TrackingService {
    private client: Client;
    private isConnected: boolean = false;
    private offlineQueue: Partial<LiveTrackingUpdate>[] = [];

    constructor() {
        this.loadQueue();

        this.client = new Client({
            brokerURL: getWebSocketUrl(),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
                Authorization: `Bearer ${getAuthToken()}`
            },
        });

        this.client.onConnect = () => {
            console.log('Connected to Tracking WebSocket');
            this.isConnected = true;
            this.drainQueue();
        };

        this.client.onDisconnect = () => {
            console.log('Disconnected from Tracking WebSocket');
            this.isConnected = false;
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    private loadQueue() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.offlineQueue = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load tracking queue', e);
            this.offlineQueue = [];
        }
    }

    private saveQueue() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.offlineQueue));
        } catch (e) {
            console.warn('Failed to save tracking queue', e);
        }
    }

    private drainQueue() {
        if (!this.isConnected || this.offlineQueue.length === 0) return;

        console.log(`Draining ${this.offlineQueue.length} buffered tracking updates`);
        const updates = [...this.offlineQueue];
        this.offlineQueue = [];
        this.saveQueue();

        updates.forEach(update => {
            this.sendUpdate(update);
        });
    }

    public connect(onConnectCallback?: () => void) {
        // Update token before connecting (in case it changed)
        this.client.connectHeaders = {
            Authorization: `Bearer ${getAuthToken()}`
        };

        if (onConnectCallback) {
            const originalOnConnect = this.client.onConnect;
            this.client.onConnect = (frame) => {
                this.isConnected = true;
                originalOnConnect?.(frame);
                onConnectCallback();
                this.drainQueue();
            };
        }
        this.client.activate();
    }

    public disconnect() {
        this.client.deactivate();
        this.isConnected = false;
    }

    public sendUpdate(update: Partial<LiveTrackingUpdate>) {
        // Always ensure we have a timestamp for the capture time
        const updateWithTime = {
            ...update,
            lastUpdate: update.lastUpdate || new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                this.client.publish({
                    destination: '/app/tracking/update',
                    body: JSON.stringify(updateWithTime)
                });
            } catch (error) {
                console.error('Error sending tracking update, buffering...', error);
                this.bufferUpdate(updateWithTime);
            }
        } else {
            this.bufferUpdate(updateWithTime);
        }
    }

    private bufferUpdate(update: Partial<LiveTrackingUpdate>) {
        // Only buffer active status updates with coordinates
        if (update.status !== 'ACTIVE' || !update.latitude) return;

        this.offlineQueue.push(update);

        // Keep queue size manageable
        if (this.offlineQueue.length > MAX_QUEUE_SIZE) {
            this.offlineQueue.shift();
        }

        this.saveQueue();
    }

    public subscribeToAll(callback: (update: LiveTrackingUpdate) => void) {
        const doSubscribe = () => {
            this.client.subscribe('/topic/tracking/all', (message) => {
                if (message.body) {
                    try {
                        const body = JSON.parse(message.body);
                        if (typeof body === 'object' && body.messengerId) {
                            callback(body);
                        }
                    } catch {
                        // ignore non-json messages
                    }
                }
            });
        };

        if (this.isConnected) {
            doSubscribe();
        } else {
            // Queue subscription for when connected
            const originalOnConnect = this.client.onConnect;
            this.client.onConnect = (frame) => {
                this.isConnected = true;
                originalOnConnect?.(frame);
                doSubscribe();
            };
        }
    }

    private lastLocation: { latitude: number; longitude: number; timestamp: number } | null = null;

    public setLastLocation(latitude: number, longitude: number) {
        this.lastLocation = { latitude, longitude, timestamp: Date.now() };
    }

    public getLastKnownLocation() {
        return this.lastLocation;
    }
}

export const trackingService = new TrackingService();
