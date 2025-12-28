import { useEffect, useState, useCallback } from "react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { Trash2, RotateCcw, Loader2, Calendar, User, Building2, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDisplayName } from "@/lib/format-utils"
import { useAdminUI } from "@/context/AdminUIContext"
import { getErrorMessage } from "@/lib/error-utils"

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

export default function Eliminados() {
    const isMobile = useIsMobile()
    const { setSuccess, setError } = useAdminUI()
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState<number | null>(null)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [emptying, setEmptying] = useState(false)

    const fetchDeletedServices = useCallback(async () => {
        try {
            setLoading(true)
            const data = await serviceDeliveryService.getTrash()
            setServices(data)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [setError])

    useEffect(() => {
        fetchDeletedServices()
    }, [fetchDeletedServices])

    const handleRestore = async (id: number) => {
        try {
            setRestoring(id)
            await serviceDeliveryService.restore(id)
            setSuccess("Servicio restaurado correctamente")
            fetchDeletedServices()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setRestoring(null)
        }
    }

    const handleEmptyTrash = async () => {
        try {
            setEmptying(true)
            const result = await serviceDeliveryService.emptyTrash()
            setSuccess(`Papelera vaciada: ${result.deletedCount} servicio(s) eliminado(s)`)
            setServices([])
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setEmptying(false)
        }
    }

    const handlePermanentDelete = async (id: number) => {
        try {
            setDeleting(id)
            await serviceDeliveryService.permanentDelete(id)
            setSuccess("Servicio eliminado permanentemente")
            setServices(prev => prev.filter(s => s.idServiceDelivery !== id))
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(null)
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
                    No hay elementos eliminados. Los elementos eliminados aparecerán aquí y serán archivados permanentemente después de 60 días.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    return (
        <div className="flex flex-col h-full gap-1">
            {/* Header: Breadcrumb left, Title center, Button right */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Eliminados" }]} />
                </div>

                <h1 className="flex-1 text-center text-xl md:text-2xl font-bold whitespace-nowrap">Servicios eliminados</h1>

                <div className="flex-1 flex justify-end">
                    {services.length > 0 ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={emptying}
                                    className="h-8 text-xs"
                                >
                                    {emptying ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Vaciar papelera
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Vaciar papelera?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción archivará permanentemente <strong>{services.length} servicio(s)</strong> de la papelera. Los datos se preservarán en el archivo para consulta futura.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleEmptyTrash}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Vaciar papelera
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <div className="w-[140px]" />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex flex-col">
                {isMobile ? (
                    // Mobile View
                    <div className="flex-1 overflow-y-auto pr-1">
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
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                    <Card className="flex flex-col flex-1 h-full overflow-hidden">
                        <CardHeader className="p-2 pb-0">
                            <CardDescription>
                                {services.length} elemento(s) en papelera. Los elementos se archivarán permanentemente después de 60 días.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
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

                                            <TableHead>Placa</TableHead>
                                            <TableHead>Concesionario</TableHead>
                                            <TableHead>Mensajero</TableHead>
                                            <TableHead>Eliminado</TableHead>
                                            <TableHead>Tiempo restante</TableHead>
                                            <TableHead className="text-center">Acción</TableHead>
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
                                                            <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" />
                                                        </TableCell>
                                                        <TableCell className="text-sm">{service.dealership.name}</TableCell>
                                                        <TableCell className="text-sm">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="cursor-default">{formatDisplayName(service.messenger.fullName)}</span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{service.messenger.fullName}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                {format(new Date(service.createdAt), "dd/MM/yyyy", { locale: es })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"}>
                                                                {daysRemaining} días
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                {/* Restore button */}
                                                                <AlertDialog>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                                    size="sm"
                                                                                    disabled={restoring === service.idServiceDelivery || deleting === service.idServiceDelivery}
                                                                                >
                                                                                    {restoring === service.idServiceDelivery ? (
                                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                                    ) : (
                                                                                        <RotateCcw className="h-4 w-4" />
                                                                                    )}
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
                                                                {/* Delete permanently button */}
                                                                <AlertDialog>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    disabled={restoring === service.idServiceDelivery || deleting === service.idServiceDelivery}
                                                                                >
                                                                                    {deleting === service.idServiceDelivery ? (
                                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                                    ) : (
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    )}
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Archivar permanentemente</TooltipContent>
                                                                    </Tooltip>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>¿Archivar permanentemente?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                El servicio con placa <strong>{service.plate.plateNumber}</strong> será archivado permanentemente. Los datos se preservarán para consulta futura.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handlePermanentDelete(service.idServiceDelivery)}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Eliminar
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
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
        </div>
    )
}
