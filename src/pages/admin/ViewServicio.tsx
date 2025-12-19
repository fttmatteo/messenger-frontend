import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
import { PlacaBadge } from "@/components/PlacaBadge"
import { HistoryEntryCard } from "@/components/service/HistoryEntryCard"
import { ViewServicioSkeleton } from "@/components/service/ViewServicioSkeleton"
import { Timeline, TimelineItem, TimelineHeader, TimelineContent } from "@/components/ui/timeline"
import {
    Home,
    ArrowLeft,
    Car,
    Building2,
    User,
    Calendar,
    Trash2,
    PhoneCall,
    ChevronUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusBadge, getPlateTypeLabel } from "@/lib/status-utils"
import { getImageUrl } from "@/lib/image-utils"

export default function ViewServicio() {
    // Router & Auth
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const isMobile = useIsMobile()

    // Service Data State
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // UI State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)

    // Derived State
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
                    description: error.response?.data?.message || error.message,
                    id: "error-cargar-servicio"
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
                description: error.response?.data?.message || error.message,
                id: "error-eliminar-servicio"
            })
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    // Scroll to top functionality for mobile
    useEffect(() => {
        if (!isMobile) return

        const handleScroll = () => {
            const scrolled = window.scrollY > 300
            setShowScrollTop(scrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isMobile])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading) {
        return <ViewServicioSkeleton />
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
                        <BreadcrumbPage>{service.plate.plateNumber}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div>
                    <div className="mb-4 flex flex-row items-center gap-4">
                        <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="lg" />
                        <Badge className={`${statusConfig.className} text-base px-4 py-1.5`}>{statusConfig.label}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Servicio #{service.idServiceDelivery} • Creado el {format(new Date(service.createdAt), "PPP", { locale: es })}
                    </p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    {isAdmin && service.currentStatus !== 'DELIVERED' && (
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={deleting}
                            className="flex-1 md:flex-none"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => navigate("/admin/servicios")}
                        className="flex-1 md:flex-none"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>
            </div>

            {/* General Information - Horizontal layout for desktop */}
            <Card>
                <CardHeader>
                    <CardTitle>Información general</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Desktop: Horizontal grid layout */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Placa</p>
                                <div className="mt-1 flex flex-col items-start w-fit">
                                    <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="md" />
                                    <span className="text-xs text-muted-foreground mt-1 uppercase font-semibold">
                                        {getPlateTypeLabel(service.plate.plateType)}
                                    </span>
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
                                <p className="text-sm text-muted-foreground">@ {service.messenger.userName}</p>
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
                                <p className="text-sm font-medium">Fecha de Creación</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(service.createdAt), "PPPp", { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Observations if present */}
                    {service.observation && (
                        <div className="hidden md:block pt-4 mt-4 border-t">
                            <p className="text-sm font-medium mb-1">Observaciones</p>
                            <p className="text-sm text-muted-foreground">{service.observation}</p>
                        </div>
                    )}

                    {/* Mobile: Vertical layout */}
                    <div className="md:hidden space-y-4">
                        <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Placa</p>
                                <div className="mt-1 flex flex-col items-center w-fit">
                                    <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="md" />
                                    <span className="text-xs text-muted-foreground mt-1 uppercase font-semibold">
                                        {getPlateTypeLabel(service.plate.plateType)}
                                    </span>
                                </div>
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
                            <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Mensajero</p>
                                <p className="text-sm text-muted-foreground">@ {service.messenger.userName}</p>
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
                    </div>
                </CardContent>
            </Card>

            {/* History Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de estados</CardTitle>
                </CardHeader>
                <CardContent>
                    {service.history.length > 0 ? (
                        <>
                            {/* Responsive Timeline */}
                            <div className="py-4 overflow-x-auto">
                                <Timeline
                                    layout={isMobile ? "vertical" : "horizontal"}
                                    centered={isMobile}
                                    className={isMobile ? "" : "min-w-max md:min-w-0"}
                                >
                                    {[...service.history].reverse().map((entry, index) => {
                                        const newStatusConfig = getStatusBadge(entry.newStatus)
                                        const platePhotos = service.photos?.filter(p => p.photoType === 'PLATE_DETECTION') || []

                                        return (
                                            <TimelineItem
                                                key={entry.idStatusHistory}
                                                isLast={index === service.history.length - 1}
                                                className={isMobile ? "" : "min-w-[280px]"}
                                            >
                                                <TimelineHeader>
                                                    <div className="h-10 flex items-center justify-center z-10 bg-card">
                                                        <Badge className={`${newStatusConfig.className} text-sm px-4 py-1.5 shadow-sm`}>
                                                            {newStatusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </TimelineHeader>
                                                <TimelineContent>
                                                    <HistoryEntryCard
                                                        entry={entry}
                                                        platePhotos={platePhotos}
                                                        signaturePath={service.signature?.signaturePath}
                                                        getImageUrl={getImageUrl}
                                                    />
                                                </TimelineContent>
                                            </TimelineItem>
                                        )
                                    })}
                                </Timeline>
                            </div>

                        </>
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
            {/* Scroll to top button (mobile only) */}
            <AnimatePresence>
                {isMobile && showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-20 right-4 z-50"
                    >
                        <Button
                            onClick={scrollToTop}
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-lg"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
