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
    onRestore: (id: number) => void
    onDelete: (id: number) => void
    itemVariants: Variants
}

export function DeletedServiceRow({ service, isRestoring, isDeleting, onRestore, onDelete, itemVariants }: DeletedServiceRowProps) {
    const [actionType, setActionType] = useState<'restore' | 'permanent-delete' | null>(null)
    const daysRemaining = getDaysRemaining(service.deletedAt ?? service.createdAt)
    const messengerName = formatDisplayName(service.messenger?.fullName ?? 'No asignado')

    return (
        <>
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
                                    onClick={() => setActionType('restore')}
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
                                    onClick={() => setActionType('permanent-delete')}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archivar permanentemente</TooltipContent>
                        </Tooltip>
                    </div>
                </TableCell>
            </motion.tr>

            <ConfirmTrashActionDialog
                isOpen={actionType !== null}
                onOpenChange={(open) => !open && setActionType(null)}
                type={actionType || 'restore'}
                plateNumber={service.plate.plateNumber}
                onConfirm={() => {
                    if (actionType === 'restore') onRestore(service.idServiceDelivery)
                    else if (actionType === 'permanent-delete') onDelete(service.idServiceDelivery)
                    setActionType(null)
                }}
            />
        </>
    )
}

interface DeletedServiceTableProps {
    services: ServiceDelivery[]
    restoringId: number | null
    deletingId: number | null
    onRestore: (id: number) => void
    onDelete: (id: number) => void
    itemVariants: Variants
}

export function DeletedServiceTable({ services, restoringId, deletingId, onRestore, onDelete, itemVariants }: DeletedServiceTableProps) {
    return (
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
                    {services.map((service) => (
                        <DeletedServiceRow
                            key={service.idServiceDelivery}
                            service={service}
                            isRestoring={restoringId === service.idServiceDelivery}
                            isDeleting={deletingId === service.idServiceDelivery}
                            onRestore={onRestore}
                            onDelete={onDelete}
                            itemVariants={itemVariants}
                        />
                    ))}
                </AnimatePresence>
            </TableBody>
        </Table>
    )
}
