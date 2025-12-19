import { motion } from "framer-motion"
import {
    MapPin,
    MapPinned,
    PhoneCall,
    Copy,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react"

// Components
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Types
import type { Dealership } from "@/types/dealership.types"
import { toast } from "sonner"

interface DealershipCardProps {
    dealership: Dealership
    onEdit: (dealershipId: number) => void
    onDelete: (dealershipId: number) => void
    onGeocode: (dealershipId: number) => void
    deleting: number | null
    geocoding: number | null
}

/**
 * Mobile card component for displaying a dealership in list view.
 * Shows name, location status, address, zone, and phone with action buttons.
 */
export function DealershipCard({
    dealership,
    onEdit,
    onDelete,
    onGeocode,
    deleting,
    geocoding,
}: DealershipCardProps) {
    return (
        <motion.div exit="exit" layout>
            <Card className="mb-3 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col items-start gap-1">
                                <h3 className="font-semibold text-lg">{dealership.name}</h3>
                                {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="default"
                                                className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors w-fit"
                                                onClick={() => {
                                                    const coords = `${dealership.latitude}, ${dealership.longitude}`
                                                    navigator.clipboard.writeText(coords)
                                                    toast.success("Coordenadas copiadas", {
                                                        description: coords
                                                    })
                                                }}
                                            >
                                                <MapPin className="h-3 w-3 mr-1" />
                                                Ubicado
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="flex items-center gap-2">
                                            <Copy className="h-3 w-3" />
                                            {dealership.latitude}, {dealership.longitude}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : dealership.isGeolocated ? (
                                    <Badge variant="default" className="bg-green-500 w-fit">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Ubicado
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="w-fit">Sin ubicación</Badge>
                                )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPinned className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{dealership.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground/80">
                                        {dealership.zone}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={`tel:${dealership.phone}`}
                                                className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1"
                                            >
                                                <PhoneCall className="h-3.5 w-3.5" />
                                                {dealership.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {!dealership.isGeolocated && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onGeocode(dealership.idDealership)}
                                    disabled={geocoding === dealership.idDealership}
                                    aria-label="Ubicar concesionario"
                                >
                                    {geocoding === dealership.idDealership ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="icon"
                                onClick={() => onEdit(dealership.idDealership)}
                                className="bg-primary hover:bg-primary/90"
                                aria-label="Editar concesionario"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                        aria-label="Eliminar concesionario"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Eliminar concesionario?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
                                            <strong>{dealership.name}</strong> del sistema.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onDelete(dealership.idDealership)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            disabled={deleting === dealership.idDealership}
                                        >
                                            {deleting === dealership.idDealership ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
