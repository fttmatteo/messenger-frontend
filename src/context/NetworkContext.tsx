import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { NetworkContext } from './NetworkContextDef'
import { toast } from 'sonner'
import { Wifi, WifiOff, RefreshCw, CloudOff } from 'lucide-react'
import { offlineSyncService } from '@/services/offline-sync.service'
import { logger } from '@/utils/logger'

interface NetworkProviderProps {
    children: ReactNode
}

export function NetworkProvider({ children }: NetworkProviderProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [wasOffline, setWasOffline] = useState(false)
    const [offlineReady, setOfflineReady] = useState(false)
    const [needRefresh, setNeedRefresh] = useState(false)
    const [pendingActionsCount, setPendingActionsCount] = useState(0)



    const syncPendingActions = useCallback(async () => {
        const actions = await offlineSyncService.getPendingActions()

        if (actions.length === 0) return

        try {
            const syncedCount = await offlineSyncService.syncAll()

            if (syncedCount > 0) {
                toast.success(`${syncedCount} acción${syncedCount > 1 ? 'es' : ''} sincronizada${syncedCount > 1 ? 's' : ''}`, {
                    icon: <CloudOff className="h-4 w-4" />,
                    duration: 3000,
                    id: 'network-sync-success',
                })
            }

            setPendingActionsCount(0)
        } catch (error) {
            logger.error('Error syncing pending actions in NetworkContext:', error)
            toast.error('Error al sincronizar algunas acciones', {
                description: 'Se reintentará automáticamente',
                duration: 4000,
                id: 'network-sync-error',
            })
        }
    }, [])

    const updateServiceWorker = useCallback(() => {
        if (window.__updateSW) {
            window.__updateSW(true)
        }
        setNeedRefresh(false)
    }, [])

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)

            if (wasOffline) {
                toast.success('Conexión restaurada', {
                    description: 'Sincronizando datos...',
                    icon: <Wifi className="h-4 w-4" />,
                    duration: 3000,
                    id: 'network-online',
                })

                syncPendingActions()
            }

            setWasOffline(false)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setWasOffline(true)

            toast.warning('Sin conexión', {
                description: 'Trabajando en modo offline',
                icon: <WifiOff className="h-4 w-4" />,
                duration: 4000,
                id: 'network-offline',
            })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [wasOffline, syncPendingActions])

    useEffect(() => {
        const handleOfflineReady = () => {
            setOfflineReady(true)
        }

        const handleNeedRefresh = () => {
            setNeedRefresh(true)

            toast('Nueva versión disponible', {
                description: 'Actualiza para obtener las últimas mejoras',
                icon: <RefreshCw className="h-4 w-4" />,
                action: {
                    label: 'Actualizar',
                    onClick: () => updateServiceWorker(),
                },
                duration: 10000,
                id: 'sw-update-available',
            })
        }

        window.addEventListener('sw-offline-ready', handleOfflineReady)
        window.addEventListener('sw-need-refresh', handleNeedRefresh)

        return () => {
            window.removeEventListener('sw-offline-ready', handleOfflineReady)
            window.removeEventListener('sw-need-refresh', handleNeedRefresh)
        }
    }, [updateServiceWorker])

    useEffect(() => {
        const updateCount = async () => {
            const actions = await offlineSyncService.getPendingActions()
            setPendingActionsCount(actions.length)
        }

        updateCount()

        const interval = setInterval(updateCount, 5000)

        return () => clearInterval(interval)
    }, [])

    const dismissUpdate = useCallback(() => {
        setNeedRefresh(false)
    }, [])

    return (
        <NetworkContext.Provider
            value={{
                isOnline,
                wasOffline,
                offlineReady,
                needRefresh,
                pendingActionsCount,
                updateServiceWorker,
                dismissUpdate,
            }}
        >
            {children}
        </NetworkContext.Provider>
    )
}

declare global {
    interface Window {
        __updateSW?: (reloadPage?: boolean) => void
    }
}
