import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Map as MapComponent } from "@/components/Map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PulsingMarker, MessengerListPanel } from "@/components/tracking"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { authService } from "@/services/auth.service"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { isMessengerOnline } from "@/lib/messenger-utils"
import { employeeService } from "@/services/employee.service"
import { getErrorMessage, isAxiosError } from "@/lib/error-utils"
import { MessengerSidePanel } from "./MessengerSidePanel"
import { logger } from "@/utils/logger"

/**
 * Valida si un par de coordenadas son números finitos y válidos para su uso en el mapa.
 * 
 * @param {number} [lat] - Latitud a validar.
 * @param {number} [lng] - Longitud a validar.
 * @returns {boolean} True si las coordenadas son válidas.
 */
const isValidCoords = (lat?: number, lng?: number): boolean => {
    return typeof lat === 'number' && typeof lng === 'number' &&
        isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0
}

/**
 * Componente principal de monitoreo y rastreo en tiempo real para administradores.
 * Muestra un mapa interactivo con la ubicación de todos los mensajeros activos.
 * Se integra con WebSockets para recibir actualizaciones de ubicación y estado de presencia.
 * Permite seleccionar mensajeros, seguirlos en el mapa y ver detalles de sus servicios actuales.
 */
export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter,] = useState({ lat: 6.2442, lng: -75.5812 }) // Medellín - Initial only
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
    const [showMessengerDetails, setShowMessengerDetails] = useState(false)
    const [followingMessengerId, setFollowingMessengerId] = useState<number | null>(null)
    const { setSuccess, setError } = useAdminUI()

    // Refs para evitar reinicios de conexión cuando cambian estas dependencias
    const followingMessengerIdRef = useRef<number | null>(null)
    const mapRef = useRef<google.maps.Map | null>(null)

    // Actualizar refs cuando cambia el estado
    useEffect(() => {
        followingMessengerIdRef.current = followingMessengerId
    }, [followingMessengerId])

    useEffect(() => {
        mapRef.current = map
    }, [map])

    // Timestamp unificado para sincronizar estado en todos los componentes UI (Map, List, SidePanel)
    // Intervalo de 10s asegura respuesta rápida para desconexiones
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 10000)
        return () => clearInterval(timer)
    }, [])

    // Obtener datos iniciales via REST (Todos los mensajeros + estado)
    const fetchMessengers = useCallback(async (manual = false) => {
        try {
            setLoading(true)

            // 1. Obtener todos los mensajeros
            const allEmployees = await employeeService.getAll()
            const messengerEmployees = allEmployees.filter(e => e.role === 'MESSENGER')

            // 2. Obtener sesiones activas
            const activeMessengers = await trackingApiService.getActiveMessengers()
            const activeMap = new Map(activeMessengers.map(m => [m.messengerId, m]))

            // 3. Fusionar datos
            const combinedRequests = messengerEmployees.map(async (emp) => {
                const formattedName = formatDisplayName(emp.fullName)

                // Si está activo, usar datos activos
                if (activeMap.has(emp.idEmployee)) {
                    return { ...activeMap.get(emp.idEmployee)!, messengerName: formattedName, messengerUuid: emp.uuid }
                }

                // Si está offline, intentar obtener última ubicación
                try {
                    const lastLoc = await trackingApiService.getLastLocation(emp.uuid)
                    if (lastLoc) {
                        return { ...lastLoc, status: 'OFFLINE' as const, messengerName: formattedName, messengerUuid: emp.uuid }
                    }
                } catch (e) {
                    if (isAxiosError(e) && e.response?.status !== 404) {
                        logger.apiError(`Error fetching last location for messenger ${emp.idEmployee}`, e)
                    }
                }

                // Estructura offline por defecto sin ubicación
                return {
                    messengerId: emp.idEmployee,
                    messengerUuid: emp.uuid,
                    messengerName: formattedName,
                    latitude: 0,
                    longitude: 0,
                    lastUpdate: "",
                    status: 'OFFLINE' as const,
                    speed: 0,
                    heading: 0
                }
            })

            const updatedMessengers = await Promise.all(combinedRequests)
            setMessengers(updatedMessengers)

            // Actualizar mensajero seleccionado si existe en nuevos datos
            setSelectedMessenger(current => {
                if (!current) return null
                const refreshed = updatedMessengers.find(m => m.messengerId === current.messengerId)
                return refreshed || current
            })

            if (manual) {
                setSuccess(`Monitoreo actualizado`)
            }

            // Centrar mapa en primer mensajero activo si está disponible Y refresco manual (usando ref)
            if (!manual && updatedMessengers.length > 0) {
                const firstActive = updatedMessengers.find(m => m.status === 'ACTIVE' && isValidCoords(m.latitude, m.longitude))
                if (firstActive && mapRef.current) {
                    mapRef.current.panTo({ lat: firstActive.latitude, lng: firstActive.longitude })
                }
            }

        } catch (error) {
            logger.error("Error fetching messengers in LiveTracking:", error)
            if (isAxiosError(error) && error.response?.status !== 404) {
                setError(getErrorMessage(error))
            }
        } finally {
            setLoading(false)
        }
    }, [setSuccess, setError]) // Eliminada dependencia 'map' para estabilidad

    // Manejar actualizaciones en tiempo real
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        setMessengers(prev => {
            const existingIndex = prev.findIndex(m => m.messengerId === update.messengerId)

            if (existingIndex >= 0) {
                const updatedList = [...prev]
                const existing = prev[existingIndex]
                updatedList[existingIndex] = { ...existing, ...update, messengerName: existing.messengerName || update.messengerName }
                return updatedList
            }

            return [...prev, update]
        })

        setSelectedMessenger(prev => {
            if (prev?.messengerId === update.messengerId) {
                return { ...prev, ...update, messengerName: prev.messengerName || update.messengerName }
            }
            return prev
        })

        // Modo seguimiento: usar refs para evitar re-crear la función
        const currentFollowId = followingMessengerIdRef.current
        const currentMap = mapRef.current

        if (currentFollowId === update.messengerId && isValidCoords(update.latitude, update.longitude) && currentMap) {
            currentMap.panTo({ lat: update.latitude, lng: update.longitude })
        }
    }, []) // Sin dependencias inestables

    // Conectar a WebSocket al montar
    useEffect(() => {
        // Carga inicial de datos
        fetchMessengers() // fetchMessengers es ahora estable

        const startTracking = async () => {
            // Omitir si ya está conectado
            if (trackingService.isCurrentlyConnected()) {
                setConnected(true)
                // Asegurarse de suscribir incluso si ya estaba conectado (idempotente)
                // trackingService maneja suscripciones duplicadas internamente o lo podemos manejar aquí
                // Pero lo más seguro es reconectar si queremos garantizar el estado limpio
                return
            }

            try {
                const token = await authService.getWsToken()
                trackingService.connect(token, () => {
                    setConnected(true)
                    trackingService.subscribeToAll(handleTrackingUpdate)
                    trackingService.subscribeToPresence(handleTrackingUpdate)
                })
            } catch (err) {
                // Fallback silencioso - normal en Safari Mobile
                logger.debug('WS token unavailable for Admin, using cookie fallback', err)
                trackingService.connect(undefined, () => {
                    setConnected(true)
                    trackingService.subscribeToAll(handleTrackingUpdate)
                    trackingService.subscribeToPresence(handleTrackingUpdate)
                })
            }
        }

        startTracking()

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchMessengers, handleTrackingUpdate]) // Ahora estas dependencias son estables

    const selectMessenger = useCallback((messenger: LiveTrackingUpdate) => {
        setSelectedMessenger(messenger)
        setShowMessengerDetails(true)
        if (isValidCoords(messenger.latitude, messenger.longitude) && map) {
            map.panTo({ lat: messenger.latitude, lng: messenger.longitude })
            map.setZoom(15)
        }
    }, [map])

    const deselectMessenger = useCallback(() => {
        setSelectedMessenger(null)
        setShowMessengerDetails(false)
        setFollowingMessengerId(null)
    }, [])

    const toggleFollow = useCallback((messengerId: number) => {
        if (followingMessengerId === messengerId) {
            setFollowingMessengerId(null)
        } else {
            setFollowingMessengerId(messengerId)
            const messenger = messengers.find(m => m.messengerId === messengerId)
            if (messenger && isValidCoords(messenger.latitude, messenger.longitude) && map) {
                map.panTo({ lat: messenger.latitude, lng: messenger.longitude })
            }
        }
    }, [followingMessengerId, messengers, map])

    // Memorizar marcadores visibles con estado online calculado
    // Dependencia 'now' asegura recálculo para detección de offline
    const visibleMarkers = useMemo(() => {
        return messengers
            .filter(m => isValidCoords(m.latitude, m.longitude))
            .map(m => ({
                ...m,
                isOnline: isMessengerOnline(m.status, m.lastHeartbeat || m.lastUpdate, 2, now)
            }))
    }, [messengers, now])

    return (
        <div className="h-full w-full relative overflow-hidden">
            <div className="absolute inset-0">
                <MapComponent className="w-full h-full" center={mapCenter} zoom={13} onLoad={setMap}>
                    {visibleMarkers.map((marker) => (
                        <PulsingMarker
                            key={marker.messengerId}
                            messenger={marker}
                            onClick={selectMessenger}
                            onDeselect={deselectMessenger}
                            isOnline={marker.isOnline}
                            isSelected={selectedMessenger?.messengerId === marker.messengerId}
                        />
                    ))}
                </MapComponent>

            </div>

            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
                <div className="flex items-center gap-3 bg-background/60 backdrop-blur-xl rounded-lg px-3 shadow-lg border h-10">
                    <h1 className="text-sm font-medium">Monitoreo</h1>
                    <div className="h-4 w-px bg-border" />
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1 h-6 justify-center text-xs font-normal",
                            connected
                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                        )}
                    >
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchMessengers(true)}
                        disabled={loading}
                        className="h-6 w-6 p-0 hover:bg-muted"
                        title="Actualizar datos"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className={cn(
                "absolute right-4 top-4 bottom-4 transition-all duration-300 z-10",
                isPanelCollapsed ? "w-9" : "w-72",
                showMessengerDetails && "opacity-0 pointer-events-none translate-x-full"
            )}>
                <MessengerListPanel
                    messengers={messengers}
                    selectedMessengerId={selectedMessenger?.messengerId || null}
                    followingMessengerId={followingMessengerId}
                    loading={loading}
                    isCollapsed={isPanelCollapsed}
                    onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
                    onSelect={selectMessenger}
                    now={now}
                />
            </div>

            <MessengerSidePanel
                messenger={selectedMessenger}
                messengerUuid={selectedMessenger?.messengerUuid || null}
                isOpen={showMessengerDetails}
                onClose={deselectMessenger}
                onFollow={toggleFollow}
                isFollowing={followingMessengerId === selectedMessenger?.messengerId}
                now={now}
            />
        </div>
    )
}
