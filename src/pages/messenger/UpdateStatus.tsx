import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { SignatureCanvas, type SignatureCanvasRef } from "@/components/messenger/SignatureCanvas"
import { EvidenceCapture } from "@/components/messenger/EvidenceCapture"
import { getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { Loader2, AlertCircle, CheckCircle, CornerDownLeft, Send } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type MessengerStatus = 'DELIVERED' | 'RETURNED'

interface StatusOption {
    value: MessengerStatus
    label: string
    icon: React.ReactNode
    requiresSignature: boolean
    requiresPhotos: boolean
    requiresObservation: boolean
}

const statusOptions: StatusOption[] = [
    {
        value: 'DELIVERED',
        label: 'Entregado',
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        requiresSignature: true,
        requiresPhotos: true,
        requiresObservation: false
    },
    {
        value: 'RETURNED',
        label: 'Devuelto',
        icon: <CornerDownLeft className="h-6 w-6 text-orange-500" />,
        requiresSignature: false,
        requiresPhotos: false,
        requiresObservation: true
    }
]

export default function UpdateStatus() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<MessengerStatus | null>(null)
    const [observation, setObservation] = useState('')
    const [photos, setPhotos] = useState<File[]>([])
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const signatureRef = useRef<SignatureCanvasRef>(null)

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return

            try {
                setLoading(true)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)
            } catch (error) {
                const message = getErrorMessage(error)
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id])

    const getSelectedOption = () => statusOptions.find(o => o.value === selectedStatus)

    const canSubmit = () => {
        const option = getSelectedOption()
        if (!option) return false

        if (option.requiresSignature && !signatureRef.current?.hasSignature()) {
            return false
        }

        if (option.requiresPhotos && photos.length === 0) {
            return false
        }

        if (option.requiresObservation && !observation.trim()) {
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!selectedStatus || !id) return

        const option = getSelectedOption()
        if (!option) return

        try {
            setSubmitting(true)

            // Get signature file if required
            let signatureFile: File | undefined
            if (option.requiresSignature && signatureRef.current) {
                const sig = await signatureRef.current.getSignature()
                if (sig) signatureFile = sig
            }

            await serviceDeliveryService.updateStatus(Number(id), {
                status: selectedStatus as ServiceStatus,
                observation: observation.trim() || undefined,
                signature: signatureFile,
                photos: photos.length > 0 ? photos : undefined
            })

            toast.success('Estado actualizado', {
                description: `Servicio marcado como ${option.label}`
            })

            navigate('/messenger')
        } catch (error) {
            toast.error('Error al actualizar', {
                description: getErrorMessage(error)
            })
        } finally {
            setSubmitting(false)
            setShowConfirmDialog(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex items-center gap-3 p-4 border-b">
                    <span className="font-semibold">Actualizar estado</span>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex items-center gap-3 p-4 border-b">
                    <span className="font-semibold">Actualizar estado</span>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground mb-4">{error || 'Servicio no encontrado'}</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
                </div>
            </div>
        )
    }

    const selectedOption = getSelectedOption()

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg">Actualizar estado</h1>
                    <p className="text-xs text-muted-foreground">
                        {service.plate.plateNumber} · {service.dealership.name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusIconConfig(service.currentStatus).dotColor}`} />
                    <span className={`text-sm font-medium ${getStatusIconConfig(service.currentStatus).textColor}`}>
                        {getStatusIconConfig(service.currentStatus).label}
                    </span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Status Selection */}
                <div>
                    <h3 className="text-sm font-semibold mb-3">Seleccionar nuevo estado</h3>
                    <div className="space-y-2">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelectedStatus(option.value)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left touch-manipulation ${selectedStatus === option.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-muted-foreground/30'
                                    }`}
                            >
                                {option.icon}
                                <div className="flex-1">
                                    <p className="font-medium">{option.label}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Evidence Forms - Show based on selected status */}
                {selectedOption && (
                    <>
                        {/* Signature */}
                        {selectedOption.requiresSignature && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Firma del asesor *</h3>
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        width={280}
                                        height={140}
                                    />
                                </div>
                            </>
                        )}

                        {/* Photos */}
                        {selectedOption.requiresPhotos && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Foto de evidencia *</h3>
                                    <EvidenceCapture
                                        maxPhotos={3}
                                        photos={photos}
                                        onPhotosChange={setPhotos}
                                    />
                                </div>
                            </>
                        )}

                        {/* Observation */}
                        <Separator className="my-6" />
                        <div>
                            <h3 className="text-sm font-semibold mb-3">
                                Observaciones {selectedOption.requiresObservation ? '*' : '(opcional)'}
                            </h3>
                            <Textarea
                                placeholder={
                                    selectedOption.value === 'RETURNED'
                                        ? 'Explique el motivo de la devolución...'
                                        : 'Notas adicionales sobre la entrega...'
                                }
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t bg-background">
                <Button
                    className="w-full h-12 text-base"
                    disabled={!canSubmit() || submitting}
                    onClick={() => setShowConfirmDialog(true)}
                >
                    {submitting ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                        <><Send className="h-5 w-5 mr-2" /> Confirmar {selectedOption?.label}</>
                    )}
                </Button>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="max-w-[90vw] rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar actualización?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vas a marcar este servicio como <strong>{selectedOption?.label}</strong>.
                            Esta acción no se puede deshacer fácilmente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={selectedOption?.value === 'DELIVERED' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {submitting ? 'Enviando...' : 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
