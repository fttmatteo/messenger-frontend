import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Skeleton component for a deleted service table row.
 * Matches the structure in DeletedServiceTable.tsx
 */
export function DeletedServiceRowSkeleton() {
    return (
        <TableRow>
            {/* Placa */}
            <TableCell>
                <Skeleton className="h-6 w-16 rounded-md" />
            </TableCell>
            {/* Concesionario */}
            <TableCell>
                <Skeleton className="h-4 w-32" />
            </TableCell>
            {/* Mensajero */}
            <TableCell>
                <Skeleton className="h-4 w-32" />
            </TableCell>
            {/* Eliminado (Date) */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </TableCell>
            {/* Tiempo restante (Badge) */}
            <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            {/* Acción (Buttons) */}
            <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Skeleton component for a deleted service card (mobile).
 * Matches the structure in DeletedServiceCard.tsx
 */
export function DeletedServiceCardSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Placa */}
                        <Skeleton className="h-6 w-16 rounded-md" />

                        <div className="space-y-1">
                            {/* Concesionario */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            {/* Mensajero */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            {/* Tiempo restante */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    </div>
                    {/* Restore Button */}
                    <Skeleton className="h-10 w-12 rounded-md" />
                </div>
            </CardContent>
        </Card>
    )
}
