import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/messenger/StatusBadge"
import {
    MapPin,
    Navigation,
    Phone,
    Clock,
    User,
    Building2,
    FileImage,
    Loader2,
    AlertCircle,
    Edit // Added Edit import
} from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { toast } from "sonner"
import { trackingService } from "@/services/tracking.service"

export default function ServiceDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || 'Error al cargar servicio'
                setError(message)
                toast.error('Error al cargar servicio', {
                    description: message,
                    id: 'error-fetch-service'
                })
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id])

    const handleNavigate = () => {
        if (!service?.dealership) return

        const { latitude, longitude, address } = service.dealership

        // Show loading toast because getting location takes time
        const toastId = toast.loading("Obteniendo ubicación precisa...")

        const openMaps = (originLat?: number, originLng?: number) => {
            let url = ''

            if (latitude && longitude) {
                // Use dir action with destination and optional origin
                url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
                if (originLat && originLng) {
                    url += `&origin=${originLat},${originLng}`
                }
            } else if (address) {
                // Fallback to search query
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
            } else {
                toast.error('No hay ubicación disponible para este concesionario', { id: toastId })
                return
            }

            toast.dismiss(toastId)
            window.open(url, '_blank')
        }

        // 1. Try to use cached location from background tracking (instant)
        const cached = trackingService.getLastKnownLocation()
        // Use cache if it's recent (less than 2 minutes old)
        if (cached && (Date.now() - cached.timestamp < 120000)) {
            toast.dismiss(toastId)
            openMaps(cached.latitude, cached.longitude)
            // Optional: notify user we used cached location
            // toast.success("Usando ubicación actual", { duration: 1500 })
            return
        }

        // 2. If no cache, fetch fresh location
        if ('geolocation' in navigator) {
            // First try high accuracy
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    openMaps(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.warn("High accuracy error", error)

                    // Fallback to low accuracy if high accuracy fails (timeout or unavailable)
                    toast.loading("GPS lento, intentando ubicación aproximada...", { id: toastId })

                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            openMaps(pos.coords.latitude, pos.coords.longitude)
                        },
                        (err) => {
                            console.warn("Low accuracy error", err)
                            toast.warning("Ubicación no disponible. Abriendo mapa...", { id: toastId })
                            // Final fallback without explicit origin
                            openMaps()
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 10000,
                            maximumAge: 60000 // Accept 1 min old cached position
                        }
                    )
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Increased timeout to 15s
                    maximumAge: 0
                }
            )
        } else {
            openMaps()
        }
    }

    const handleUpdateStatus = () => {
        navigate(`/messenger/servicio/${id}/actualizar`)
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex items-center gap-3 p-4 border-b">
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    // Error state
    if (error || !service) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex items-center gap-3 p-4 border-b">
                    <span className="font-semibold">Detalle del Servicio</span>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground mb-4">{error || 'Servicio no encontrado'}</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Volver
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <PlacaBadge
                        plateNumber={service.plate.plateNumber}
                        plateType={service.plate.plateType}
                        size="sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={service.currentStatus} showLabel />

                    {service.currentStatus === 'ASSIGNED' && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-muted rounded-full"
                            onClick={handleUpdateStatus}
                            title="Actualizar Estado"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Plate Image - from photos array */}
                {service.photos.find(p => p.photoType === 'PLATE_DETECTION') && (
                    <>
                        <div className="mb-6">
                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <FileImage className="h-4 w-4" />
                                Imagen de la Placa
                            </h3>
                            <img
                                src={service.photos.find(p => p.photoType === 'PLATE_DETECTION')?.photoPath}
                                alt="Placa del vehículo"
                                className="w-full rounded-lg border object-contain max-h-48"
                            />
                        </div>
                        <Separator className="my-6" />
                    </>
                )}

                {/* Dealership Info */}
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4" />
                        Concesionario Destino
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-base">{service.dealership.name}</p>
                            <p className="text-sm text-muted-foreground">{service.dealership.zone}</p>
                        </div>

                        {service.dealership.address && (
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span>{service.dealership.address}</span>
                            </div>
                        )}

                        {service.dealership.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`tel:${service.dealership.phone}`}
                                    className="text-primary underline"
                                >
                                    {service.dealership.phone}
                                </a>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-base gap-2 mt-2"
                            onClick={handleNavigate}
                        >
                            <Navigation className="h-5 w-5" />
                            Iniciar Navegación
                        </Button>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Service Info */}
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" />
                        Información del Servicio
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Creado:</span>
                            <span>{formatDateTime(service.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Mensajero:</span>
                            <span className="font-medium">{service.messenger.fullName}</span>
                        </div>
                    </div>
                </div>

                {/* Observation */}
                {service.observation && (
                    <>
                        <Separator className="my-6" />
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Observaciones</h3>
                            <p className="text-sm text-muted-foreground">{service.observation}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
