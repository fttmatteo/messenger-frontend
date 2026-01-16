import { CheckCircle, Clock, CornerDownLeft } from "lucide-react"
import type { ServiceStatus } from "@/types/service.types"

export interface StatusConfig {
    id: ServiceStatus
    label: string
    description: string
    icon: typeof Clock
    requiresSignature: boolean
    requiresPhotos: boolean
    requiresObservation: boolean
}

export const STATUS_OPTIONS: StatusConfig[] = [
    {
        id: "PENDING",
        label: "Pendiente",
        description: "La placa está pendiente de entrega",
        icon: Clock,
        requiresSignature: true,
        requiresPhotos: true,
        requiresObservation: true
    },
    {
        id: "DELIVERED",
        label: "Entregado",
        description: "La placa fue entregada exitosamente",
        icon: CheckCircle,
        requiresSignature: true,
        requiresPhotos: false,
        requiresObservation: false
    },
    {
        id: "RETURNED",
        label: "Devuelto",
        description: "La placa no pudo ser entregada",
        icon: CornerDownLeft,
        requiresSignature: false,
        requiresPhotos: true,
        requiresObservation: true
    }
]
