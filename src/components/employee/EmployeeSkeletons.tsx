import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Skeleton component for an employee table row.
 * Used in desktop view while loading.
 */
export function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Skeleton component for an employee card.
 * Used in mobile view while loading.
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
