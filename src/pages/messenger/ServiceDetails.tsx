import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Navigation, Phone, Clock, User, Building2, FileImage, AlertCircle, Edit, MessageSquareText } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { toast } from "sonner"
import { trackingService } from "@/services/tracking.service"
import { getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import { openMaps } from "@/lib/navigation-utils"


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

        const triggerNavigation = (originLat?: number, originLng?: number) => {
            toast.dismiss(toastId)
            openMaps(
                { latitude, longitude, address },
                originLat,
                originLng
            )
        }

        const cached = trackingService.getLastKnownLocation()
        if (cached && (Date.now() - cached.timestamp < 120000)) {
            triggerNavigation(cached.latitude, cached.longitude)
            return
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    triggerNavigation(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.warn("High accuracy error", error)
                    toast.loading("GPS lento, intentando ubicación aproximada...", { id: toastId })
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            triggerNavigation(pos.coords.latitude, pos.coords.longitude)
                        },
                        (err) => {
                            console.warn("Low accuracy error", err)
                            toast.warning("Ubicación no disponible. Abriendo mapa...", { id: toastId })
                            triggerNavigation()
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
            triggerNavigation()
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
                <div className="flex-1 overflow-auto">
                    {/* Hero Card Skeleton */}
                    <div className="p-4 pb-2">
                        <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                            <div className="flex flex-col items-center gap-3">
                                <Skeleton className="h-12 w-32 rounded-md" />
                                <Skeleton className="h-7 w-24 rounded-full" />
                                <div className="flex items-center gap-2 w-full mt-2">
                                    <Skeleton className="flex-1 h-11 rounded-lg" />
                                    <Skeleton className="flex-1 h-11 rounded-lg" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Dealership Card Skeleton */}
                    <div className="px-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </Card>
                    </div>

                    {/* Service Info Card Skeleton */}
                    <div className="px-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-44" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-56" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </Card>
                    </div>
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
        <div className="flex flex-col">
            {/* Scrollable Content */}
            <div className="">
                {/* Hero Card - Plate, Status & Actions */}
                <div className="p-4 pb-2">
                    <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                        <div className="flex flex-col items-center gap-3">
                            <PlacaBadge
                                plateNumber={service.plate.plateNumber}
                                plateType={service.plate.plateType}
                                size="xl"
                            />

                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                            >
                                <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                                <span className="text-sm font-semibold">
                                    {getStatusIconConfig(service.currentStatus, colors).label}
                                </span>
                            </div>

                            {/* Action Buttons - Side by Side */}
                            <div className="flex items-center gap-2 w-full mt-2">
                                <Button
                                    className="flex-1 h-11 gap-2"
                                    onClick={handleNavigate}
                                >
                                    <Navigation className="h-4 w-4" />
                                    Navegar
                                </Button>

                                {(service.currentStatus === 'ASSIGNED' || service.currentStatus === 'PENDING' || service.currentStatus === 'RETURNED') && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 gap-2"
                                        onClick={handleUpdateStatus}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Actualizar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Dealership Card */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Concesionario destino</h3>
                        </div>
                        <div className="space-y-2">
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
                        </div>
                    </Card>
                </div>

                {/* Service Info Card */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Información del servicio</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Creado:</span>
                                <span>{formatDateTime(service.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Mensajero:</span>
                                <span className="font-medium">{service.messenger.fullName}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Observation Card */}
                {service.observation && (
                    <div className="px-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <MessageSquareText className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold">Observaciones</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{service.observation}</p>
                        </Card>
                    </div>
                )}

                {/* Plate Image Card */}
                {service.photos.find(p => p.photoType === 'PLATE_DETECTION') && (
                    <div className="px-4 pb-4">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <FileImage className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold">Lectura de la placa</h3>
                            </div>
                            <img
                                src={service.photos.find(p => p.photoType === 'PLATE_DETECTION')?.photoPath}
                                alt="Placa del vehículo"
                                className="w-full rounded-lg border object-contain max-h-48"
                            />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
