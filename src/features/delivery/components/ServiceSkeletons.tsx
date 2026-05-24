import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent } from "@/shared/components/ui/card"
import { TableRow, TableCell } from "@/shared/components/ui/table"

/**
 * Esqueleto de carga para una fila de la tabla de servicios.
 */
export function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Placa - w-[100px] -> min-w-[100px] */}
            <TableCell className="min-w-[100px] py-4">
                <Skeleton static className="h-7 w-[90px] rounded-md bg-muted/20" />
            </TableCell>
            {/* Origen - max-w-[200px] */}
            <TableCell className="max-w-[200px] py-4">
                <Skeleton static className="h-4 w-full max-w-[128px] rounded bg-muted/20" />
            </TableCell>
            {/* Destino - max-w-[200px] */}
            <TableCell className="max-w-[200px] py-4">
                <Skeleton static className="h-4 w-full max-w-[128px] rounded bg-muted/20" />
            </TableCell>
            {/* Mensajero - max-w-[200px] */}
            <TableCell className="max-w-[200px] py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-6 w-6 shrink-0 rounded-full bg-muted/20" />
                    <Skeleton static className="h-4 w-full max-w-[112px] rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Estado - w-[140px] */}
            <TableCell className="w-[140px] py-4">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/10 w-fit border border-border/40">
                    <Skeleton static className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                    <Skeleton static className="h-3.5 w-16 rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Creado - w-[120px] */}
            <TableCell className="w-[120px] py-4">
                <Skeleton static className="h-4 w-24 rounded bg-muted/20" />
            </TableCell>
            {/* Acción - w-[120px] */}
            <TableCell className="w-[120px] py-4 text-center">
                <div className="flex justify-center">
                    <Skeleton static className="h-8 w-8 rounded-lg bg-muted/20" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Esqueleto de carga para una tarjeta de servicio (vista móvil/lista).
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3 border-border/50 bg-background/40">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex flex-col items-center gap-2 w-fit">
                                <Skeleton static className="h-7 w-28 rounded-full bg-muted/20" />
                                <div className="flex flex-col items-center">
                                    <Skeleton static className="h-8 w-28 rounded bg-muted/20" />
                                    <Skeleton static className="h-3 w-16 mt-0.5 rounded bg-muted/10" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-48 rounded bg-muted/10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-40 rounded bg-muted/10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-44 rounded bg-muted/10" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <Skeleton static className="h-9 w-24 rounded-lg bg-muted/20" />
                        <Skeleton static className="h-9 w-24 rounded-lg bg-muted/20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Lista de esqueletos de carga para múltiples servicios.
 */
