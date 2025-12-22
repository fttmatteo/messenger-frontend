import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/messenger/StatusBadge"
import {
    ArrowLeft,
    MapPin,
    Navigation,
    Phone,
    Clock,
    User,
    Building2,
    FileImage,
    Loader2,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"

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

    const handleBack = () => {
        navigate(-1)
    }

    const handleNavigate = () => {
        if (!service?.dealership) return

        const { latitude, longitude, address } = service.dealership

        if (latitude && longitude) {
            // Open Google Maps with coordinates
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
        } else if (address) {
            // Fallback to address search
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank')
        } else {
            toast.error('No hay ubicación disponible para este concesionario')
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
                    <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
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
                    <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">Detalle del Servicio</span>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground mb-4">{error || 'Servicio no encontrado'}</p>
                    <Button variant="outline" onClick={handleBack}>
                        Volver
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg truncate">{service.plate.plateNumber}</h1>
                    <p className="text-xs text-muted-foreground">Servicio #{service.idServiceDelivery}</p>
                </div>
                <StatusBadge status={service.currentStatus} />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Plate Image - from photos array */}
                {service.photos.find(p => p.photoType === 'PLATE_DETECTION') && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileImage className="h-4 w-4" />
                                Imagen de la Placa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={service.photos.find(p => p.photoType === 'PLATE_DETECTION')?.photoPath}
                                alt="Placa del vehículo"
                                className="w-full rounded-lg border object-contain max-h-48"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Dealership Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Concesionario Destino
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="font-semibold">{service.dealership.name}</p>
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
                            className="w-full h-12 text-base gap-2"
                            onClick={handleNavigate}
                        >
                            <Navigation className="h-5 w-5" />
                            Iniciar Navegación
                        </Button>
                    </CardContent>
                </Card>

                {/* Service Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Información del Servicio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Creado:</span>
                            <span>{formatDateTime(service.createdAt)}</span>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Mensajero:</span>
                            <span className="font-medium">{service.messenger.fullName}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Observation */}
                {service.observation && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Observaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{service.observation}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Bottom Actions */}\n            {service.currentStatus === 'ASSIGNED' && (
                <div className="p-4 border-t bg-background">
                    <Button
                        className="w-full h-12 text-base"
                        onClick={handleUpdateStatus}
                    >
                        Actualizar Estado
                    </Button>
                </div>
            )}
        </div>
    )
}
