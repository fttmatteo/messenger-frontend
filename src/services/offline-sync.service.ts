import { get, set, del } from 'idb-keyval'

const PENDING_ACTIONS_KEY = 'pending_offline_actions'
const MAX_RETRY_COUNT = 3

export type OfflineActionType =
    | 'CREATE_SERVICE'
    | 'UPDATE_STATUS'
    | 'UPDATE_STATUS_WITH_FILES'
    | 'UPLOAD_PHOTO'

/**
 * Estructura de una acción capturada mientras el usuario está sin conexión.
 */
export interface OfflineAction {
    id: string
    type: OfflineActionType
    payload: unknown
    timestamp: number
    retryCount: number
    endpoint?: string
    method?: 'POST' | 'PUT' | 'PATCH'
}

/**
 * Payload para la acción UPDATE_STATUS_WITH_FILES.
 * Los archivos se almacenan como cadenas base64 para compatibilidad con IndexedDB.
 */
export interface UpdateStatusWithFilesPayload {
    serviceId: number
    status: string
    observation?: string
    signatureBase64?: string
    signatureGifBase64?: string
    photosBase64?: string[]
    latitude?: number
    longitude?: number
}

type ActionHandler = (action: OfflineAction) => Promise<boolean>

/**
 * Servicio encargado de la orquestación y sincronización de acciones realizadas sin conexión.
 * Implementa una cola de persistencia (Store and Forward) que captura peticiones API,
 * las almacena localmente y las reejecuta automáticamente cuando se restablece la conectividad.
 */
class OfflineSyncService {
    private handlers: Map<OfflineActionType, ActionHandler> = new Map()
    private isSyncing = false

    /**
     * Registra un manejador personalizado para procesar un tipo de acción específico durante la sincronización.
     * @param type - El tipo de acción (ej. 'UPDATE_STATUS').
     * @param handler - Función asíncrona que ejecuta la lógica de sincronización.
     */
    registerHandler(type: OfflineActionType, handler: ActionHandler): void {
        this.handlers.set(type, handler)
    }

    /**
     * Añade una nueva acción a la cola de pendientes para su posterior sincronización.
     * @param type - Tipo de la acción a encolar.
     * @param payload - Datos asociados a la acción (deben ser serializables).
     * @param options - Configuración adicional (endpoint, método HTTP).
     * @returns ID único generado para la acción encolada.
     */
    async queueAction(
        type: OfflineActionType,
        payload: unknown,
        options?: { endpoint?: string; method?: 'POST' | 'PUT' | 'PATCH' }
    ): Promise<string> {
        const action: OfflineAction = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
            endpoint: options?.endpoint,
            method: options?.method,
        }

        const actions = await this.getPendingActions()
        actions.push(action)
        await set(PENDING_ACTIONS_KEY, actions)

        return action.id
    }

    /**
     * Recupera todas las acciones que están esperando ser sincronizadas.
     */
    async getPendingActions(): Promise<OfflineAction[]> {
        try {
            const actions = await get<OfflineAction[]>(PENDING_ACTIONS_KEY)
            return actions || []
        } catch {
            return []
        }
    }

    /**
     * Remueve permanentemente una acción de la cola (tras éxito o fallo definitivo).
     * @param actionId - ID de la acción a eliminar.
     */
    async removeAction(actionId: string): Promise<void> {
        const actions = await this.getPendingActions()
        const filtered = actions.filter(a => a.id !== actionId)
        await set(PENDING_ACTIONS_KEY, filtered)
    }

    /**
     * Incrementar el contador de reintentos para una acción
     */
    async incrementRetry(actionId: string): Promise<void> {
        const actions = await this.getPendingActions()
        const action = actions.find(a => a.id === actionId)

        if (action) {
            action.retryCount++
            await set(PENDING_ACTIONS_KEY, actions)
        }
    }

    /**
     * Borra por completo todas las acciones pendientes de sincronización.
     */
    async clearAll(): Promise<void> {
        await del(PENDING_ACTIONS_KEY)
    }

    /**
     * Inicia el proceso de sincronización de todas las acciones en la cola.
     * Itera sobre las acciones y utiliza los manejadores registrados o una petición genérica.
     * @returns El número de acciones que se sincronizaron exitosamente.
     */
    async syncAll(): Promise<number> {
        if (this.isSyncing) {
            return 0
        }

        if (!navigator.onLine) {
            return 0
        }

        this.isSyncing = true
        let syncedCount = 0

        try {
            const actions = await this.getPendingActions()

            if (actions.length === 0) {
                return 0
            }

            for (const action of actions) {
                try {
                    const handler = this.handlers.get(action.type)

                    if (handler) {
                        const success = await handler(action)

                        if (success) {
                            await this.removeAction(action.id)
                            syncedCount++
                        } else {
                            await this.handleFailedAction(action)
                        }
                    } else {
                        // No hay manejador registrado, intentar fetch genérico si el endpoint está definido
                        if (action.endpoint) {
                            const success = await this.genericSync(action)
                            if (success) {
                                await this.removeAction(action.id)
                                syncedCount++
                            } else {
                                await this.handleFailedAction(action)
                            }
                        } else {
                            await this.handleFailedAction(action)
                        }
                    }
                } catch {
                    await this.handleFailedAction(action)
                }
            }

            return syncedCount
        } finally {
            this.isSyncing = false
        }
    }

    /**
     * Sincronización genérica usando fetch API
     */
    private async genericSync(action: OfflineAction): Promise<boolean> {
        if (!action.endpoint) return false

        try {
            const response = await fetch(action.endpoint, {
                method: action.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(action.payload),
            })

            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Manejar acción fallida (incrementar reintentos o eliminar si se supera el máximo)
     */
    private async handleFailedAction(action: OfflineAction): Promise<void> {
        if (action.retryCount >= MAX_RETRY_COUNT) {
            await this.removeAction(action.id)
        } else {
            await this.incrementRetry(action.id)
        }
    }

    /**
     * Verificar si hay acciones pendientes
     */
    async hasPendingActions(): Promise<boolean> {
        const actions = await this.getPendingActions()
        return actions.length > 0
    }
}

export const offlineSyncService = new OfflineSyncService()