export function ServiceListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="relative flex flex-col bg-card/60 border border-border/40 rounded-xl overflow-hidden shadow-sm"
                >
                    {/* Banda lateral del estado */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted/20" />

                    <div className="flex flex-col p-3.5 pl-4.5 gap-2.5">
                        {/* Cabecera (Chasis + Estado) */}
                        <div className="flex items-center justify-between">
                            <Skeleton static className="h-7 w-28 rounded bg-muted/20" />
                            <Skeleton static className="h-6 w-24 rounded-full bg-muted/20" />
                        </div>

                        {/* Cuerpo de Detalles */}
                        <div className="space-y-3.5">
                            {/* Ruta de Concesionarios */}
                            <div className="flex flex-col pl-1">
                                {/* Origen Row */}
                                <div className="flex gap-3 items-stretch">
                                    <div className="flex flex-col items-center shrink-0 w-[18px] relative z-10">
                                        <Skeleton static className="h-[18px] w-[18px] rounded-full bg-muted/20 shrink-0 mt-0.5" />
                                        <div className="flex-1 w-0.5 border-l border-dashed border-muted-foreground/30 my-1" />
                                    </div>
                                    <div className="flex-1 min-w-0 pb-4">
                                        <Skeleton static className="h-3 w-12 rounded bg-muted/10 mb-1" />
                                        <div className="flex items-center gap-2 mt-1">
                                            <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                                            <Skeleton static className="h-6 w-6 rounded-full bg-muted/10 shrink-0" />
                                        </div>
                                    </div>
                                </div>

                                {/* Destino Row */}
                                <div className="flex gap-3 items-stretch">
                                    <div className="flex flex-col items-center shrink-0 w-[18px] z-10">
                                        <Skeleton static className="h-[18px] w-[18px] rounded-full bg-muted/20 shrink-0 mt-0.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Skeleton static className="h-3 w-12 rounded bg-muted/10 mb-1" />
                                        <div className="flex items-center gap-2 mt-1">
                                            <Skeleton static className="h-5 w-40 rounded bg-muted/20" />
                                            <Skeleton static className="h-6 w-6 rounded-full bg-muted/10 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fecha de Asignación */}
                            <div className="flex items-center gap-2.5 pl-1">
                                <Skeleton static className="h-[18px] w-[18px] rounded-full bg-muted/20 shrink-0" />
                                <Skeleton static className="h-4 w-32 rounded bg-muted/10" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Esqueleto detallado para la vista de información de un servicio.
 */
export function ServiceDetailsSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                {/* Hero Card Skeleton */}
                <div className="p-4 pb-2">
                    <Card className="p-5 bg-gradient-to-br from-card to-muted/20 border-border/50 rounded-2xl shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-1.5">
                                <Skeleton static className="h-14 w-full max-w-[144px] rounded-lg bg-muted/20" />
                                <Skeleton static className="h-3 w-full max-w-[80px] rounded bg-muted/10 mx-auto" />
                            </div>
                            <Skeleton static className="h-7 w-28 rounded-full bg-muted/20" />
                            <div className="flex items-center gap-3 w-full mt-2">
                                <Skeleton static className="flex-1 h-12 rounded-xl bg-muted/20" />
                                <Skeleton static className="flex-1 h-12 rounded-xl bg-muted/20" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Dealership Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Skeleton static className="h-8 w-8 shrink-0 rounded-xl bg-muted/20" />
                            <Skeleton static className="h-5 w-full max-w-[192px] rounded bg-muted/20" />
                        </div>
                        <div className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40">
                            <Skeleton static className="h-5 w-full max-w-[224px] rounded bg-muted/10" />
                            <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/10" />
                            <Skeleton static className="h-4 w-full rounded bg-muted/10" />
                        </div>
                    </Card>
                </div>

                {/* Service Info Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Skeleton static className="h-8 w-8 shrink-0 rounded-xl bg-muted/20" />
                            <Skeleton static className="h-5 w-full max-w-[224px] rounded bg-muted/20" />
                        </div>
                        <div className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40">
                            <Skeleton static className="h-4 w-full max-w-[256px] rounded bg-muted/10" />
                            <Skeleton static className="h-4 w-full max-w-[192px] rounded bg-muted/10" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

/**
 * Esqueleto de carga para el flujo de actualización de estado del servicio.
 */
export function UpdateServiceStatusSkeleton() {
    return (
        <div className="pb-24">
            {/* Hero Card Skeleton */}
            <div className="p-4 pb-2">
                <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-border/50 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1.5">
                            <Skeleton static className="h-14 w-full max-w-[144px] rounded-lg bg-muted/20" />
                            <Skeleton static className="h-3 w-full max-w-[80px] rounded bg-muted/10 text-center" />
                        </div>
                        <Skeleton static className="h-5 w-full max-w-[176px] rounded bg-muted/10 mx-auto" />
                        <Skeleton static className="h-8 w-full max-w-[112px] rounded-full bg-muted/20" />
                    </div>
                </Card>
            </div>

            {/* Status Selection Skeleton */}
            <div className="px-4 py-3">
                <Skeleton static className="h-4 w-32 mb-6 ml-1 rounded bg-muted/10" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border/40 bg-card/60"
                        >
                            <Skeleton static className="h-14 w-14 shrink-0 rounded-xl bg-muted/20" />
                            <div className="flex-1 space-y-2.5">
                                <Skeleton static className="h-5 w-full max-w-[112px] rounded bg-muted/20" />
                                <Skeleton static className="h-3.5 w-full max-w-[224px] rounded bg-muted/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+var(--safe-area-bottom))] border-t border-border/50 bg-background/95 backdrop-blur-md">
                <Skeleton static className="w-full h-14 rounded-2xl bg-muted/30" />
            </div>
        </div>
    )
}

/**
 * Esqueleto de carga para el flujo de creación de un nuevo servicio.
 */
export function CreateServiceSkeleton() {
    return (
        <div className="pb-24">
            {/* Photo Section Skeleton */}
            <div className="p-4 pb-2">
                <Card className="p-5 border-border/50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton static className="h-8 w-8 shrink-0 rounded-xl bg-muted/20" />
                        <Skeleton static className="h-5 w-full max-w-[128px] rounded bg-muted/20" />
                    </div>
                    <Skeleton static className="w-full aspect-[4/3] rounded-2xl bg-muted/10 border border-border/40 shadow-inner" />
                </Card>
            </div>

            {/* Dealership Card Skeleton */}
            <div className="px-4 pb-2">
                <Card className="p-5 border-border/50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton static className="h-8 w-8 shrink-0 rounded-xl bg-muted/20" />
                        <Skeleton static className="h-5 w-full max-w-[176px] rounded bg-muted/20" />
                    </div>
                    <Skeleton static className="h-12 w-full rounded-xl bg-muted/10 border border-border/40" />
                </Card>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/95 backdrop-blur-md" style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}>
                <div className="flex gap-4">
                    <Skeleton static className="h-12 w-28 rounded-2xl bg-muted/20" />
                    <Skeleton static className="flex-1 h-12 rounded-2xl bg-muted/30" />
                </div>
            </div>
        </div>
    )
}
