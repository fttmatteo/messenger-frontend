import { useState, useEffect } from "react"
import { Loader2, Save, UserPlus } from "lucide-react"
import { VoiceInputButton } from "@/components/ui/voice-input-button"
import { useAdminUI } from "@/context/AdminUIContext"
import { useStatusColors } from "@/hooks/use-status-colors"
import { useAuth } from "@/context/AuthContext"
import { employeeService } from "@/services/employee.service"
import { serviceDeliveryService } from "@/services/service.service"
import type { Employee } from "@/types/employee.types"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { getAvailableStatusesForUser, getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlacaBadge } from "@/components/PlacaBadge"

interface UpdateStatusModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceDelivery
    onSuccess: () => void
}

/**
 * Modal que permite a los administradores y mensajeros actualizar el estado de un servicio.
 * Incluye lógica de reasignación para roles administrativos cuando un servicio es cancelado.
 */
export function UpdateStatusModal({ open, onOpenChange, service, onSuccess }: UpdateStatusModalProps) {
    const { user } = useAuth()
    const { setSuccess, setError } = useAdminUI()
    const { colors } = useStatusColors()
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
                        setMessengers(employees.filter(e => e.role === 'MESSENGER'))
                    })
                    .catch(() => { })
                    .finally(() => setLoadingMessengers(false))
            }
        }
    }, [open, service.currentStatus, showReassign])

    const handleUpdateStatus = async () => {
        try {
            setUpdating(true)
            await serviceDeliveryService.updateStatus(service.idServiceDelivery, {
                status: newStatus,
                observation: observation || undefined,
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
                service.idServiceDelivery,
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span>Actualizar estado</span>
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="sm"
                        />
                    </DialogTitle>
                    <DialogDescription>
                        Cambia el estado del servicio y agrega observaciones si es necesario
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">

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
                                style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                            >
                                <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                                <span className="font-medium text-sm">
                                    {getStatusIconConfig(service.currentStatus, colors).label}
                                </span>
                            </div>
                        ) : (
                            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un nuevo estado">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(newStatus, colors).dotStyle} />
                                            <span>{getStatusIconConfig(newStatus, colors).label}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">Selecciona un nuevo estado</SelectLabel>
                                        {availableStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(status.value, colors).dotStyle} />
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
                            <VoiceInputButton
                                onTranscript={(text) => {
                                    setObservation(prev => {
                                        const newValue = prev ? `${prev} ${text}` : text
                                        return newValue.trim()
                                    })
                                }}
                                disabled={updating}
                                size="icon-sm"
                            />
                        </div>
                        <div className="relative">
                            <Textarea
                                id="observation"
                                placeholder="Agrega observaciones sobre el cambio de estado... (o usa el micrófono)"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={3}
                                className="resize-none pr-10"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
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
                        disabled={updating || availableStatuses.length === 0}
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
            </DialogContent>
        </Dialog>
    )
}
