import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RotateCcw, Trash2, Loader2, Calendar } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatDisplayName } from "@/lib/format-utils"
import { getDaysRemaining } from "@/lib/date-utils"
import type { ServiceDelivery } from "@/types/service.types"
import { useState } from "react"
import { ConfirmTrashActionDialog } from "./DeletedServiceDialogs"

interface DeletedServiceRowProps {
    service: ServiceDelivery
    isRestoring: boolean
    isDeleting: boolean
    onAction: (type: 'restore' | 'permanent-delete') => void
    itemVariants: Variants
}

/**
 * Fila individual para la tabla de servicios eliminados.
 * Maneja acciones de restauración y eliminación permanente.
 */
export function DeletedServiceRow({ service, isRestoring, isDeleting, onAction, itemVariants }: DeletedServiceRowProps) {
    const daysRemaining = getDaysRemaining(service.deletedAt ?? service.createdAt)
    const messengerName = formatDisplayName(service.messenger?.fullName ?? 'No asignado')

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
                <PlacaBadge plateNumber={service.plate.plateNumber}  size="sm" />
            </TableCell>
            <TableCell className="text-sm">{service.originDealership.name}</TableCell>
            <TableCell className="text-sm">{service.dealership.name}</TableCell>
            <TableCell className="text-sm">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-default">{messengerName}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{service.messenger?.fullName ?? 'No asignado'}</p>
                    </TooltipContent>
                </Tooltip>
            </TableCell>
            <TableCell className="text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(service.deletedAt ?? service.createdAt), "dd/MM/yyyy", { locale: es })}
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"}>
                    {daysRemaining} días
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                                disabled={isRestoring || isDeleting}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAction('restore')
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
                                    onAction('permanent-delete')
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
}

interface DeletedServiceTableProps {
    services: ServiceDelivery[]
    restoringId: string | null
    deletingId: string | null
    onRestore: (uuid: string) => void
    onDelete: (uuid: string) => void
    itemVariants: Variants
}

/**
 * Tabla de servicios eliminados para visualización en escritorio.
 * Incluye información detallada y acciones de gestión de papelera.
 */
export function DeletedServiceTable({ services, restoringId, deletingId, onRestore, onDelete, itemVariants }: DeletedServiceTableProps) {
    const [activeService, setActiveService] = useState<ServiceDelivery | null>(null)
    const [actionType, setActionType] = useState<'restore' | 'permanent-delete' | null>(null)

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Chasis</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Mensajero</TableHead>
                        <TableHead>Eliminado</TableHead>
                        <TableHead>Tiempo restante</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence mode="popLayout">
                        {services.map((service) => (
                            <DeletedServiceRow
                                key={service.idServiceDelivery}
                                service={service}
                                isRestoring={restoringId === service.uuid}
                                isDeleting={deletingId === service.uuid}
                                onAction={(type) => {
                                    setActiveService(service)
                                    setActionType(type)
                                }}
                                itemVariants={itemVariants}
                            />
                        ))}
                    </AnimatePresence>
                </TableBody>
            </Table>

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
                        if (actionType === 'restore') onRestore(activeService.uuid)
                        else if (actionType === 'permanent-delete') onDelete(activeService.uuid)
                    }
                    setActionType(null)
                    setActiveService(null)
                }}
            />
        </>
    )
}
