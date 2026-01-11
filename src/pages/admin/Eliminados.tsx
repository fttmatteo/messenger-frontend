import { useEffect, useState, useCallback } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { Trash2, Loader2 } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { getErrorMessage } from "@/lib/error-utils"
import { DeletedServiceList } from "@/components/admin/DeletedServiceList"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeletedServiceRowSkeleton, DeletedServiceCardSkeleton } from "@/components/admin/DeletedServiceSkeletons"
import { DeletedServiceTable } from "@/components/admin/DeletedServiceTable"
import { EmptyTrashDialog } from "@/components/admin/DeletedServiceDialogs"

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
    const [isEmptyTrashDialogOpen, setIsEmptyTrashDialogOpen] = useState(false)

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
            setIsEmptyTrashDialogOpen(false)
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

    // Empty state component
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
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Eliminados" }]} />
                </div>

                <h1 className="flex-1 text-center text-xl md:text-2xl font-bold whitespace-nowrap">Servicios eliminados</h1>

                <div className="flex-1 flex justify-end">
                    {services.length > 0 ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={emptying}
                            onClick={() => setIsEmptyTrashDialogOpen(true)}
                            className="h-8 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            {emptying ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Vaciar papelera
                        </Button>
                    ) : (
                        <div className="w-[140px]" />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex flex-col">
                {isMobile ? (
                    <div className="flex-1 overflow-y-auto pr-1">
                        <p className="text-sm text-muted-foreground mb-3">
                            {services.length} elemento(s) en papelera
                        </p>
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <DeletedServiceCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : services.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <DeletedServiceList
                                services={services}
                                restoringId={restoring}
                                onRestore={handleRestore}
                                itemVariants={itemVariants}
                            />
                        )}
                    </div>
                ) : (
                    <Card className="flex flex-col flex-1 h-full overflow-hidden !overflow-hidden">
                        <CardHeader className="p-2 pb-0">
                            <CardDescription>
                                {services.length} elemento(s) en papelera. Los elementos se archivarán permanentemente después de 60 días.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            {loading ? (
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
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <DeletedServiceRowSkeleton key={i} />
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : services.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <DeletedServiceTable
                                    services={services}
                                    restoringId={restoring}
                                    deletingId={deleting}
                                    onRestore={handleRestore}
                                    onDelete={handlePermanentDelete}
                                    itemVariants={itemVariants}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <EmptyTrashDialog
                isOpen={isEmptyTrashDialogOpen}
                onOpenChange={setIsEmptyTrashDialogOpen}
                onConfirm={handleEmptyTrash}
                count={services.length}
            />
        </div>
    )
}
