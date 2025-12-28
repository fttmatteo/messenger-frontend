import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useAdminUI } from "@/context/AdminUIContext"
import { useStatusColors } from "@/hooks/useStatusColors"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PlacaBadge } from "@/components/PlacaBadge"
import { HistoryEntryCard } from "@/components/service/HistoryEntryCard"
import { ViewServicioSkeleton } from "@/components/service/ViewServicioSkeleton"
import { ServiceTrackingMap } from "@/components/tracking/ServiceTrackingMap"
import { Timeline, TimelineItem, TimelineHeader, TimelineContent } from "@/components/ui/timeline"
import { ImageViewer } from "@/components/ui/image-viewer"
import { ArrowLeft, Building2, User, Calendar, Trash2, PhoneCall, Edit, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusIconConfig, getPlateTypeIcon, canUserEditService } from "@/lib/status-utils"
import { getImageUrl } from "@/lib/image-utils"
import { getErrorMessage } from "@/lib/error-utils"

export default function ViewServicio() {
    // Router & Auth
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { setSuccess, setError: setGlobalError } = useAdminUI()
    const { colors } = useStatusColors()


    // Service Data State
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // UI State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Derived State
    const isAdmin = user?.role === 'ADMIN'

    useEffect(() => {
        const fetchService = async () => {
            if (!id) {
                setError("ID de servicio no proporcionado")
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                // Timeout failsafe
                const timeoutId = setTimeout(() => {
                    setLoading((current) => {
                        if (current) {
                            setError("Tiempo de espera agotado al cargar el servicio")
                            return false
                        }
                        return current
                    })
                }, 10000)

                const data = await serviceDeliveryService.getById(Number(id))
                clearTimeout(timeoutId)
                setService(data)
            } catch (error) {
                console.error("Error fetching service:", error)
                const message = getErrorMessage(error)
                setError(message)
                setGlobalError(message)
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id, navigate, setGlobalError])

    const handleDelete = async () => {
        if (!id) return

        try {
            setDeleting(true)
            await serviceDeliveryService.delete(Number(id))
            setSuccess("Servicio eliminado exitosamente")
            navigate("/admin/servicios")
        } catch (error) {
            setGlobalError(getErrorMessage(error))
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    if (loading) {
        return <ViewServicioSkeleton />
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar servicio</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
                <Button onClick={() => navigate("/admin/servicios")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al listado
                </Button>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Servicio no encontrado</p>
                <Button onClick={() => navigate("/admin/servicios")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al listado
                </Button>
            </div>
        )
    }

    const PlateIcon = getPlateTypeIcon(service.plate.plateType)

    return (
        <div className="flex flex-col h-full gap-1">
            {/* Header Layout: Navigation (Left) - Status (Center) - Actions (Right) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] mb-2 gap-4">
                {/* Left: Navigation */}
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Servicios", href: "/admin/servicios" },
                        { label: service.plate.plateNumber }
                    ]} />
                </div>

                {/* Center: Status */}
                <div className="flex-1 flex flex-row items-center justify-center gap-3">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                    >
                        <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                        <span className="text-lg font-bold">
                            {getStatusIconConfig(service.currentStatus, colors).label}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex justify-end gap-3">
                    {/* Update Status Button - uses role-based logic */}
                    {(() => {
                        const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
                        const canEdit = role ? canUserEditService(role) : false

                        if (canEdit) {
                            return (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/servicios/actualizar/${service.idServiceDelivery}`)}
                                    size="sm"
                                    className="h-9 px-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors flex-1 md:flex-none font-medium"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Actualizar
                                </Button>
                            )
                        }
                        return null
                    })()}
                    {/* Delete Button - Admin only */}
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={deleting}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-1 md:flex-none"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Split Layout: Info (Left), History (Right) & Map (Full Width) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* General Information - Vertical Layout */}
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-base text-foreground font-semibold">Información general</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <PlateIcon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Placa</p>
                                <div className="mt-1">
                                    <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="lg" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Concesionario</p>
                                <p className="text-sm text-muted-foreground">{service.dealership.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {service.dealership.address} • {service.dealership.zone}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${service.dealership.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                                <PhoneCall className="h-3 w-3" />
                                                {service.dealership.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Mensajero</p>
                                <p className="text-sm text-muted-foreground">{service.messenger.fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${service.messenger.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                                <PhoneCall className="h-3 w-3" />
                                                {service.messenger.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Fecha de creación</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(service.createdAt), "PPPp", { locale: es })}
                                </p>
                            </div>
                        </div>


                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-1">Observaciones</p>
                            <p className="text-sm text-muted-foreground">
                                {service.observation || "No hay observaciones"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* History Timeline - Vertical & Scrollable */}
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-base text-foreground font-semibold">Historial de estados</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        {service.history && service.history.length > 0 ? (
                            <div className="py-2 pl-2">
                                <Timeline className="w-full">
                                    {[...(service.history || [])].reverse().map((entry, index) => {
                                        const platePhotos = service.photos?.filter(p => p.photoType === 'PLATE_DETECTION') || []

                                        return (
                                            <TimelineItem
                                                key={entry.idStatusHistory}
                                                isLast={index === (service.history?.length || 0) - 1}
                                            >
                                                <TimelineHeader statusStyle={getStatusIconConfig(entry.newStatus, colors).dotStyle}>
                                                    <div
                                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full ml-1"
                                                        style={{ backgroundColor: getStatusIconConfig(entry.newStatus, colors).pillBackground }}
                                                    >
                                                        <span className="text-lg font-bold">
                                                            {getStatusIconConfig(entry.newStatus, colors).label}
                                                        </span>
                                                    </div>
                                                </TimelineHeader>
                                                <TimelineContent>
                                                    <HistoryEntryCard
                                                        entry={entry}
                                                        platePhotos={platePhotos}
                                                        signaturePath={service.signature?.signaturePath}
                                                        getImageUrl={getImageUrl}
                                                        onImageClick={setSelectedImage}
                                                    />
                                                </TimelineContent>
                                            </TimelineItem>
                                        )
                                    })}
                                </Timeline>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-muted-foreground text-center">
                                    Sin historial de cambios
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Service Tracking Map - Bottom Section spanning full width */}
                <ServiceTrackingMap
                    serviceId={service.idServiceDelivery}
                    dealershipLat={service.dealership.latitude}
                    dealershipLng={service.dealership.longitude}
                    dealershipName={service.dealership.name}
                    serviceStatus={service.currentStatus}
                    className="md:col-span-2"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El servicio de la placa <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" className="inline-flex align-middle mx-1" /> será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Eliminar servicio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ImageViewer
                open={!!selectedImage}
                src={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div >
    )
}
