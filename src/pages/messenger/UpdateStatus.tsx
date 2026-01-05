import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { serviceDeliveryService } from "@/services/service.service"
import { trackingService } from "@/services/tracking.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SignatureCanvas, type SignatureCanvasRef } from "@/components/messenger/SignatureCanvas"
import { EvidenceCapture } from "@/components/messenger/EvidenceCapture"
import { PlacaBadge } from "@/components/PlacaBadge"
import { getErrorMessage } from "@/lib/error-utils"
import { getStatusIconConfig } from "@/lib/status-utils"
import { Loader2, AlertCircle, CheckCircle, CornerDownLeft, Building2, Camera, PenLine, MessageSquare, Clock } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useStatusColors } from "@/hooks/use-status-colors"
import { useDeviceType } from "@/hooks/use-device-type"
import { cn } from "@/lib/utils"

type MessengerStatus = 'PENDING' | 'DELIVERED' | 'RETURNED'

interface StatusOption {
    value: MessengerStatus
    label: string
    description: string
    icon: React.ReactNode
    requiresSignature: boolean
    requiresPhotos: boolean
    requiresObservation: boolean
}

const statusOptionsBase: StatusOption[] = [
    {
        value: 'PENDING',
        label: 'Pendiente',
        description: 'La placa está pendiente de entrega',
        icon: <Clock className="h-7 w-7" />,
        requiresSignature: true,
        requiresPhotos: true,
        requiresObservation: true
    },
    {
        value: 'DELIVERED',
        label: 'Entregado',
        description: 'La placa fue entregada exitosamente',
        icon: <CheckCircle className="h-7 w-7" />,
        requiresSignature: true,
        requiresPhotos: false,
        requiresObservation: false
    },
    {
        value: 'RETURNED',
        label: 'Devuelto',
        description: 'La placa no pudo ser entregada',
        icon: <CornerDownLeft className="h-7 w-7" />,
        requiresSignature: false,
        requiresPhotos: true,
        requiresObservation: true
    }
]

