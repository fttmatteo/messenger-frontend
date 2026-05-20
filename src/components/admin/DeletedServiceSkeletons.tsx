import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Componente que muestra un esqueleto de carga para una fila de la tabla de servicios eliminados.
 * Proporciona feedback visual mientras se obtienen los datos.
 */
export function DeletedServiceRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Chasis */}
            <TableCell className="py-4">
                <Skeleton static className="h-7 w-20 rounded-md bg-muted/20" />
            </TableCell>
            {/* Origen */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
            </TableCell>
            {/* Destino */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
            </TableCell>
            {/* Mensajero */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[144px] rounded bg-muted/10" />
            </TableCell>
            {/* Eliminado (Date) */}
            <TableCell className="py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-4 w-4 shrink-0 rounded-full bg-muted/10" />
                    <Skeleton static className="h-4 w-full max-w-[112px] rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Tiempo restante (Badge) */}
            <TableCell className="py-4">
                <div className="px-2 py-1 rounded-full bg-muted/10 border border-border/40 w-fit">
                    <Skeleton static className="h-3.5 w-16 rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Acción (Buttons) */}
            <TableCell className="text-right py-4">
                <div className="flex gap-2 justify-end">
                    <Skeleton static className="h-7 w-7 rounded-md bg-muted/20" />
                    <Skeleton static className="h-7 w-7 rounded-md bg-muted/20" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Componente que muestra un esqueleto de carga para una tarjeta de servicio eliminado (vista móvil).
 */
export function DeletedServiceCardSkeleton() {
    return (
        <Card className="mb-3 border-border/50 bg-background/40">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Chasis */}
                        <Skeleton static className="h-7 w-20 rounded-md bg-muted/20" />

                        <div className="space-y-2">
                            {/* Concesionario */}
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-40 rounded bg-muted/10" />
                            </div>
                            {/* Mensajero */}
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-36 rounded bg-muted/10" />
                            </div>
                            {/* Tiempo restante */}
                            <div className="flex items-center gap-2 pt-1">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <div className="px-2 py-0.5 rounded-full bg-muted/10 border border-border/40">
                                    <Skeleton static className="h-3.5 w-24 rounded bg-muted/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Restore Button */}
                    <Skeleton static className="h-10 w-12 rounded-lg bg-muted/20" />
                </div>
            </CardContent>
        </Card>
    )
}
