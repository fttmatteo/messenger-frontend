import { Button } from "@/shared/components/ui/button"
import { Edit, Trash2, UserPlus } from "lucide-react"
import { canUserEditService } from "@/shared/lib/status-utils"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"
import { useAuth } from "@/features/auth/context/AuthContext"

interface ServiceHeaderProps {
    service: ServiceDelivery
    onDelete?: () => void
    onUpdate?: () => void
    onEditRoute?: () => void
    onReassign?: () => void
    deleting?: boolean
}

/**
 * Cabecera detallada para la vista individual de un servicio.
 * Incluye migas de pan, indicador de estado prominente y acciones de gestión.
 */
export function ServiceHeader({ service, onDelete, onUpdate, onEditRoute, onReassign, deleting }: ServiceHeaderProps) {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'

    const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
    const canEdit = role ? canUserEditService(role) : false

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[58px] md:h-[58px] px-4 border-b gap-4 shrink-0 overflow-hidden">

            <div className="flex-1">
            </div>


            <div className="flex-1 flex flex-row items-center justify-center gap-3">
                <h1 className="text-lg md:text-2xl font-bold whitespace-nowrap">Detalles del servicio</h1>
            </div>


            <div className="flex-1 flex justify-end gap-3">
                {canEdit && onUpdate && (
                    <Button
                        variant="outline"
                        onClick={onUpdate}
                        size="sm"
                        className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border px-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors flex-1 md:flex-none font-medium text-xs m-0"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                )}

                {isAdmin && service.currentStatus === 'CANCELED' && onReassign && (
                    <Button
                        variant="outline"
                        onClick={onReassign}
                        size="sm"
                        className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border px-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors flex-1 md:flex-none font-medium text-xs m-0"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Reasignar
                    </Button>
                )}

                {isAdmin && service.currentStatus === 'CANCELED' && onEditRoute && (
                    <Button
                        variant="outline"
                        onClick={onEditRoute}
                        size="sm"
                        className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border px-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors flex-1 md:flex-none font-medium text-xs m-0"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar ruta
                    </Button>
                )}

                {isAdmin && onDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        disabled={deleting}
                        className="!h-[32px] !min-h-[32px] !max-h-[32px] !w-[32px] box-border p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-1 md:flex-none m-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
