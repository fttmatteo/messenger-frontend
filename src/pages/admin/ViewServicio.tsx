import { useEffect, useState } from "react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { useParams, useNavigate, Link } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import { useAuth } from "@/context/AuthContext"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Home,
    ArrowLeft,
    Car,
    Building2,
    User,
    Calendar,
    FileSignature,
    Image as ImageIcon,
    Clock,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Status badge configuration
const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
        ASSIGNED: { label: 'Asignado', className: 'bg-blue-500' },
        PENDING: { label: "Pendiente", className: "bg-indigo-500" },
        DELIVERED: { label: 'Entregado', className: 'bg-green-500' },
        FAILED: { label: 'Fallido', className: 'bg-red-500' },
        RETURNED: { label: 'Devuelto', className: 'bg-orange-500' },
        CANCELED: { label: 'Cancelado', className: 'bg-gray-500' },
        OBSERVED: { label: 'Observado', className: 'bg-purple-500' },
        RESOLVED: { label: 'Resuelto', className: 'bg-emerald-500' },
    }
    return config[status] || { label: status, className: 'bg-gray-500' }
}

export default function ViewServicio() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isAdmin = user?.role === 'ADMIN'

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return

            try {
                setLoading(true)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)
            } catch (error: any) {
                toast.error("Error al cargar servicio", {
                    description: error.response?.data?.message || error.message
                })
                if (error.response?.status === 404 || error.response?.status === 403) {
                    navigate("/admin/servicios")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id, navigate])

    const handleDelete = async () => {
        if (!id) return

        try {
            setDeleting(true)
            await serviceDeliveryService.delete(Number(id))
            toast.success("Servicio eliminado", {
                description: "El servicio ha sido eliminado exitosamente"
            })
            navigate("/admin/servicios")
        } catch (error: any) {
            toast.error("Error al eliminar servicio", {
                description: error.response?.data?.message || error.message
            })
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-6 w-64" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-96" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                </div>
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

    const statusConfig = getStatusBadge(service.currentStatus)

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/servicios">
                                Servicios
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage><PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" className="align-middle" /></BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="lg" />

                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Servicio #{service.idServiceDelivery} • Creado el {format(new Date(service.createdAt), "PPP", { locale: es })}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={deleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate("/admin/servicios")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                        <CardDescription>Detalles del servicio de entrega</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Placa</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="md" />
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Concesionario</p>
                                <p className="text-sm text-muted-foreground">{service.dealership.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {service.dealership.address} • {service.dealership.zone}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Mensajero</p>
                                <p className="text-sm text-muted-foreground">{service.messenger.fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${service.messenger.phone}`} className="hover:underline hover:text-primary transition-colors">
                                                {service.messenger.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip> • @{service.messenger.userName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Fecha de Creación</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(service.createdAt), "PPPp", { locale: es })}
                                </p>
                            </div>
                        </div>

                        {service.observation && (
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-1">Observaciones</p>
                                <p className="text-sm text-muted-foreground">{service.observation}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evidence */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evidencias</CardTitle>
                        <CardDescription>Firma y fotografías del servicio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Signature */}
                        {service.signature ? (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">Firma Digital</p>
                                </div>
                                <img
                                    src={service.signature.signatureUrl}
                                    alt="Firma"
                                    className="w-full max-w-xs h-32 object-contain border rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileSignature className="h-4 w-4" />
                                <p className="text-sm">Sin firma registrada</p>
                            </div>
                        )}

                        {/* Photos */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm font-medium">Fotografías ({service.photos.length})</p>
                            </div>
                            {service.photos.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {service.photos.map((photo) => (
                                        <img
                                            key={photo.idPhoto}
                                            src={photo.photoUrl}
                                            alt="Evidencia"
                                            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => window.open(photo.photoUrl, '_blank')}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin fotografías registradas</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Estados</CardTitle>
                    <CardDescription>Trazabilidad completa de cambios de estado</CardDescription>
                </CardHeader>
                <CardContent>
                    {service.history.length > 0 ? (
                        <div className="relative space-y-4 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
                            {service.history.map((entry) => {
                                const newStatusConfig = getStatusBadge(entry.newStatus)
                                const prevStatusConfig = entry.previousStatus
                                    ? getStatusBadge(entry.previousStatus)
                                    : null

                                return (
                                    <div key={entry.idStatusHistory} className="relative flex gap-4 pl-8">
                                        <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-background bg-primary" />

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {prevStatusConfig && (
                                                    <>
                                                        <Badge variant="outline" className={prevStatusConfig.className}>
                                                            {prevStatusConfig.label}
                                                        </Badge>
                                                        <span className="text-muted-foreground">→</span>
                                                    </>
                                                )}
                                                <Badge className={newStatusConfig.className}>
                                                    {newStatusConfig.label}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{format(new Date(entry.changeDate), "PPp", { locale: es })}</span>
                                                <span>•</span>
                                                <User className="h-3.5 w-3.5" />
                                                <span>{entry.changedBy.fullName}</span>
                                            </div>

                                            {entry.photos && entry.photos.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {entry.photos.map((photo) => (
                                                        <img
                                                            key={photo.idPhoto}
                                                            src={photo.photoUrl}
                                                            alt="Evidencia"
                                                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => window.open(photo.photoUrl, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Sin historial de cambios
                        </p>
                    )}
                </CardContent>
            </Card>

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
                            {deleting ? "Eliminando..." : "Eliminar servicio"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
