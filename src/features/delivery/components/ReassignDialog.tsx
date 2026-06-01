import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { employeeService } from "@/features/employee/services/employee.service"
import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import type { Employee } from "@/features/employee/types/employee.types"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { PlacaBadge } from "@/shared/components/ui/PlacaBadge"

interface ReassignDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceDelivery
    onSuccess: () => void
}

export function ReassignDialog({ open, onOpenChange, service, onSuccess }: ReassignDialogProps) {
    const { setSuccess, setError } = useAdminUI()
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<string>('')
    const [reassigning, setReassigning] = useState(false)
    const [loadingMessengers, setLoadingMessengers] = useState(false)

    useEffect(() => {
        if (open) {
            setSelectedMessenger('')
            setLoadingMessengers(true)
            employeeService.getAll()
                .then(employees => {
                    setMessengers(employees)
                })
                .catch(() => { })
                .finally(() => setLoadingMessengers(false))
        }
    }, [open])

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-3">
                        <span>Reasignar servicio</span>
                        <PlacaBadge plateNumber={service.plate.plateNumber} size="sm" />
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un nuevo transportista para reintentar la entrega del servicio cancelado
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        <div className="flex flex-col space-y-0 gap-2">
                            <Label>Nuevo transportista</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Se cambiará el estado nuevamente a ASIGNADO
                            </p>
                            <Select value={selectedMessenger} onValueChange={setSelectedMessenger} disabled={loadingMessengers}>
                                <SelectTrigger className="w-full !h-[44px] !min-h-[44px] !max-h-[44px] box-border">
                                    <SelectValue placeholder={loadingMessengers ? "Cargando..." : "Selecciona un transportista"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">Transportistas disponibles</SelectLabel>
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
                        </div>
                    </div>

                    <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 sm:justify-end bg-muted/5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={reassigning}
                            className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleReassign}
                            disabled={!selectedMessenger || reassigning}
                            className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                        >
                            {reassigning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Reasignando...
                                </>
                            ) : (
                                <>
                                    Confirmar reasignación
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
