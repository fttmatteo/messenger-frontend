import { Client } from '@stomp/stompjs';
import { createLogger } from '@/shared/utils/logger';

const logger = createLogger('TrackingService');

const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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
    messengerUuid?: string;
    messengerName: string;
    latitude: number;
    longitude: number;
    lastUpdate?: string;
    lastHeartbeat?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
    speed: number;
    heading: number;
    accuracy?: number;
}

const STORAGE_KEY = 'tracking_offline_queue';
const MAX_QUEUE_SIZE = 100;

const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 60000;
const JITTER_FACTOR = 0.3;

/**
 * Servicio encargado de la comunicación bidireccional en tiempo real mediante WebSockets (protocolo STOMP).
 * Gestiona el envío de la ubicación GPS de los mensajeros, señales de vida (heartbeats)
 * y la suscripción a actualizaciones de presencia de otros usuarios.
 * 
 * Incluye mecanismos de:
 * 1. Reconexión automática con estrategia de retroceso exponencial (Exponential Backoff).
 * 2. Mitigación de congestión mediante Jitter.
 * 3. Buffer local (Offline Queue) para retransmitir ubicaciones capturadas sin conexión.
 * 4. Compatibilidad específica para navegadores móviles (Safari Handshake).
 */
class TrackingService {
    private client: Client;
    private isConnected: boolean = false;
    private offlineQueue: Partial<LiveTrackingUpdate>[] = [];
    private reconnectAttempt: number = 0;
    private pendingSubscriptions: ((frame: any) => void)[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor() {
        this.loadQueue();

        this.client = new Client({
            brokerURL: getWebSocketUrl(),
            reconnectDelay: INITIAL_RECONNECT_DELAY,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            this.isConnected = true;
            this.reconnectAttempt = 0;
            this.client.reconnectDelay = INITIAL_RECONNECT_DELAY;
            this.drainQueue();
            
            this.pendingSubscriptions.forEach(sub => sub(frame));
            this.pendingSubscriptions = [];
        };

        this.client.onDisconnect = () => {
            this.isConnected = false;
        };

        this.client.onStompError = (frame) => {
            logger.error('Error del broker STOMP:', frame.headers['message']);
        };

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
        const baseDelay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempt - 1),
            MAX_RECONNECT_DELAY
        );

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
            // Error al guardar la cola, continuando de todos modos
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

    /**
     * Establece la conexión con el servidor WebSocket.
     */
    public connect(token?: string, onConnectCallback?: () => void) {
        if (token) {
            this.client.connectHeaders = {
                'Authorization': `Bearer ${token}`
            };

            const baseUrl = getWebSocketUrl();
            const separator = baseUrl.includes('?') ? '&' : '?';
            this.client.brokerURL = `${baseUrl}${separator}token=${token}`;
        } else {
            this.client.brokerURL = getWebSocketUrl();
            this.client.connectHeaders = {};
        }

        if (onConnectCallback) {
            this.pendingSubscriptions.push(onConnectCallback);
        }
        this.client.activate();
    }

    /**
    * Cierra la conexión activa del WebSocket.
    */
    public disconnect() {
        this.client.deactivate();
        this.isConnected = false;
    }

    /**
     * Verifica si el WebSocket está conectado actualmente.
     * Se usa para evitar intentos de conexión duplicados.
     */
    public isCurrentlyConnected(): boolean {
        return this.isConnected && this.client.connected;
    }

    /**
     * Envía una actualización de ubicación o estado al servidor.
     * Si no hay conexión, la actualización se guarda en una cola local persistente.
     */
    public sendUpdate(update: Partial<LiveTrackingUpdate>) {
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
                logger.error('Error enviando actualización de rastreo, almacenando en buffer...', error);
                this.bufferUpdate(updateWithTime);
            }
        } else {
            this.bufferUpdate(updateWithTime);
        }
    }

    private bufferUpdate(update: Partial<LiveTrackingUpdate>) {
        const isActiveWithCoords = update.status === 'ACTIVE' && update.latitude;
        const isOfflineStatus = update.status === 'OFFLINE';

        if (!isActiveWithCoords && !isOfflineStatus) return;


        if (isActiveWithCoords) {
            this.offlineQueue = this.offlineQueue.filter(u => u.status !== 'ACTIVE');
        } else if (isOfflineStatus) {
            this.offlineQueue = this.offlineQueue.filter(u => u.status !== 'OFFLINE');
        }

        this.offlineQueue.push(update);

        if (this.offlineQueue.length > MAX_QUEUE_SIZE) {
            this.offlineQueue.shift();
        }

        this.saveQueue();
    }

    /**
     * Se suscribe al canal global de rastreo para recibir actualizaciones de TODOS los mensajeros.
     */
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
                        // ignorar mensajes que no sean JSON
                    }
                }
            });
        };

        if (this.isConnected) {
            doSubscribe();
        } else {
            this.pendingSubscriptions.push(doSubscribe);
        }
    }

    /**
     * Se suscribe exclusivamente a los eventos de presencia (conexión/desconexión).
     */
    public subscribeToPresence(callback: (update: LiveTrackingUpdate) => void) {
        const doSubscribe = () => {
            this.client.subscribe('/topic/tracking/presence', (message) => {
                if (message.body) {
                    try {
                        const body = JSON.parse(message.body);
                        if (typeof body === 'object' && body.messengerId) {
                            callback(body);
                        }
                    } catch {
                        // ignorar mensajes que no sean JSON
                    }
                }
            });
        };

        if (this.isConnected) {
            doSubscribe();
        } else {
            this.pendingSubscriptions.push(doSubscribe);
        }
    }

    private lastLocation: { latitude: number; longitude: number; timestamp: number } | null = null;

    /**
     * Guarda localmente la última ubicación conocida para propósitos de navegación rápida.
     */
    public setLastLocation(latitude: number, longitude: number) {
        this.lastLocation = { latitude, longitude, timestamp: Date.now() };
    }

    /**
     * Obtiene la última ubicación registrada en memoria.
     */
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
            logger.error('Error enviando heartbeat:', error);
        }
    }
}

export const trackingService = new TrackingService();
