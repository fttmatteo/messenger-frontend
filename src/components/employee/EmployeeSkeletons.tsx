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
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24 font-mono" />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </TableCell>
        </TableRow>
    )
}

/**
 * Skeleton component for an employee card (mobile list view).
 */
export function CardSkeleton() {
    return (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </div>
                    </div>
                    {/* Only keeping valid actions space if needed, matching real card */}
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Skeleton for Employee Form (Create/Edit)
 */
export function EmployeeFormSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-48" />
            </div>

            <Card className="flex-1 flex flex-col">
                <CardContent className="pt-6 flex-1">
                    <div className="h-full flex flex-col">
                        <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3 content-start">
                            {/* Document Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Name Field */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Role Field */}
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
        </div>
    )
}
