import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Check, Image as ImageIcon, X, ArrowLeft, Home, Bike, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

// Components
import { SignaturePad } from "@/components/SignaturePad"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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

export default function UpdateServiceStatus() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)

                // Initialize form with current data
                setNewStatus(data.currentStatus)
                setObservation('')

            } catch (error: any) {
                toast.error("Error al cargar servicio", {
                    description: error.message
                })
                navigate("/admin/servicios")
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id, navigate])

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

            navigate("/admin/servicios")
        } catch (error: any) {
            toast.error("Error al actualizar estado", {
                description: error.response?.data?.message || error.message,
                id: "error-actualizar-estado"
            })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!service) return null

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/servicios">
                                Servicios
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={`/admin/servicios/${id}`}>
                                {service.plate.plateNumber}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Actualizar estado</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Actualizar estado</h1>
                <p className="text-muted-foreground mt-1">
                    Modificar estado del servicio para la placa {service.plate.plateNumber}
                </p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="md"
                        />
                        <span className="text-muted-foreground font-normal text-sm">
                            • {service.dealership.name}
                        </span>
                    </CardTitle>
                    <CardDescription>
                        Complete la información requerida para el cambio de estado
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Signature Upload */}
                        <div className="space-y-2">
                            <Label>Firma digital</Label>
                            <div className="border rounded-md p-1 bg-white">
                                <SignaturePad onChange={setSignatureFile} />
                            </div>
                            {signatureFile && (
                                <p className="text-sm text-green-600 mt-2 flex items-center animate-in fade-in slide-in-from-top-1 bg-green-50 p-2 rounded border border-green-100">
                                    <Check className="w-4 h-4 mr-1.5" />
                                    Firma capturada correctamente
                                </p>
                            )}
                            {newStatus === 'DELIVERED' && !signatureFile && (
                                <p className="text-xs text-amber-600 mt-1">
                                    * Requerida para estado Entregado
                                </p>
                            )}
                        </div>

                        {/* Photos Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="photos">Evidencia fotográfica</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    htmlFor="photos"
                                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Agregar foto
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

                                {photosPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square group">
                                        <img
                                            src={preview}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg border bg-background"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removePhoto(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t mt-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/servicios")}
                            disabled={updating}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                            className="flex-1 sm:flex-none"
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
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
