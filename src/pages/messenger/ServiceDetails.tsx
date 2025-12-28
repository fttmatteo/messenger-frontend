import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Phone, Clock, User, Building2, FileImage, Loader2, AlertCircle, Edit } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { toast } from "sonner"
import { trackingService } from "@/services/tracking.service"
import { getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { useStatusColors } from "@/hooks/useStatusColors"


export default function ServiceDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { colors } = useStatusColors()
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
            } catch (error) {
                const message = getErrorMessage(error)
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
        const toastId = toast.loading("Obteniendo ubicación precisa...")
        const openMaps = (originLat?: number, originLng?: number) => {
            let url = ''

            if (latitude && longitude) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
                if (originLat && originLng) {
                    url += `&origin=${originLat},${originLng}`
                }
            } else if (address) {
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
            } else {
                toast.error('No hay ubicación disponible para este concesionario', { id: toastId })
                return
            }

            toast.dismiss(toastId)
            window.open(url, '_blank')
        }

        const cached = trackingService.getLastKnownLocation()
        if (cached && (Date.now() - cached.timestamp < 120000)) {
            toast.dismiss(toastId)
            openMaps(cached.latitude, cached.longitude)
            return
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    openMaps(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.warn("High accuracy error", error)
                    toast.loading("GPS lento, intentando ubicación aproximada...", { id: toastId })
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            openMaps(pos.coords.latitude, pos.coords.longitude)
                        },
                        (err) => {
                            console.warn("Low accuracy error", err)
                            toast.warning("Ubicación no disponible. Abriendo mapa...", { id: toastId })
                            openMaps()
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 10000,
                            maximumAge: 60000
                        }
                    )
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
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
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                <PlacaBadge
                    plateNumber={service.plate.plateNumber}
                    plateType={service.plate.plateType}
                    size="sm"
                />

                {service.currentStatus === 'ASSIGNED' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={handleUpdateStatus}
                    >
                        <Edit className="h-4 w-4" />
                        Actualizar
                    </Button>
                )}
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Status Section - Minimalist */}
                <div className="mb-8 flex items-center gap-4 px-1">
                    <div className="h-3 w-3 rounded-full border border-black dark:border-white" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground leading-none mb-1">
                            Estado del servicio
                        </span>
                        <span className="text-xl font-bold tracking-tight">
                            {getStatusIconConfig(service.currentStatus, colors).label}
                        </span>
                    </div>
                </div>

                {/* Dealership Info */}
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4" />
                        Concesionario destino
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
                            Iniciar navegación
                        </Button>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Service Info */}
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" />
                        Información del servicio
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Creado:</span>
                            <span>{formatDateTime(service.createdAt)}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Mensajero:</span>
                            </div>
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

                {/* Plate Image - from photos array */}
                {service.photos.find(p => p.photoType === 'PLATE_DETECTION') && (
                    <>
                        <Separator className="my-6" />
                        <div className="mb-6">
                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <FileImage className="h-4 w-4" />
                                Lectura de la placa
                            </h3>
                            <img
                                src={service.photos.find(p => p.photoType === 'PLATE_DETECTION')?.photoPath}
                                alt="Placa del vehículo"
                                className="w-full rounded-lg border object-contain max-h-48"
                            />
                        </div>
                    </>
                )}


            </div>
        </div>
    )
}
