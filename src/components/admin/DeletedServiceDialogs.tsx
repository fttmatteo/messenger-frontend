import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

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
                        Esta acción archivará permanentemente <strong>{count} servicio(s)</strong> de la papelera. Los datos se preservarán en el archivo para consulta futura.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-500 text-white hover:bg-red-600"
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
    const isRestore = type === 'restore'

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isRestore ? '¿Restaurar servicio?' : '¿Archivar permanentemente?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isRestore ? (
                            <>El servicio con placa <strong>{plateNumber}</strong> será restaurado y volverá a aparecer en la lista de servicios.</>
                        ) : (
                            <>El servicio con placa <strong>{plateNumber}</strong> será archivado permanentemente. Los datos se preservarán para consulta futura.</>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={isRestore ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}
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