// Helper to convert hex to rgba for backgrounds
function hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128, 128, 128, ${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function UpdateStatus() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { colors } = useStatusColors()
    const { isIOS } = useDeviceType()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<MessengerStatus | null>(null)
    const [observation, setObservation] = useState('')
    const [photos, setPhotos] = useState<File[]>([])
    const [hasSignature, setHasSignature] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const signatureRef = useRef<SignatureCanvasRef>(null)

    // Create status options with dynamic colors from admin settings
    const statusOptions = useMemo(() => {
        return statusOptionsBase
            .filter(option => !service || option.value !== service.currentStatus)
            .map(option => ({
                ...option,
                color: colors[option.value] || '#6b7280' // fallback gray
            }))
    }, [colors, service])

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

        if (option.requiresSignature && !hasSignature) {
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

            // Capture Location
            let latitude: number | undefined
            let longitude: number | undefined

            // OPTIMIZATION: Check last known location from tracking service first
            const lastKnown = trackingService.getLastKnownLocation()
            const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000) // 5 minutes validity

            if (isRecent && lastKnown) {
                console.log("Using cached location for status update")
                latitude = lastKnown.latitude
                longitude = lastKnown.longitude
            } else {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        if (!navigator.geolocation) {
                            reject(new Error("Geolocalización no soportada"))
                            return
                        }
                        const timeoutId = setTimeout(() => reject(new Error("Timeout")), 5000)
                        navigator.geolocation.getCurrentPosition(
                            (p) => { clearTimeout(timeoutId); resolve(p) },
                            (e) => { clearTimeout(timeoutId); reject(e) },
                            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                        )
                    })
                    latitude = pos.coords.latitude
                    longitude = pos.coords.longitude
                } catch (e) {
                    console.warn("Could not get location for status update", e)
                    toast.warning("No se pudo obtener la ubicación (GPS)", {
                        description: "El cambio se registrará sin geolocalización."
                    })
                }
            }

            await serviceDeliveryService.updateStatus(Number(id), {
                status: selectedStatus as ServiceStatus,
                observation: observation.trim() || undefined,
                signature: signatureFile,
                photos: photos.length > 0 ? photos : undefined,
                latitude,
                longitude
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
                <div className="flex-1 overflow-auto">
                    {/* Hero Card Skeleton */}
                    <div className="p-4 pb-2">
                        <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                            <div className="flex flex-col items-center gap-3">
                                <Skeleton className="h-12 w-32 rounded-md" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                        </Card>
                    </div>

                    {/* Status Selection Skeleton */}
                    <div className="px-4 py-3">
                        <Skeleton className="h-3 w-28 mb-3" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-border/40 bg-card"
                                >
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-3 w-44" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Action Skeleton */}
                <div className="p-4 border-t bg-background/95">
                    <Skeleton className="w-full h-12 rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                    <p className="font-medium text-lg mb-1">Error</p>
                    <p className="text-muted-foreground text-sm">{error || 'Servicio no encontrado'}</p>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
            </div>
        )
    }

    const selectedOption = getSelectedOption()

    return (
        <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto">
                {/* Hero Card - Plate & Dealership */}
                <div className="p-4 pb-2">
                    <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                        <div className="flex flex-col items-center gap-3">
                            <PlacaBadge
                                plateNumber={service.plate.plateNumber}
                                plateType={service.plate.plateType}
                                size="xl"
                            />
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span className="text-sm font-medium">{service.dealership.name}</span>
                            </div>
                            {/* Current Status Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                            >
                                <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                                <span className="text-sm font-semibold">
                                    {getStatusIconConfig(service.currentStatus, colors).label}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Status Selection */}
                <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Seleccionar estado
                    </p>
                    <div className="space-y-3">
                        {statusOptions.map((option) => {
                            const isSelected = selectedStatus === option.value
                            return (
                                <motion.button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedStatus(option.value)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left touch-manipulation ${!isSelected ? 'border-border/40 bg-card hover:bg-muted/30' : ''
                                        }`}
                                    style={isSelected ? {
                                        borderColor: option.color,
                                        backgroundColor: hexToRgba(option.color, 0.06)
                                    } : undefined}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div
                                        className={`p-2.5 rounded-xl ${!isSelected ? 'bg-muted' : ''}`}
                                        style={isSelected ? {
                                            backgroundColor: hexToRgba(option.color, 0.12)
                                        } : undefined}
                                    >
                                        <span
                                            className={!isSelected ? 'text-muted-foreground' : ''}
                                            style={isSelected ? { color: option.color } : undefined}
                                        >
                                            {option.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-base text-foreground">
                                            {option.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: option.color }}
                                        >
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </div>

                {/* Evidence Forms - Show based on selected status */}
                <AnimatePresence mode="wait">
                    {selectedOption && (
                        <motion.div
                            key={selectedOption.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-40 space-y-4"
                        >
                            {/* Signature Section */}
                            {selectedOption.requiresSignature && (
                                <Card className="p-4 border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-lg bg-primary/10">
                                            <PenLine className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-sm font-semibold">Firma del asesor</h3>
                                        <span className="text-xs text-red-500">*</span>
                                    </div>
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        width={280}
                                        height={140}
                                        onSignatureChange={setHasSignature}
                                    />
                                </Card>
                            )}

                            {/* Photos Section */}
                            {selectedOption.requiresPhotos && (
                                <Card className="p-4 border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-lg bg-primary/10">
                                            <Camera className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-sm font-semibold">Foto de evidencia</h3>
                                        <span className="text-xs text-red-500">*</span>
                                    </div>
                                    <EvidenceCapture
                                        maxPhotos={1}
                                        photos={photos}
                                        onPhotosChange={setPhotos}
                                    />
                                </Card>
                            )}

                            {/* Observation Section */}
                            <Card className="p-4 border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold">Observaciones</h3>
                                    {selectedOption.requiresObservation && (
                                        <span className="text-xs text-red-500">*</span>
                                    )}
                                    {!selectedOption.requiresObservation && (
                                        <span className="text-xs text-muted-foreground">(opcional)</span>
                                    )}
                                </div>
                                <Textarea
                                    placeholder={
                                        selectedOption.value === 'RETURNED'
                                            ? 'Explique el motivo de la devolución...'
                                            : selectedOption.value === 'PENDING'
                                                ? 'Explique por qué el servicio queda pendiente...'
                                                : 'Notas adicionales sobre la entrega...'
                                    }
                                    value={observation}
                                    onChange={(e) => {
                                        setObservation(e.target.value)
                                        e.target.style.height = 'auto'
                                        e.target.style.height = `${e.target.scrollHeight}px`
                                    }}
                                    rows={3}
                                    className="resize-none bg-muted/30 border-border/50 min-h-[80px] overflow-hidden"
                                />
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fixed Bottom Action */}
            <div className={cn("p-4 border-t bg-background/95 backdrop-blur-sm", isIOS ? "pb-8" : "pb-4")}>
                <Button
                    className="w-full h-12 text-base font-semibold rounded-xl transition-all"
                    style={{
                        backgroundColor: selectedOption?.color || 'hsl(var(--primary))',
                        color: 'white'
                    }}
                    disabled={!canSubmit() || submitting}
                    onClick={() => setShowConfirmDialog(true)}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            {selectedOption && (
                                <span className="mr-2">
                                    {selectedOption.icon}
                                </span>
                            )}
                            {selectedOption ? `Confirmar ${selectedOption.label}` : 'Selecciona un estado'}
                        </>
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
                            style={{
                                backgroundColor: selectedOption?.color || 'hsl(var(--primary))',
                                color: 'white'
                            }}
                        >
                            {submitting ? 'Enviando...' : 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
