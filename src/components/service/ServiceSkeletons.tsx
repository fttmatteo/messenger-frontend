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

/**
 * Skeleton for the ServiceList component.
 * Matches the layout of messenger/ServiceCard.tsx
 */
export function ServiceListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="relative flex items-center bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm"
                >
                    {/* Status Strip Skeleton */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted animate-pulse" />

                    <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
                        {/* Plate Badge Skeleton */}
                        <Skeleton className="h-9 w-24 rounded-md" />

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Action Buttons Skeleton */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton for the ServiceDetails page.
 * Matches the layout of messenger/ServiceDetails.tsx
 */
export function ServiceDetailsSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex-1 overflow-auto">
                {/* Hero Card Skeleton */}
                <div className="p-4 pb-2">
                    <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                        <div className="flex flex-col items-center gap-3">
                            <Skeleton className="h-12 w-32 rounded-md" />
                            <Skeleton className="h-7 w-24 rounded-full" />
                            <div className="flex items-center gap-2 w-full mt-2">
                                <Skeleton className="flex-1 h-11 rounded-lg" />
                                <Skeleton className="flex-1 h-11 rounded-lg" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Dealership Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Skeleton className="h-7 w-7 rounded-lg" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </Card>
                </div>

                {/* Service Info Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Skeleton className="h-7 w-7 rounded-lg" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

/**
 * Skeleton for Update Status page in messenger view.
 * Matches messenger/UpdateStatus.tsx layout.
 */
export function UpdateServiceStatusSkeleton() {
    return (
        <div className="animate-in fade-in duration-500">
            {/* Hero Card Skeleton */}
            <div className="p-4 pb-2">
                <Card className="p-5 bg-gradient-to-br from-card to-muted/30 border-border/50">
                    <div className="flex flex-col items-center gap-3">
                        <Skeleton className="h-12 w-32 rounded-md" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                </Card>
            </div>

            {/* Status Selection Skeleton */}
            <div className="px-4 py-3">
                <Skeleton className="h-3 w-28 mb-4 px-1" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border/40 bg-card"
                        >
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-3 w-44" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/95">
                <Skeleton className="w-full h-12 rounded-xl" />
            </div>
        </div>
    )
}

/**
 * Skeleton for Create Service page in messenger view.
 */
export function CreateServiceSkeleton() {
    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Photo Section Skeleton */}
            <div className="p-4 pb-2">
                <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                </Card>
            </div>

            {/* Dealership Card Skeleton */}
            <div className="px-4 pb-2">
                <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-md" />
                </Card>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/95">
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-24 rounded-xl" />
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
            </div>
        </div>
    )
}
