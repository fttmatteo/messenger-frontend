import { CheckCircle, Clock, CornerDownLeft } from "lucide-react"
import type { ServiceStatus } from "@/features/delivery/types/service.types"

/**
 * Definición técnica de un estado dentro del flujo de trabajo de servicios.
 * Especifica las reglas de negocio, como la obligatoriedad de firmas o fotos
 * para realizar la transición a dicho estado.
 */
export interface StatusConfig {
    id: ServiceStatus
    label: string
    description: string
    icon: typeof Clock
    requiresSignature: boolean
    requiresPhotos: boolean
    requiresObservation: boolean
}

/**
 * Catálogo maestro de estados de servicio con su configuración lógica y visual.
 * Se utiliza para generar formularios dinámicos de actualización de estado.
 */
export const STATUS_OPTIONS: StatusConfig[] = [
    {
        id: "PENDING",
        label: "Pendiente",
        description: "El chasis está pendiente de entrega",
        icon: Clock,
        requiresSignature: false,
        requiresPhotos: false,
        requiresObservation: false
    },
    {
        id: "DELIVERED",
        label: "Entregado",
        description: "El chasis fue entregado exitosamente",
        icon: CheckCircle,
        requiresSignature: true,
        requiresPhotos: false,
        requiresObservation: false
    },
    {
        id: "RETURNED",
        label: "Devuelto",
        description: "El chasis no pudo ser entregado",
        icon: CornerDownLeft,
        requiresSignature: false,
        requiresPhotos: false,
        requiresObservation: false
    }
]
