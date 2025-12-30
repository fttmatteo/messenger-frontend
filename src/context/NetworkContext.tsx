import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { NetworkContext } from './NetworkContextDef'
import { toast } from 'sonner'
import { Wifi, WifiOff, RefreshCw, CloudOff } from 'lucide-react'
import { offlineSyncService } from '@/services/offline-sync.service'

interface NetworkProviderProps {
    children: ReactNode
}

export function NetworkProvider({ children }: NetworkProviderProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [wasOffline, setWasOffline] = useState(false)
    const [offlineReady, setOfflineReady] = useState(false)
    const [needRefresh, setNeedRefresh] = useState(false)
    const [pendingActionsCount, setPendingActionsCount] = useState(0)

    // Track if this is the first offline-ready event
    const [hasShownOfflineReady, setHasShownOfflineReady] = useState(() => {
        return localStorage.getItem('pwa_offline_ready_shown') === 'true'
    })

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)

            // Show reconnection toast if was offline
            if (wasOffline) {
                toast.success('Conexión restaurada', {
                    description: 'Sincronizando datos...',
                    icon: <Wifi className="h-4 w-4" />,
                    duration: 3000,
                })

                // Trigger sync of pending actions
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
            })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [wasOffline])

    // Listen for Service Worker events
    useEffect(() => {
        const handleOfflineReady = () => {
            setOfflineReady(true)

            // Show toast only once (first time app becomes offline-ready)
            if (!hasShownOfflineReady) {
                toast.success('App lista para uso sin conexión', {
                    description: 'Puedes seguir trabajando sin internet',
                    icon: <WifiOff className="h-4 w-4" />,
                    duration: 5000,
                })
                localStorage.setItem('pwa_offline_ready_shown', 'true')
                setHasShownOfflineReady(true)
            }
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
            })
        }

        window.addEventListener('sw-offline-ready', handleOfflineReady)
        window.addEventListener('sw-need-refresh', handleNeedRefresh)

        return () => {
            window.removeEventListener('sw-offline-ready', handleOfflineReady)
            window.removeEventListener('sw-need-refresh', handleNeedRefresh)
        }
    }, [hasShownOfflineReady])

    // Update pending actions count periodically
    useEffect(() => {
        const updateCount = async () => {
            const actions = await offlineSyncService.getPendingActions()
            setPendingActionsCount(actions.length)
        }

        updateCount()

        // Listen for changes
        const interval = setInterval(updateCount, 5000)

        return () => clearInterval(interval)
    }, [])

    // Sync pending actions when coming back online
    const syncPendingActions = useCallback(async () => {
        const actions = await offlineSyncService.getPendingActions()

        if (actions.length === 0) return

        try {
            const syncedCount = await offlineSyncService.syncAll()

            if (syncedCount > 0) {
                toast.success(`${syncedCount} acción${syncedCount > 1 ? 'es' : ''} sincronizada${syncedCount > 1 ? 's' : ''}`, {
                    icon: <CloudOff className="h-4 w-4" />,
                    duration: 3000,
                })
            }

            setPendingActionsCount(0)
        } catch (error) {
            console.error('Error syncing pending actions:', error)
            toast.error('Error al sincronizar algunas acciones', {
                description: 'Se reintentará automáticamente',
                duration: 4000,
            })
        }
    }, [])

    const updateServiceWorker = useCallback(() => {
        // Call the global update function set by main.tsx
        if (window.__updateSW) {
            window.__updateSW(true)
        }
        setNeedRefresh(false)
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

// Add type declaration for the global update function
declare global {
    interface Window {
        __updateSW?: (reloadPage?: boolean) => void
    }
}
