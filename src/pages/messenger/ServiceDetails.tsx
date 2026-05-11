import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, Phone, Clock, User, Building2, FileImage, AlertCircle, Edit, MessageSquareText } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { showToast } from "@/config/toast-config"
import { trackingService } from "@/services/tracking.service"
import { getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import { openMaps } from "@/lib/navigation-utils"
import { getImageUrl } from "@/lib/image-utils"
import { logger } from "@/utils/logger"
import { ServiceDetailsSkeleton } from "@/components/service/ServiceSkeletons"
import { useNetwork } from "@/hooks/use-network"
import { WifiOff } from "lucide-react"


/**
 * Vista detallada de un servicio (entrega) desde la perspectiva del mensajero.
 * Muestra información del vehículo (placa), el concesionario de destino,
 * datos de contacto y observaciones. Permite iniciar la navegación hacia
 * el destino y acceder a la actualización de estado del servicio.
 */
export default function ServiceDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { colors } = useStatusColors()
    const { isOnline } = useNetwork()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)
                const data = await serviceDeliveryService.getById(id)
                setService(data)
            } catch (error) {
                const message = getErrorMessage(error)
                setError(message)
                showToast.error('Error al cargar servicio', {
                    description: message,
                    id: 'error-fetch-service'
                })
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id])

    const handleNavigate = useCallback(() => {
        if (!isOnline) {
            showToast.warning('Sin conexión para navegar', {
                description: 'Los mapas requieren internet para cargar rutas.',
                icon: <WifiOff className="h-4 w-4" />,
                duration: 4000,
                id: 'offline-nav-warning'
            })
            return
        }

        if (!service?.dealership) return

        const { latitude, longitude, address } = service.dealership

        const triggerNavigation = (originLat?: number, originLng?: number) => {
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
                    logger.warn("High accuracy geolocation error", error)
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            triggerNavigation(pos.coords.latitude, pos.coords.longitude)
                        },
                        (err) => {
                            logger.warn("Low accuracy geolocation error", err)
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
    }, [isOnline, service])

    const handleUpdateStatus = useCallback(() => {
        navigate(`/messenger/servicio/${id}/actualizar`)
    }, [id, navigate])

    const formatDateTime = useCallback((dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }, [])

    const statusConfig = useMemo(() => {
        if (!service) return null;
        return getStatusIconConfig(service.currentStatus, colors);
    }, [service, colors]);

    if (loading) {
        return <ServiceDetailsSkeleton />
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
            <div className="">
                <div className="p-4 pb-2">
                    <Card className="p-5 bg-gradient-to-br from-card to-muted border-border/50">
                        <div className="flex flex-col items-center gap-3">
                            <PlacaBadge
                                plateNumber={service.plate.plateNumber}
                                plateType={service.plate.plateType}
                                size="xl"
                            />

                            {statusConfig && (
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: statusConfig.pillBackground }}
                                >
                                    <div className="w-3 h-3 rounded-full" style={statusConfig.dotStyle} />
                                    <span className="text-sm font-bold">
                                        {statusConfig.label}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 w-full mt-2">
                                <Button
                                    className="flex-1 h-11 gap-2 font-bold shadow-lg active:scale-[0.98]"
                                    onClick={handleNavigate}
                                >
                                    <Navigation className="h-4 w-4" strokeWidth={2.5} />
                                    Navegar
                                </Button>

                                {(service.currentStatus === 'ASSIGNED' || service.currentStatus === 'PENDING' || service.currentStatus === 'RETURNED') && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 gap-2 font-bold border-border/60 hover:bg-primary/5 active:scale-[0.98]"
                                        onClick={handleUpdateStatus}
                                    >
                                        <Edit className="h-4 w-4" strokeWidth={2.5} />
                                        Actualizar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Building2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-sm font-bold tracking-tight">Concesionario destino</h3>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="font-bold text-base tracking-tight">{service.dealership.name}</p>
                                <p className="text-sm text-muted-foreground font-medium">{service.dealership.zone}</p>
                            </div>

                            {service.dealership.address && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" strokeWidth={2.5} />
                                    <span className="font-medium">{service.dealership.address}</span>
                                </div>
                            )}

                            {service.dealership.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                                    <a
                                        href={`tel:${service.dealership.phone}`}
                                        className="text-primary font-bold underline underline-offset-4"
                                    >
                                        {service.dealership.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Clock className="h-4 w-4 text-primary" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-sm font-bold tracking-tight">Información del servicio</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Creado:</span>
                                <span>{formatDateTime(service.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Mensajero:</span>
                                <span className="font-medium">{service.messenger?.fullName ?? 'No asignado'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {service.observation && (
                    <div className="px-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <MessageSquareText className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm font-bold tracking-tight">Observaciones</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">{service.observation}</p>
                        </Card>
                    </div>
                )}

                {service.photos.find(p => p.photoType === 'PLATE_DETECTION') && (
                    <div className="px-4 pb-4">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <FileImage className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm font-bold tracking-tight">Evidencia visual</h3>
                            </div>
                            
                            <div className="relative w-full aspect-video rounded-xl border bg-muted/30 overflow-hidden group">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
                                        <div className="relative">
                                            <FileImage className="h-10 w-10 text-muted-foreground/20" strokeWidth={1.5} />
                                            <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-ping opacity-20" />
                                        </div>
                                        <div className="mt-3 space-y-2 flex flex-col items-center">
                                            <div className="h-2 w-20 bg-muted-foreground/10 rounded-full animate-pulse" />
                                            <div className="h-1.5 w-12 bg-muted-foreground/5 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                )}
                                <img
                                    src={getImageUrl(service.photos.find(p => p.photoType === 'PLATE_DETECTION')?.photoPath || '')}
                                    alt="Placa del vehículo"
                                    onLoad={() => setImageLoaded(true)}
                                    loading="lazy"
                                    decoding="async"
                                    className={`w-full h-full object-contain transition-all duration-700 ease-out ${
                                        imageLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
                                    }`}
                                />
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
