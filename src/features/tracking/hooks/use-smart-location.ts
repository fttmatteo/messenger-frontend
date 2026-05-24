import { useState, useCallback } from 'react'
import { trackingService } from '@/features/tracking/services/tracking.service'
import { createLogger } from '@/shared/utils/logger'
import { showToast } from '@/shared/config/toast-config'
import { Geolocation } from '@capacitor/geolocation'
import { isNative } from '@/shared/lib/capacitor'

const logger = createLogger('useSmartLocation')

/**
 * Estructura de coordenadas geográficas simples.
 */
export interface LocationResult {
    latitude: number
    longitude: number
}

/**
 * Hook para obtener la ubicación actual del dispositivo de forma optimizada.
 * Soporta modo Nativo (Capacitor) y Web.
 */
export function useSmartLocation() {
    const [loading, setLoading] = useState(false)

    /**
     * Obtiene las coordenadas actuales con lógica de optimización.
     * Prioriza el último punto conocido por el servicio de rastreo si es reciente (menos de 5 min)
     * para ahorrar batería y mejorar la respuesta en zonas de baja señal.
     */
    const getCurrentLocation = useCallback(async (): Promise<LocationResult> => {
        setLoading(true)
        try {
            const lastKnown = trackingService.getLastKnownLocation()
            const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000)

            if (isRecent && lastKnown) {
                return { latitude: lastKnown.latitude, longitude: lastKnown.longitude }
            }

            if (isNative()) {
                try {
                    const permissions = await Geolocation.checkPermissions()
                    if (permissions.location !== 'granted') {
                        const request = await Geolocation.requestPermissions()
                        if (request.location !== 'granted') {
                            throw new Error("Permiso de ubicación denegado permanentemente")
                        }
                    }

                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 0
                    })

                    trackingService.setLastLocation(position.coords.latitude, position.coords.longitude)

                    return {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                } catch (nativeError) {
                    const err = nativeError as { message?: string };
                    throw new Error(err?.message || "Error al obtener ubicación nativa")
                }
            } else {
                return await new Promise<LocationResult>((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error("La geolocalización no es soportada por este navegador."))
                        return
                    }

                    const timeoutId = setTimeout(() => {
                        reject(new Error("Tiempo de espera agotado (Timeout)"))
                    }, 20000)

                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            clearTimeout(timeoutId)
                            trackingService.setLastLocation(pos.coords.latitude, pos.coords.longitude)

                            resolve({
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude
                            })
                        },
                        (err) => {
                            clearTimeout(timeoutId)
                            let msg = err.message
                            if (err.code === 1) msg = "Permiso de ubicación denegado"
                            else if (err.code === 2) msg = "Ubicación no disponible"
                            else if (err.code === 3) msg = "Tiempo de espera agotado"
                            reject(new Error(msg))
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 20000,
                            maximumAge: 0
                        }
                    )
                })
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Error desconocido"
            logger.error("Error al obtener ubicación inteligente", error)
            showToast.warning("Ubicación no capturada", {
                description: `${msg}. Se continuará sin ubicación precisa.`,
                duration: 4000
            })

            throw error;
        } finally {
            setLoading(false)
        }
    }, [])

    return { getCurrentLocation, loading }
}
