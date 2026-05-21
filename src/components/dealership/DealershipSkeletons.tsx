import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Esqueleto de carga para una fila de la tabla de concesionarios.
 */
export function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Nombre */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
            </TableCell>
            {/* Dirección - truncated */}
            <TableCell className="max-w-xs py-4">
                <Skeleton static className="h-4 w-full max-w-[224px] rounded bg-muted/10" />
            </TableCell>
            {/* Teléfono */}
            <TableCell className="py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-4 w-4 shrink-0 rounded-full bg-muted/20" />
                    <Skeleton static className="h-4 w-full max-w-[112px] rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Zona - badge */}
            <TableCell className="py-4">
                <Skeleton static className="h-6 w-full max-w-[80px] rounded-full bg-muted/20" />
            </TableCell>
            {/* Ubicación - badge */}
            <TableCell className="py-4">
                <Skeleton static className="h-6 w-full max-w-[112px] rounded-full bg-muted/20" />
            </TableCell>
        </TableRow>
    )
}

/**
 * Esqueleto de carga para una tarjeta de concesionario (vista móvil).
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3 border-border/50 bg-background/40">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-col items-start gap-1.5">
                            <Skeleton static className="h-5 w-56 rounded bg-muted/20" />
                            <Skeleton static className="h-5 w-28 rounded-full bg-muted/10" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10 mt-0.5" />
                                <Skeleton static className="h-4 w-full max-w-xs rounded bg-muted/10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-40 rounded bg-muted/20" />
                            </div>
                        </div>
                    </div>
                    {/* Action buttons placeholder */}
                    <div className="flex flex-col gap-2">
                        <Skeleton static className="h-9 w-9 rounded-lg bg-muted/20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Esqueleto de carga para el formulario de creación/edición de concesionarios.
 */
export function DealershipFormSkeleton() {
    return (
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <Skeleton static className="h-4 w-48 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton static className="h-6 w-48 rounded-md bg-muted/20" />
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <CardContent className="flex-1 pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
                <div className="h-full grid gap-2 lg:grid-cols-3 overflow-y-auto pb-2">
                    {/* Main Form Information Card */}
                    <Card className="lg:col-span-2 flex flex-col gap-1 py-1 min-h-0">
                        <CardHeader className="p-2 pb-0">
                            <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="h-full flex flex-col">
                                <div className="flex-1 grid gap-6 md:grid-cols-2 content-start">
                                    {/* Name Field */}
                                    <div className="space-y-2.5">
                                        <Skeleton static className="h-4 w-40 rounded bg-muted/10" />
                                        <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2.5">
                                        <Skeleton static className="h-4 w-28 rounded bg-muted/10" />
                                        <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                                    </div>

                                    {/* Address Field - Spans 2 cols */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Skeleton static className="h-4 w-32 rounded bg-muted/10" />
                                        <Skeleton static className="h-20 w-full rounded-md bg-muted/20" />
                                    </div>

                                    {/* Zone Field */}
                                    <div className="space-y-2.5">
                                        <Skeleton static className="h-4 w-20 rounded bg-muted/10" />
                                        <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                                    </div>
                                </div>

                                {/* Buttons Footer */}
                                <div className="flex flex-wrap gap-4 pt-6 mt-auto border-t border-border/50">
                                    <Skeleton static className="h-9 w-24 rounded-md bg-muted/20" />
                                    <Skeleton static className="h-9 w-36 rounded-md bg-muted/20" />
                                    <Skeleton static className="h-9 w-24 rounded-md bg-muted/20 ml-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location/Map Card Skeleton */}
                    <Card className="flex flex-col gap-1 py-1">
                        <CardHeader className="p-2 pb-0">
                            <Skeleton static className="h-5 w-32 rounded bg-muted/20" />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-3">
                            <Skeleton static className="flex-1 min-h-[200px] w-full rounded-xl bg-muted/10 border border-border/40" />
                            <Skeleton static className="h-6 w-32 rounded-full bg-muted/20" />
                            <Skeleton static className="h-9 w-full rounded-md bg-muted/20" />
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}
