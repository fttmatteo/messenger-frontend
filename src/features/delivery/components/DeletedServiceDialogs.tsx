import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useState } from "react"

interface EmptyTrashDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    count: number
}

/**
 * Diálogo de confirmación para vaciar la papelera de servicios.
 */
export function EmptyTrashDialog({ isOpen, onOpenChange, onConfirm, count }: EmptyTrashDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Vaciar papelera?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará permanentemente <strong>{count} servicio(s)</strong> de la papelera.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0 bg-red-500 text-white hover:bg-red-600"
                    >
                        Vaciar papelera
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface ConfirmTrashActionDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    plateNumber: string
    type: 'restore' | 'permanent-delete'
}

/**
 * Diálogo de confirmación para restaurar un servicio o eliminarlo de forma permanente.
 */
export function ConfirmTrashActionDialog({ isOpen, onOpenChange, onConfirm, plateNumber, type }: ConfirmTrashActionDialogProps) {
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    const [lastType, setLastType] = useState(type)
    const [lastPlateNumber, setLastPlateNumber] = useState(plateNumber)

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen)
        if (isOpen) {
            setLastType(type)
            setLastPlateNumber(plateNumber)
        }
    } else if (isOpen) {
        if (type !== lastType) setLastType(type)
        if (plateNumber !== lastPlateNumber) setLastPlateNumber(plateNumber)
    }

    const activeType = isOpen ? type : lastType
    const activePlateNumber = isOpen ? plateNumber : lastPlateNumber
    const isRestore = activeType === 'restore'

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isRestore ? '¿Restaurar servicio?' : '¿Eliminar permanentemente?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isRestore ? (
                            <>El servicio con chasis <strong>{activePlateNumber}</strong> será restaurado y volverá a aparecer en la lista de servicios.</>
                        ) : (
                            <>El servicio con chasis <strong>{activePlateNumber}</strong> será eliminado permanentemente.</>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0 ${isRestore ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                        {isRestore ? 'Restaurar' : (
                            <><Trash2 className="h-4 w-4 mr-2" /> Eliminar</>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
