import { Client } from '@stomp/stompjs';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TrackingService');

const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    // Remove trailing slash if present to avoid "//ws/tracking"
    const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    if (base.startsWith('https')) {
        return base.replace('https', 'wss') + '/ws/tracking';
    }
    return base.replace('http', 'ws') + '/ws/tracking';
};

// NOTA: WebSocket no soporta cookies HttpOnly automáticamente
// Para autenticación WebSocket, necesitamos implementar una de estas soluciones:
// 1. Token de sesión específico para WebSocket obtenido vía endpoint HTTP
// 2. Autenticación después del handshake inicial
// 3. Ticket de un solo uso obtenido del backend
// Por ahora, mantenemos sin autenticación en el header inicial
// La autenticación se valida en el backend por mensajes individuales

export interface LiveTrackingUpdate {
    messengerId: number;
    messengerName: string;
    latitude: number;
    longitude: number;
    lastUpdate?: string; // ISO string - última ubicación GPS
    lastHeartbeat?: string; // ISO string - última señal de vida (puede no tener GPS)
    status: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
    speed: number;
    heading: number;
    accuracy?: number;
}

const STORAGE_KEY = 'tracking_offline_queue';
const MAX_QUEUE_SIZE = 100;

// Retry exponencial config
const INITIAL_RECONNECT_DELAY = 2000; // 2 segundos inicial
const MAX_RECONNECT_DELAY = 60000; // 60 segundos máximo
const JITTER_FACTOR = 0.3; // ±30% variación para evitar thundering herd

class TrackingService {
    private client: Client;
    private isConnected: boolean = false;
    private offlineQueue: Partial<LiveTrackingUpdate>[] = [];
    private reconnectAttempt: number = 0;

    constructor() {
        this.loadQueue();

        this.client = new Client({
            brokerURL: getWebSocketUrl(),
            reconnectDelay: INITIAL_RECONNECT_DELAY,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // Las cookies se envían automáticamente con la conexión WebSocket
            // No necesitamos Authorization header
        });

        this.client.onConnect = () => {
            this.isConnected = true;
            this.reconnectAttempt = 0; // Reset on successful connection
            this.client.reconnectDelay = INITIAL_RECONNECT_DELAY; // Reset delay
            this.drainQueue();
        };

        this.client.onDisconnect = () => {
            this.isConnected = false;
        };

        this.client.onStompError = (frame) => {
            logger.error('Broker reported error: ' + frame.headers['message']);
            logger.error('Additional details: ' + frame.body);
        };

        // Retry exponencial con jitter en cada cierre de conexión
        this.client.onWebSocketClose = () => {
            this.reconnectAttempt++;
            const newDelay = this.calculateReconnectDelay();
            this.client.reconnectDelay = newDelay;
        };
    }

    /**
     * Calcula delay de reconexión exponencial con jitter.
     * Evita que todos los clientes reconecten al mismo tiempo (thundering herd).
     */
    private calculateReconnectDelay(): number {
        this.reconnectAttempt++;

        // Exponencial: 2s, 4s, 8s, 16s, 32s, 60s (cap)
        const baseDelay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempt - 1),
            MAX_RECONNECT_DELAY
        );

        // Agregar jitter aleatorio ±30%
        const jitter = baseDelay * JITTER_FACTOR * (Math.random() * 2 - 1);
        const delay = Math.round(baseDelay + jitter);

        return delay;
    }

    private loadQueue() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.offlineQueue = JSON.parse(saved);
            }
        } catch {
            this.offlineQueue = [];
        }
    }

    private saveQueue() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.offlineQueue));
        } catch {
            // Failed to save queue, continuing anyway
        }
    }

    private drainQueue() {
        if (!this.isConnected || this.offlineQueue.length === 0) return;

        const updates = [...this.offlineQueue];
        this.offlineQueue = [];
        this.saveQueue();

        updates.forEach(update => {
            this.sendUpdate(update);
        });
    }

    public connect(token?: string, onConnectCallback?: () => void) {
        // WebSocket cookies se envían automáticamente (como en HTTP requests)
        // Pero para Safari Mobile, usamos el token temporal si está disponible
        if (token) {
            this.client.connectHeaders = {
                'Authorization': `Bearer ${token}`
            };
        }

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
                logger.error('Error sending tracking update, buffering...', error);
                this.bufferUpdate(updateWithTime);
            }
        } else {
            this.bufferUpdate(updateWithTime);
        }
    }

    private bufferUpdate(update: Partial<LiveTrackingUpdate>) {
        // Buffer both ACTIVE updates with coordinates AND OFFLINE status changes
        // OFFLINE status is important to sync when reconnecting
        const isActiveWithCoords = update.status === 'ACTIVE' && update.latitude;
        const isOfflineStatus = update.status === 'OFFLINE';

        if (!isActiveWithCoords && !isOfflineStatus) return;

        // For OFFLINE, only keep the last one (no need to queue multiple)
        if (isOfflineStatus) {
            this.offlineQueue = this.offlineQueue.filter(u => u.status !== 'OFFLINE');
        }

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

    /**
     * Envía un heartbeat (señal de vida) al servidor.
     * Indica que el mensajero está conectado aunque no tenga GPS.
     */
    public sendHeartbeat(messengerId: number) {
        if (!this.isConnected || !messengerId) {
            return;
        }

        try {
            this.client.publish({
                destination: '/app/tracking/heartbeat',
                body: JSON.stringify({
                    messengerId,
                    lastUpdate: new Date().toISOString()
                })
            });
        } catch (error) {
            logger.error('Error sending heartbeat:', error);
        }
    }
}

export const trackingService = new TrackingService();
