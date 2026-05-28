import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/AuthContext"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog"
import { PlacaBadge } from "@/shared/components/ui/PlacaBadge"
import { ViewServiceSkeleton } from "@/features/delivery/components/ViewServiceSkeleton"
import { ServiceTrackingMap } from "@/features/tracking/components/ServiceTrackingMap"
import { ImageViewer } from "@/shared/components/ui/image-viewer"
import { ArrowLeft, Trash2, Loader2 } from "lucide-react"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { logger } from "@/shared/utils/logger"

import { ServiceHeader } from "@/features/delivery/components/ServiceHeader"
import { ServiceGeneralInfoCard } from "@/features/delivery/components/ServiceGeneralInfoCard"
import { ServiceHistoryTimeline } from "@/features/delivery/components/ServiceHistoryTimeline"
import { UpdateStatusDialog } from "@/features/delivery/components/UpdateStatusDialog"

/**
 * Vista detallada de un servicio de entrega específico para administradores.
 * Muestra información general, historial de estados con evidencias fotográficas,
 * y un mapa de rastreo del servicio.
 * Permite actualizar el estado del servicio o eliminarlo (si es administrador).
 */
export default function ViewService() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { setSuccess, setError: setGlobalError } = useAdminUI()

    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

    const isAdmin = user?.role === 'ADMIN'

    const fetchService = useCallback(async () => {
        if (!id) {
            setError("ID de servicio no proporcionado")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await serviceDeliveryService.getById(id)
            setService(data)
            setError(null)
        } catch (error) {
            logger.apiError("Error al obtener el servicio en ViewService", error)
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
            await serviceDeliveryService.delete(id)
            setSuccess("Servicio eliminado exitosamente")
            navigate("/admin/servicios")
        } catch (error) {
            setGlobalError(getErrorMessage(error))
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    if (loading) {
        return <ViewServiceSkeleton />
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
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <ServiceHeader
                service={service}
                onDelete={isAdmin ? () => setDeleteDialogOpen(true) : undefined}
                onUpdate={() => setIsUpdateModalOpen(true)}
                deleting={deleting}
            />

            <CardContent className="flex-1 pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full overflow-y-auto lg:overflow-hidden pb-2">
                <ServiceGeneralInfoCard service={service} />

                <ServiceHistoryTimeline
                    service={service}
                    onImageClick={(urls, index) => {
                        setSelectedImages(urls)
                        setSelectedImageIndex(index)
                    }}
                />

                <ServiceTrackingMap
                    serviceId={service.uuid}
                    dealershipLat={service.dealership.latitude}
                    dealershipLng={service.dealership.longitude}
                    dealershipName={service.dealership.name}
                    originDealershipLat={service.originDealership.latitude}
                    originDealershipLng={service.originDealership.longitude}
                    originDealershipName={service.originDealership.name}
                    serviceStatus={service.currentStatus}
                />
                </div>
            </CardContent>
        </Card>

            <UpdateStatusDialog
                open={isUpdateModalOpen}
                onOpenChange={setIsUpdateModalOpen}
                service={service}
                onSuccess={fetchService}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El servicio de chasis <PlacaBadge plateNumber={service.plate.plateNumber}  size="sm" className="inline-flex align-middle mx-1" /> será eliminado permanentemente.
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
                open={selectedImages.length > 0}
                images={selectedImages}
                initialIndex={selectedImageIndex}
                onClose={() => setSelectedImages([])}
            />
        </>
    )
}
