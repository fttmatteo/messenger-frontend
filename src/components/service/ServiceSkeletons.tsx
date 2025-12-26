import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Skeleton component for a service table row.
 * Matches the actual table structure in Servicios.tsx
 */
export function TableRowSkeleton() {
    return (
        <TableRow>
            {/* Placa - w-[100px] */}
            <TableCell className="w-[100px]">
                <Skeleton className="h-7 w-[90px] rounded-md" />
            </TableCell>
            {/* Concesionario - max-w-[200px] */}
            <TableCell className="max-w-[200px]">
                <Skeleton className="h-4 w-32" />
            </TableCell>
            {/* Mensajero - max-w-[200px] */}
            <TableCell className="max-w-[200px]">
                <Skeleton className="h-4 w-28" />
            </TableCell>
            {/* Estado - w-[140px] */}
            <TableCell className="w-[140px]">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </TableCell>
            {/* Creado - w-[120px] */}
            <TableCell className="w-[120px]">
                <Skeleton className="h-4 w-24" />
            </TableCell>
            {/* Acción - w-[120px] */}
            <TableCell className="w-[120px] text-center">
                <div className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Skeleton component for a service card.
 * Used in mobile view while loading.
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex flex-col items-center gap-2 w-fit">
                                <Skeleton className="h-7 w-28 rounded-full" />
                                <div className="flex flex-col items-center">
                                    <Skeleton className="h-8 w-28 rounded" />
                                    <Skeleton className="h-3 w-16 mt-0.5" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <Skeleton className="h-8 w-24 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
