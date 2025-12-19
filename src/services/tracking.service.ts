import { Client } from '@stomp/stompjs';

const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    if (apiUrl.startsWith('https')) {
        return apiUrl.replace('https', 'wss') + '/ws/tracking';
    }
    return apiUrl.replace('http', 'ws') + '/ws/tracking';
};

const getAuthToken = () => {
    return localStorage.getItem('token') || '';
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
    private isConnected: boolean = false;

    constructor() {
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
            };
        }
        this.client.activate();
    }

    public disconnect() {
        this.client.deactivate();
        this.isConnected = false;
    }

    public sendUpdate(update: Partial<LiveTrackingUpdate>) {
        if (this.isConnected) {
            try {
                this.client.publish({
                    destination: '/app/tracking/update',
                    body: JSON.stringify(update)
                });
            } catch (error) {
                console.error('Error sending tracking update', error);
            }
        }
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
                    } catch (e) {
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
}

export const trackingService = new TrackingService();
