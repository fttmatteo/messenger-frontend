import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useAdminUI } from "@/context/AdminUIContext"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery } from "@/types/service.types"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PlacaBadge } from "@/components/PlacaBadge"
import { ViewServicioSkeleton } from "@/components/service/ViewServicioSkeleton"
import { ServiceTrackingMap } from "@/components/tracking/ServiceTrackingMap"
import { ImageViewer } from "@/components/ui/image-viewer"
import { ArrowLeft, Trash2, Loader2 } from "lucide-react"
import { getErrorMessage } from "@/lib/error-utils"
import { logger } from "@/utils/logger"

// Extracted components
import { ServiceHeader } from "@/components/service/ServiceHeader"
import { ServiceGeneralInfoCard } from "@/components/service/ServiceGeneralInfoCard"
import { ServiceHistoryTimeline } from "@/components/service/ServiceHistoryTimeline"
import { UpdateStatusModal } from "@/components/service/UpdateStatusModal"

export default function ViewServicio() {
    // Router & Auth
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { setSuccess, setError: setGlobalError } = useAdminUI()

    // Service Data State
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // UI State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Derived State
    const isAdmin = user?.role === 'ADMIN'

    const fetchService = useCallback(async () => {
        if (!id) {
            setError("ID de servicio no proporcionado")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await serviceDeliveryService.getById(Number(id))
            setService(data)
            setError(null)
        } catch (error) {
            logger.apiError("Error fetching service in ViewServicio", error)
            const message = getErrorMessage(error)
            setError(message)
            setGlobalError(message)
        } finally {
            setLoading(false)
        }
    }, [id, setGlobalError])

    useEffect(() => {
        fetchService()
    }, [fetchService])

    const handleDelete = async () => {
        if (!id) return

        try {
            setDeleting(true)
            await serviceDeliveryService.delete(Number(id))
            setSuccess("Servicio eliminado exitosamente")
            navigate("/admin/servicios")
        } catch (error) {
            setGlobalError(getErrorMessage(error))
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleUpdateSuccess = () => {
        fetchService() // Refresh service data after update
    }

    if (loading) {
        return <ViewServicioSkeleton />
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar servicio</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
                <Button onClick={() => navigate("/admin/servicios")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al listado
                </Button>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Servicio no encontrado</p>
                <Button onClick={() => navigate("/admin/servicios")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al listado
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <ServiceHeader
                service={service}
                onDelete={isAdmin ? () => setDeleteDialogOpen(true) : undefined}
                onUpdate={() => setUpdateDialogOpen(true)}
                deleting={deleting}
            />

            {/* 3-Column Layout: Info (25%), History (50%), Map (25%) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">
                <ServiceGeneralInfoCard service={service} />

                <ServiceHistoryTimeline
                    service={service}
                    onImageClick={setSelectedImage}
                    className="lg:col-span-2"
                />

                <ServiceTrackingMap
                    serviceId={service.idServiceDelivery}
                    dealershipLat={service.dealership.latitude}
                    dealershipLng={service.dealership.longitude}
                    dealershipName={service.dealership.name}
                    serviceStatus={service.currentStatus}
                />
            </div>

            {/* Update Status Modal */}
            <UpdateStatusModal
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
                service={service}
                onSuccess={handleUpdateSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El servicio de la placa <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" className="inline-flex align-middle mx-1" /> será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            {deleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Eliminar servicio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ImageViewer
                open={!!selectedImage}
                src={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div >
    )
}
