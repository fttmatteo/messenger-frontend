import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw, Loader2, Building2, User, Clock } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { formatDisplayName } from "@/lib/format-utils"
import { getDaysRemaining } from "@/lib/date-utils"
import type { ServiceDelivery } from "@/types/service.types"
import { ConfirmTrashActionDialog } from "./DeletedServiceDialogs"
import { useState } from "react"

interface DeletedServiceCardProps {
    service: ServiceDelivery
    isRestoring: boolean
    onRestore: (id: number) => void
    itemVariants: Variants
}

/**
 * Tarjeta individual para mostrar un servicio eliminado en la vista móvil.
 */
export function DeletedServiceCard({ service, isRestoring, onRestore, itemVariants }: DeletedServiceCardProps) {
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
    const daysRemaining = getDaysRemaining(service.deletedAt ?? service.createdAt)

    return (
        <motion.div
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
                                    <span>{formatDisplayName(service.messenger?.fullName ?? 'No asignado')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"} className="text-xs">
                                        {daysRemaining} días restantes
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            size="lg"
                            disabled={isRestoring}
                            onClick={() => setIsRestoreDialogOpen(true)}
                        >
                            {isRestoring ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <RotateCcw className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmTrashActionDialog
                isOpen={isRestoreDialogOpen}
                onOpenChange={setIsRestoreDialogOpen}
                onConfirm={() => {
                    onRestore(service.idServiceDelivery)
                    setIsRestoreDialogOpen(false)
                }}
                plateNumber={service.plate.plateNumber}
                type="restore"
            />
        </motion.div>
    )
}

interface DeletedServiceListProps {
    services: ServiceDelivery[]
    restoringId: number | null
    onRestore: (id: number) => void
    itemVariants: Variants
}

/**
 * Lista optimizada para móviles de servicios eliminados con soporte para animaciones.
 */
export function DeletedServiceList({ services, restoringId, onRestore, itemVariants }: DeletedServiceListProps) {
    return (
        <motion.div>
            <AnimatePresence mode="popLayout">
                {services.map((service) => (
                    <DeletedServiceCard
                        key={service.idServiceDelivery}
                        service={service}
                        isRestoring={restoringId === service.idServiceDelivery}
                        onRestore={onRestore}
                        itemVariants={itemVariants}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
