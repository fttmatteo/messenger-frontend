import { useState, useCallback } from 'react'
import { trackingService } from '@/services/tracking.service'
import { createLogger } from '@/utils/logger'
import { toast } from 'sonner'

const logger = createLogger('useSmartLocation')

export interface LocationResult {
    latitude: number
    longitude: number
}

export function useSmartLocation() {
    const [loading, setLoading] = useState(false)

    const getCurrentLocation = useCallback(async (): Promise<LocationResult> => {
        setLoading(true)
        try {
            // 1. Check cached location first (within last 5 mins)
            const lastKnown = trackingService.getLastKnownLocation()
            const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000)

            if (isRecent && lastKnown) {
                logger.info("Using cached location")
                return { latitude: lastKnown.latitude, longitude: lastKnown.longitude }
            }

            // 2. Fallback to fresh Geolocation API
            return await new Promise<LocationResult>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("La geolocalización no es soportada por este navegador."))
                    return
                }

                const timeoutId = setTimeout(() => {
                    reject(new Error("Tiempo de espera agotado (Timeout)"))
                }, 10000)

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId)
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
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )
            })
        } catch (error) {
            logger.warn("Could not get location:", error)
            const msg = error instanceof Error ? error.message : "Error desconocido"
            toast.warning("Ubicación no capturada", {
                description: `${msg}. Se continuará sin ubicación precisa.`,
                duration: 4000
            })
            // Return empty object or handle as needed by consumer, 
            // but strongly typed return suggests we might want to throw or return null.
            // For now, consistent with previous behavior, we might return empty or null.
            // Since the original code returned partials or threw, let's throw to let consumer decide,
            // OR return undefined values if that fits the flow.
            // The original CreateServicio returned {} which is { undefined, undefined }.
            // UpdateStatus handled it by catching or setting undefined.

            throw error;
        } finally {
            setLoading(false)
        }
    }, [])

    return { getCurrentLocation, loading }
}
