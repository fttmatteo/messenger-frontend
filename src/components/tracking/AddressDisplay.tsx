import { useState, useEffect } from "react"
import { logger } from "@/utils/logger"

const addressCache = new Map<string, string>()
const requestQueue: Array<() => Promise<void>> = []
let isProcessingQueue = false

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return
    isProcessingQueue = true

    while (requestQueue.length > 0) {
        const request = requestQueue.shift()
        if (request) {
            await request()
            await new Promise(resolve => setTimeout(resolve, 300))
        }
    }

    isProcessingQueue = false
}

const addToQueue = (request: () => Promise<void>) => {
    requestQueue.push(request)
    processQueue()
}

export function AddressDisplay({ lat, lng, className }: { lat: number; lng: number, className?: string }) {
    const [address, setAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`

    useEffect(() => {
        if (addressCache.has(cacheKey)) {
            setAddress(addressCache.get(cacheKey)!)
            setLoading(false)
            return
        }

        const fetchAddress = async () => {
            try {
                if (!window.google?.maps?.Geocoder) {
                    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                    setLoading(false)
                    return
                }

                const geocoder = new google.maps.Geocoder()
                const response = await geocoder.geocode({ location: { lat, lng } })

                if (response.results && response.results.length > 0) {
                    const addr = response.results[0].formatted_address
                    addressCache.set(cacheKey, addr)
                    setAddress(addr)
                } else {
                    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                }
            } catch (err) {
                logger.warn('Reverse geocode error in AddressDisplay:', err)
                setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
            } finally {
                setLoading(false)
            }
        }
        addToQueue(fetchAddress)
    }, [lat, lng, cacheKey])

    if (loading) {
        return null
    }

    return <span className={className || "truncate max-w-[180px]"} title={address || ''}>{address}</span>
}
