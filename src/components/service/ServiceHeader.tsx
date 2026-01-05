import { useNavigate } from "react-router-dom"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { getStatusIconConfig, canUserEditService } from "@/lib/status-utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import type { ServiceDelivery } from "@/types/service.types"
import { useAuth } from "@/context/AuthContext"

interface ServiceHeaderProps {
    service: ServiceDelivery
    onDelete?: () => void
    deleting?: boolean
}

export function ServiceHeader({ service, onDelete, deleting }: ServiceHeaderProps) {
    const navigate = useNavigate()
    const { colors } = useStatusColors()
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'

    const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
    const canEdit = role ? canUserEditService(role) : false

    const statusConfig = getStatusIconConfig(service.currentStatus, colors)

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] mb-2 gap-4">
            {/* Left: Navigation */}
            <div className="flex-1">
                <AdminBreadcrumb segments={[
                    { label: "Servicios", href: "/admin/servicios" },
                    { label: service.plate.plateNumber }
                ]} />
            </div>

            {/* Center: Status */}
            <div className="flex-1 flex flex-row items-center justify-center gap-3">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: statusConfig.pillBackground }}
                >
                    <div className="w-3 h-3 rounded-full" style={statusConfig.dotStyle} />
                    <span className="text-lg font-bold">
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end gap-3">
                {canEdit && (
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/servicios/actualizar/${service.idServiceDelivery}`)}
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
