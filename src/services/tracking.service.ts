import { Client } from '@stomp/stompjs';

const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    if (apiUrl.startsWith('https')) {
        return apiUrl.replace('https', 'wss') + '/ws/tracking';
    }
    return apiUrl.replace('http', 'ws') + '/ws/tracking';
};

export interface LiveTrackingUpdate {
    messengerId: number;
    messengerName: string;
    latitude: number;
    longitude: number;
    lastUpdate: string;
    status: 'ACTIVE' | 'IN_ACTIVE';
    speed: number;
    heading: number;
}

class TrackingService {
    private client: Client;

    constructor() {
        this.client = new Client({
            brokerURL: getWebSocketUrl(),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('Connected to Tracking WebSocket');
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    public connect(onConnectCallback?: () => void) {
        if (onConnectCallback) {
            const originalOnConnect = this.client.onConnect;
            this.client.onConnect = (frame) => {
                originalOnConnect?.(frame);
                onConnectCallback();
            };
        }
        this.client.activate();
    }

    public disconnect() {
        this.client.deactivate();
    }

    public subscribeToAll(callback: (update: LiveTrackingUpdate) => void) {
        // Return a promise that resolves when connected? 
        // Or simpler: just try to subscribe if connected, or queue.
        // StompJS client handles queuing of subscriptions if configured well or if done in onConnect.

        if (this.client.connected) {
            this.client.subscribe('/topic/tracking/all', (message) => {
                if (message.body) {
                    try {
                        const body = JSON.parse(message.body);
                        // Filter out the "Suscrito..." string message if it accidentally comes through
                        if (typeof body === 'object') {
                            callback(body);
                        }
                    } catch (e) {
                        // ignore non-json messages
                    }
                }
            });
        } else {
            console.warn('Attempted to subscribe while disconnected. Subscription queued via onConnect shim.');
            const originalOnConnect = this.client.onConnect;
            this.client.onConnect = (frame) => {
                originalOnConnect?.(frame);
                this.client.subscribe('/topic/tracking/all', (message) => {
                    if (message.body) {
                        try {
                            const body = JSON.parse(message.body);
                            if (typeof body === 'object') {
                                callback(body);
                            }
                        } catch (e) { }
                    }
                });
            };
        }
    }
}

export const trackingService = new TrackingService();
