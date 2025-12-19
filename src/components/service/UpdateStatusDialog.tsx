import { useState } from "react"
import { X, Check, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

// Components
import { SignaturePad } from "@/components/SignaturePad"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Services & Types
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"

// Available statuses for selection
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'FAILED', label: 'Fallido' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'OBSERVED', label: 'Observado' },
    { value: 'RESOLVED', label: 'Resuelto' },
]

interface UpdateStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceDelivery | null
    onSuccess: () => void
}

/**
 * Dialog component for updating service status.
 * Handles signature capture, photo uploads, and observations.
 */
export function UpdateStatusDialog({
    open,
    onOpenChange,
    service,
    onSuccess,
}: UpdateStatusDialogProps) {
    // Local state for form
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
    const [updating, setUpdating] = useState(false)

    // Reset form when dialog opens with new service
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && service) {
            setNewStatus(service.currentStatus)
            setObservation('')
            setSignatureFile(null)
            setPhotoFiles([])
            setPhotosPreviews([])
        }
        onOpenChange(isOpen)
    }

    // Handle photos change
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const validFiles = files.filter(f => f.type.startsWith('image/'))
            if (validFiles.length !== files.length) {
                toast.error("Algunos archivos no son imágenes", { id: "error-archivos-invalidos" })
            }
            setPhotoFiles(prev => [...prev, ...validFiles])

            validFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPhotosPreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
        }
    }

    // Remove photo from list
    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index))
        setPhotosPreviews(prev => prev.filter((_, i) => i !== index))
    }

    // Handle update status submission
    const handleUpdateStatus = async () => {
        if (!service) return

        if (newStatus === 'DELIVERED' && !signatureFile) {
            toast.error("Firma requerida", {
                description: "Para marcar como Entregado, debe incluir la firma.",
                id: "error-firma-requerida"
            })
            return
        }

        try {
            setUpdating(true)
            await serviceDeliveryService.updateStatus(service.idServiceDelivery, {
                status: newStatus,
                observation: observation || undefined,
                signature: signatureFile || undefined,
                photos: photoFiles.length > 0 ? photoFiles : undefined,
            })

            toast.success("Estado actualizado", {
                description: `Servicio ${service.plate.plateNumber} actualizado`
            })

            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast.error("Error al actualizar estado", {
                description: error.response?.data?.message || error.message,
                id: "error-actualizar-estado"
            })
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Actualizar estado del Servicio</DialogTitle>
                    <DialogDescription>
                        {service && (
                            <>
                                <PlacaBadge
                                    plateNumber={service.plate.plateNumber}
                                    plateType={service.plate.plateType}
                                    size="sm"
                                />
                                {" • "}
                                {service.dealership.name}
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Status Select */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Nuevo estado</Label>
                        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Observation */}
                    <div className="space-y-2">
                        <Label htmlFor="observation">Observaciones</Label>
                        <Textarea
                            id="observation"
                            placeholder="Agrega observaciones sobre el cambio de estado..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Signature Upload */}
                    <div className="space-y-2">
                        <Label>Firma digital</Label>
                        <SignaturePad onChange={setSignatureFile} />
                        {signatureFile && (
                            <p className="text-xs text-green-600 mt-1 flex items-center animate-in fade-in slide-in-from-top-1">
                                <Check className="w-3 h-3 mr-1" />
                                Firma capturada
                            </p>
                        )}
                    </div>

                    {/* Photos Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="photos">Evidencia fotografica</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="photos"
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                    <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold">Agregar foto</span>
                                    </p>
                                </div>
                                <input
                                    id="photos"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotosChange}
                                />
                            </label>
                        </div>

                        {photosPreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {photosPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-5 w-5"
                                            onClick={() => removePhoto(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={updating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpdateStatus}
                        disabled={updating}
                    >
                        {updating ? "Actualizando..." : "Actualizar Estado"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
