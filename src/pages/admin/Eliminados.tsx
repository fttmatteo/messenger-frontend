import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { PlacaBadge } from "@/components/PlacaBadge"
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyDescription,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    Trash2,
    RotateCcw,
    Loader2,
    Home,
    Bike,
    Calendar,
    User,
    Building2,
    Clock,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// Animation variants
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24,
        },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

/**
 * Formats a full name to show first name and initial of last name
 */
function formatDisplayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
}

export default function Eliminados() {
    const isMobile = useIsMobile()
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState<number | null>(null)

    const fetchDeletedServices = async () => {
        try {
            setLoading(true)
            const data = await serviceDeliveryService.getTrash()
            setServices(data)
        } catch (error: any) {
            toast.error("Error al cargar elementos eliminados", {
                description: error.message,
                id: "error-cargar-eliminados"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeletedServices()
    }, [])

    const handleRestore = async (id: number) => {
        try {
            setRestoring(id)
            await serviceDeliveryService.restore(id)
            toast.success("Servicio restaurado correctamente")
            fetchDeletedServices()
        } catch (error: any) {
            toast.error("Error al restaurar servicio", {
                description: error.message,
                id: "error-restaurar-servicio"
            })
        } finally {
            setRestoring(null)
        }
    }

    // Calculate days remaining until permanent deletion (60 days from deletion)
    const getDaysRemaining = (createdAt: string) => {
        const deletedDate = new Date(createdAt)
        const expirationDate = new Date(deletedDate)
        expirationDate.setDate(expirationDate.getDate() + 60)
        const daysLeft = differenceInDays(expirationDate, new Date())
        return Math.max(0, daysLeft)
    }

    // Empty state
    const EmptyState = () => (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Trash2 />
                </EmptyMedia>
                <EmptyTitle>Papelera vacía</EmptyTitle>
                <EmptyDescription>
                    No hay elementos eliminados. Los elementos eliminados aparecerán aquí y serán borrados permanentemente después de 60 días.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    return (
        <div className="space-y-4 md:space-y-6">
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
                        <BreadcrumbPage>Eliminados</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Trash2 className="h-7 w-7" />
                    Servicios eliminados
                </h1>
            </div>

            {/* Content */}
            {isMobile ? (
                // Mobile View
                <div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {services.length} elemento(s) en papelera
                    </p>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : services.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <motion.div>
                            <AnimatePresence mode="popLayout">
                                {services.map((service) => {
                                    const daysRemaining = getDaysRemaining(service.createdAt)
                                    return (
                                        <motion.div
                                            key={service.idServiceDelivery}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                        >
                                            <Card className="mb-3">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Bike className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium text-muted-foreground">Servicio</span>
                                                            </div>
                                                            <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} />
                                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="h-3.5 w-3.5" />
                                                                    <span className="truncate">{service.dealership.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-3.5 w-3.5" />
                                                                    <span>{formatDisplayName(service.messenger.fullName)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"} className="text-xs">
                                                                        {daysRemaining} días restantes
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="lg"
                                                                    disabled={restoring === service.idServiceDelivery}
                                                                >
                                                                    {restoring === service.idServiceDelivery ? (
                                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw className="h-5 w-5" />
                                                                    )}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Restaurar servicio?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        El servicio con placa <strong>{service.plate.plateNumber}</strong> será restaurado y volverá a aparecer en la lista de servicios.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleRestore(service.idServiceDelivery)}>
                                                                        Restaurar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            ) : (
                // Desktop View
                <Card>
                    <CardHeader>
                        <CardTitle>Elementos eliminados</CardTitle>
                        <CardDescription>
                            {services.length} elemento(s) en papelera. Los elementos se eliminarán permanentemente después de 60 días.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : services.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Placa</TableHead>
                                        <TableHead>Concesionario</TableHead>
                                        <TableHead>Mensajero</TableHead>
                                        <TableHead>Eliminado</TableHead>
                                        <TableHead>Tiempo restante</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {services.map((service) => {
                                            const daysRemaining = getDaysRemaining(service.createdAt)
                                            return (
                                                <motion.tr
                                                    key={service.idServiceDelivery}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <Badge variant="outline" className="gap-1">
                                                            <Bike className="h-3 w-3" />
                                                            Servicio
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" />
                                                    </TableCell>
                                                    <TableCell className="text-base">{service.dealership.name}</TableCell>
                                                    <TableCell className="text-base">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default">{formatDisplayName(service.messenger.fullName)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{service.messenger.fullName}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="text-base">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            {format(new Date(service.createdAt), "PPP", { locale: es })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"}>
                                                            {daysRemaining} días
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <AlertDialog>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={restoring === service.idServiceDelivery}
                                                                        >
                                                                            {restoring === service.idServiceDelivery ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                                            ) : (
                                                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                                            )}
                                                                            Restaurar
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Restaurar servicio</TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Restaurar servicio?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        El servicio con placa <strong>{service.plate.plateNumber}</strong> será restaurado y volverá a aparecer en la lista de servicios.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleRestore(service.idServiceDelivery)}>
                                                                        Restaurar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </motion.tr>
                                            )
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
