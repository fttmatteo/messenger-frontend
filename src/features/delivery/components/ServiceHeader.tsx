import { AdminBreadcrumb } from "@/shared/components/ui/admin-breadcrumb"
import { Button } from "@/shared/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { getStatusIconConfig, canUserEditService } from "@/shared/lib/status-utils"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"
import { useAuth } from "@/features/auth/context/AuthContext"

interface ServiceHeaderProps {
    service: ServiceDelivery
    onDelete?: () => void
    onUpdate?: () => void
    deleting?: boolean
}

/**
 * Cabecera detallada para la vista individual de un servicio.
 * Incluye migas de pan, indicador de estado prominente y acciones de gestión.
 */
export function ServiceHeader({ service, onDelete, onUpdate, deleting }: ServiceHeaderProps) {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'

    const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
    const canEdit = role ? canUserEditService(role) : false

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">

            <div className="flex-1">
                <AdminBreadcrumb segments={[
                    { label: "Servicios", href: "/admin/servicios" },
                    { label: service.plate.plateNumber }
                ]} />
            </div>


            <div className="flex-1 flex flex-row items-center justify-center gap-3">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: getStatusIconConfig(service.currentStatus).pillBackground }}
                >
                    <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus).dotStyle} />
                    <span className="text-sm font-bold">
                        {getStatusIconConfig(service.currentStatus).label}
                    </span>
                </div>
            </div>


            <div className="flex-1 flex justify-end gap-3">
                {canEdit && onUpdate && (
                    <Button
                        variant="outline"
                        onClick={onUpdate}
                        size="sm"
                        className="h-9 px-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors flex-1 md:flex-none font-medium"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                )}

                {isAdmin && onDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        disabled={deleting}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-1 md:flex-none"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
