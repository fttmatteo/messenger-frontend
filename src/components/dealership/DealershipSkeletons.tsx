import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Skeleton component for a dealership table row.
 * Used in desktop view while loading.
 */
export function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        </TableRow>
    )
}

/**
 * Skeleton component for a dealership card.
 * Used in mobile view while loading.
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col items-start gap-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-start gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full mt-0.5" />
                                <Skeleton className="h-4 w-full max-w-xs" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    {/* Action buttons placeholder */}
                    <div className="flex flex-col gap-2 opacity-50">
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Skeleton for Dealership Form (Create/Edit)
 */
export function DealershipFormSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-64" />
            </div>

            <div className="flex-1 grid gap-4 lg:grid-cols-3">
                {/* Main Form Information Card */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardContent className="pt-6 flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1 grid gap-4 md:grid-cols-2 content-start">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                {/* Address Field - Spans 2 cols */}
                                <div className="space-y-2 md:col-span-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-20 w-full" />
                                </div>

                                {/* Zone Field */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Buttons Footer */}
                            <div className="flex flex-wrap gap-3 pt-6 mt-auto border-t">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-36" />
                                <Skeleton className="h-10 w-24 ml-auto" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location/Map Card Skeleton */}
                <Card className="flex flex-col h-fit">
                    <CardContent className="pt-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-9 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
