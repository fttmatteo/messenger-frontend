import { useState, useEffect } from "react"
import { Loader2, Save, UserPlus } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { useAuth } from "@/features/auth/context/AuthContext"
import { employeeService } from "@/features/employee/services/employee.service"
import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import type { Employee } from "@/features/employee/types/employee.types"
import type { ServiceDelivery, ServiceStatus } from "@/features/delivery/types/service.types"
import { getAvailableStatusesForUser, getStatusIconConfig } from "@/shared/lib/status-utils"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { PlacaBadge } from "@/shared/components/ui/PlacaBadge"
import { useSmartLocation } from "@/features/tracking/hooks/use-smart-location"
import { createLogger } from "@/shared/utils/logger"

const logger = createLogger('UpdateStatusDialog')

interface UpdateStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceDelivery
    onSuccess: () => void
}

/**
 * Modal que permite a los administradores y mensajeros actualizar el estado de un servicio.
 * Incluye lógica de reasignación para roles administrativos cuando un servicio es cancelado.
 */
export function UpdateStatusDialog({ open, onOpenChange, service, onSuccess }: UpdateStatusDialogProps) {
    const { user } = useAuth()
    const { setSuccess, setError } = useAdminUI()
    const { getCurrentLocation } = useSmartLocation()
    const [newStatus, setNewStatus] = useState<ServiceStatus>(service.currentStatus)
    const [observation, setObservation] = useState('')
    const [updating, setUpdating] = useState(false)
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<string>('')
    const [reassigning, setReassigning] = useState(false)
    const [loadingMessengers, setLoadingMessengers] = useState(false)

    const showReassign = service.currentStatus === 'CANCELED' && user?.role === 'ADMIN'

    useEffect(() => {
        if (open) {
            setNewStatus(service.currentStatus)
            setObservation('')
            setSelectedMessenger('')

            if (showReassign) {
                setLoadingMessengers(true)
                employeeService.getAll()
                    .then(employees => {
                        setMessengers(employees)
                    })
                    .catch(() => { })
                    .finally(() => setLoadingMessengers(false))
            }
        }
    }, [open, service.currentStatus, showReassign])

    const handleUpdateStatus = async () => {
        try {
            setUpdating(true)
            
            let latitude: number | undefined
            let longitude: number | undefined

            if (user?.role === 'ADMIN') {
                try {
                    const loc = await getCurrentLocation()
                    latitude = loc.latitude
                    longitude = loc.longitude
                } catch (error) {
                    logger.warn("No se pudo obtener la ubicación del administrador para la actualización de estado", error)
                }
            }

            await serviceDeliveryService.updateStatus(service.uuid, {
                status: newStatus,
                observation: observation || undefined,
                latitude,
                longitude,
            })

            setSuccess(`Estado de servicio ${service.plate.plateNumber} actualizado`)
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setUpdating(false)
        }
    }

    const handleReassign = async () => {
        if (!selectedMessenger) return

        try {
            setReassigning(true)
            await serviceDeliveryService.reassign(
                service.uuid,
                Number(selectedMessenger)
            )

            setSuccess(`Servicio ${service.plate.plateNumber} reasignado al mensajero`)
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setReassigning(false)
        }
    }

    const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
    const availableStatuses = role ? getAvailableStatusesForUser(role) : []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-3">
                        <span>Actualizar estado</span>
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            
                            size="sm"
                        />
                    </DialogTitle>
                    <DialogDescription>
                        Cambia el estado del servicio y agrega observaciones si es necesario
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

                    {showReassign && messengers.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <UserPlus className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-red-900 dark:text-red-100">Servicio cancelado</p>
                                    <p className="text-xs text-red-800 dark:text-red-200 mt-0.5">
                                        Puedes reasignarlo a otro mensajero para reintentar la entrega.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Select value={selectedMessenger} onValueChange={setSelectedMessenger} disabled={loadingMessengers}>
                                    <SelectTrigger className="flex-1 bg-white dark:bg-gray-800">
                                        <SelectValue placeholder={loadingMessengers ? "Cargando..." : "Selecciona un mensajero"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel className="text-muted-foreground">Mensajeros disponibles</SelectLabel>
                                            {messengers.map((messenger) => (
                                                <SelectItem
                                                    key={messenger.idEmployee}
                                                    value={String(messenger.idEmployee)}
                                                >
                                                    {messenger.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleReassign}
                                    disabled={!selectedMessenger || reassigning}
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {reassigning ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Reasignando...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Reasignar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}


                    <div className="space-y-2">
                        <Label>Nuevo estado</Label>
                        {availableStatuses.length === 0 ? (
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: getStatusIconConfig(service.currentStatus).pillBackground }}
                            >
                                <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus).dotStyle} />
                                <span className="font-medium text-sm">
                                    {getStatusIconConfig(service.currentStatus).label}
                                </span>
                            </div>
                        ) : (
                            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un nuevo estado">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(newStatus).dotStyle} />
                                            <span>{getStatusIconConfig(newStatus).label}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">Selecciona un nuevo estado</SelectLabel>
                                        {availableStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(status.value).dotStyle} />
                                                    <span>{status.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    </div>


                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="observation">Observaciones</Label>
                        </div>
                        <div className="relative">
                            <Textarea
                                id="observation"
                                placeholder="Agrega observaciones sobre el cambio de estado..."
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={3}
                                className="resize-none pr-10"
                            />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 sm:justify-end bg-muted/5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={updating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleUpdateStatus}
                        disabled={updating || availableStatuses.length === 0 || (newStatus === service.currentStatus && !observation.trim())}
                    >
                        {updating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Actualizar estado
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
        </Dialog>
    )
}
