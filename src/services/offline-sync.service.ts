import { get, set, del } from 'idb-keyval'

const PENDING_ACTIONS_KEY = 'pending_offline_actions'
const MAX_RETRY_COUNT = 3

export type OfflineActionType =
    | 'CREATE_SERVICE'
    | 'UPDATE_STATUS'
    | 'UPLOAD_PHOTO'

export interface OfflineAction {
    id: string
    type: OfflineActionType
    payload: unknown
    timestamp: number
    retryCount: number
    endpoint?: string
    method?: 'POST' | 'PUT' | 'PATCH'
}

type ActionHandler = (action: OfflineAction) => Promise<boolean>

/**
 * Service for managing offline actions queue.
 * Queues actions performed while offline and syncs them when back online.
 */
class OfflineSyncService {
    private handlers: Map<OfflineActionType, ActionHandler> = new Map()
    private isSyncing = false

    /**
     * Register a handler for a specific action type
     */
    registerHandler(type: OfflineActionType, handler: ActionHandler): void {
        this.handlers.set(type, handler)
    }

    /**
     * Queue an action to be synced when online
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

        console.log(`Queued offline action: ${type}`, action.id)
        return action.id
    }

    /**
     * Get all pending actions
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
     * Remove a specific action from the queue
     */
    async removeAction(actionId: string): Promise<void> {
        const actions = await this.getPendingActions()
        const filtered = actions.filter(a => a.id !== actionId)
        await set(PENDING_ACTIONS_KEY, filtered)
    }

    /**
     * Update retry count for an action
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
     * Clear all pending actions
     */
    async clearAll(): Promise<void> {
        await del(PENDING_ACTIONS_KEY)
    }

    /**
     * Sync all pending actions.
     * Returns the number of successfully synced actions.
     */
    async syncAll(): Promise<number> {
        if (this.isSyncing) {
            console.log('Sync already in progress')
            return 0
        }

        if (!navigator.onLine) {
            console.log('Still offline, cannot sync')
            return 0
        }

        this.isSyncing = true
        let syncedCount = 0

        try {
            const actions = await this.getPendingActions()

            if (actions.length === 0) {
                return 0
            }

            console.log(`Syncing ${actions.length} pending actions...`)

            for (const action of actions) {
                try {
                    const handler = this.handlers.get(action.type)

                    if (handler) {
                        const success = await handler(action)

                        if (success) {
                            await this.removeAction(action.id)
                            syncedCount++
                            console.log(`Synced action: ${action.type}`, action.id)
                        } else {
                            await this.handleFailedAction(action)
                        }
                    } else {
                        // No handler registered, try generic fetch if endpoint is defined
                        if (action.endpoint) {
                            const success = await this.genericSync(action)
                            if (success) {
                                await this.removeAction(action.id)
                                syncedCount++
                            } else {
                                await this.handleFailedAction(action)
                            }
                        } else {
                            console.warn(`No handler for action type: ${action.type}`)
                            await this.handleFailedAction(action)
                        }
                    }
                } catch (error) {
                    console.error(`Error syncing action ${action.id}:`, error)
                    await this.handleFailedAction(action)
                }
            }

            return syncedCount
        } finally {
            this.isSyncing = false
        }
    }

    /**
     * Generic sync using fetch API
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
        } catch (error) {
            console.error('Generic sync failed:', error)
            return false
        }
    }

    /**
     * Handle failed action (increment retry or remove if max retries exceeded)
     */
    private async handleFailedAction(action: OfflineAction): Promise<void> {
        if (action.retryCount >= MAX_RETRY_COUNT) {
            console.warn(`Action ${action.id} exceeded max retries, removing`)
            await this.removeAction(action.id)
        } else {
            await this.incrementRetry(action.id)
        }
    }

    /**
     * Check if there are pending actions
     */
    async hasPendingActions(): Promise<boolean> {
        const actions = await this.getPendingActions()
        return actions.length > 0
    }
}

export const offlineSyncService = new OfflineSyncService()
