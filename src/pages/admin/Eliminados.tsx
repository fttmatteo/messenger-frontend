import { useEffect, useState, useCallback } from "react"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { Trash2, Loader2 } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { getErrorMessage } from "@/lib/error-utils"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { DeletedServiceRowSkeleton } from "@/components/admin/DeletedServiceSkeletons"
import { EmptyTrashDialog, ConfirmTrashActionDialog } from "@/components/admin/DeletedServiceDialogs"
import { TablePagination } from "@/components/ui/table-pagination"
import { listItemVariants } from "@/lib/animation-variants"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Calendar } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatDisplayName } from "@/lib/format-utils"
import { getDaysRemaining } from "@/lib/date-utils"


/**
 * Página de administración de servicios eliminados (papelera).
 * Permite visualizar los servicios que están en estado de eliminación lógica,
 * restaurarlos a su estado original, eliminarlos permanentemente uno a uno
 * o vaciar la papelera por completo.
 */
export default function Eliminados() {
    const { setSuccess, setError } = useAdminUI()
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [restoring, setRestoring] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [emptying, setEmptying] = useState(false)
    const [isEmptyTrashDialogOpen, setIsEmptyTrashDialogOpen] = useState(false)
    const [activeService, setActiveService] = useState<ServiceDelivery | null>(null)
    const [actionType, setActionType] = useState<'restore' | 'permanent-delete' | null>(null)

    const fetchDeletedServices = useCallback(async () => {
        try {
            setLoading(true)
            const response = await serviceDeliveryService.getTrash({
                page: currentPage - 1,
                size: itemsPerPage
            })
            setServices(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, setError])

    useEffect(() => {
        fetchDeletedServices()
    }, [fetchDeletedServices])

    const handleRestore = async (uuid: string) => {
        try {
            setRestoring(uuid)
            await serviceDeliveryService.restore(uuid)
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

    const handlePermanentDelete = async (uuid: string) => {
        try {
            setDeleting(uuid)
            await serviceDeliveryService.permanentDelete(uuid)
            setSuccess("Servicio eliminado permanentemente")
            setServices(prev => prev.filter(s => s.uuid !== uuid))
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(null)
        }
    }

    return (
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
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

            <CardContent className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
                {loading ? (
                    <div className="flex-1 overflow-auto min-h-0 [scrollbar-gutter:stable]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Chasis</TableHead>
                                    <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Origen</TableHead>
                                    <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Destino</TableHead>
                                    <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Mensajero</TableHead>
                                    <TableHead className="w-[120px]">Eliminado</TableHead>
                                    <TableHead className="w-[140px]">Tiempo restante</TableHead>
                                    <TableHead className="w-[120px] text-center">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <DeletedServiceRowSkeleton key={i} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : services.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <ListEmptyState
                            isSearchResult={false}
                            emptyIcon={<Trash2 />}
                            emptyTitle="Papelera vacía"
                            emptyDescription="No hay elementos eliminados. Los elementos eliminados aparecerán aquí y serán archivados permanentemente después de 60 días."
                            className="py-0"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto min-h-0 [scrollbar-gutter:stable]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[140px]">Chasis</TableHead>
                                        <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Origen</TableHead>
                                        <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Destino</TableHead>
                                        <TableHead className="max-w-[150px] md:max-w-[200px] truncate">Mensajero</TableHead>
                                        <TableHead className="w-[120px]">Eliminado</TableHead>
                                        <TableHead className="w-[140px]">Tiempo restante</TableHead>
                                        <TableHead className="w-[120px] text-center">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {services.map((service, index) => {
                                            const daysRemaining = getDaysRemaining(service.deletedAt ?? service.createdAt)
                                            const messengerName = formatDisplayName(service.messenger?.fullName ?? 'No asignado')
                                            const isRestoring = restoring === service.uuid
                                            const isDeleting = deleting === service.uuid

                                            return (
                                                <motion.tr
                                                    key={service.idServiceDelivery}
                                                    variants={listItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <PlacaBadge plateNumber={service.plate.plateNumber} size="sm" />
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate text-sm" title={service.originDealership.name}>
                                                        {service.originDealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate text-sm" title={service.dealership.name}>
                                                        {service.dealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default truncate inline-block max-w-[100%] align-bottom">{messengerName}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{service.messenger?.fullName ?? 'No asignado'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="w-[120px] whitespace-nowrap text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            {format(new Date(service.deletedAt ?? service.createdAt), "dd/MM/yyyy", { locale: es })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="w-[140px]">
                                                        <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"}>
                                                            {daysRemaining} días
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="w-[120px] text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                                                                        disabled={isRestoring || isDeleting}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setActiveService(service)
                                                                            setActionType('restore')
                                                                        }}
                                                                    >
                                                                        {isRestoring ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <RotateCcw className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Restaurar servicio</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                                        disabled={isRestoring || isDeleting}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setActiveService(service)
                                                                            setActionType('permanent-delete')
                                                                        }}
                                                                    >
                                                                        {isDeleting ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Eliminar permanentemente</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            )
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalElements}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(items) => {
                                setItemsPerPage(items)
                                setCurrentPage(1)
                            }}
                        />
                    </>
                )}
            </CardContent>
        </Card>

            <EmptyTrashDialog
                isOpen={isEmptyTrashDialogOpen}
                onOpenChange={setIsEmptyTrashDialogOpen}
                onConfirm={handleEmptyTrash}
                count={services.length}
            />

            <ConfirmTrashActionDialog
                isOpen={actionType !== null && activeService !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActionType(null)
                        setActiveService(null)
                    }
                }}
                type={actionType || 'restore'}
                plateNumber={activeService?.plate.plateNumber || ''}
                onConfirm={() => {
                    if (activeService) {
                        if (actionType === 'restore') handleRestore(activeService.uuid)
                        else if (actionType === 'permanent-delete') handlePermanentDelete(activeService.uuid)
                    }
                    setActionType(null)
                    setActiveService(null)
                }}
            />
        </>
    )
}
