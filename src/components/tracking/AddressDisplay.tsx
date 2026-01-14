import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { logger } from "@/utils/logger"

// Address cache to avoid repeated API calls
const addressCache = new Map<string, string>()

// Request queue for rate limiting
const requestQueue: Array<() => Promise<void>> = []
let isProcessingQueue = false

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return
    isProcessingQueue = true

    while (requestQueue.length > 0) {
        const request = requestQueue.shift()
        if (request) {
            await request()
            // Wait 300ms between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300))
        }
    }

    isProcessingQueue = false
}

const addToQueue = (request: () => Promise<void>) => {
    requestQueue.push(request)
    processQueue()
}

/**
 * Component to display address from coordinates using Google Maps Geocoder API.
 * Uses caching and request queuing to optimize API usage.
 */
export function AddressDisplay({ lat, lng, className }: { lat: number; lng: number, className?: string }) {
    const [address, setAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`

    useEffect(() => {
        // Check cache first
        if (addressCache.has(cacheKey)) {
            setAddress(addressCache.get(cacheKey)!)
            setLoading(false)
            return
        }

        const fetchAddress = async () => {
            try {
                // Check if Google Maps API is loaded
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

        // Add to queue instead of calling immediately
        addToQueue(fetchAddress)
    }, [lat, lng, cacheKey])

    if (loading) {
        return <Skeleton className="h-4 w-32" />
    }

    return <span className={className || "truncate max-w-[180px]"} title={address || ''}>{address}</span>
}
