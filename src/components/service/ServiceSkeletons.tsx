import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

/**
 * Skeleton component for a service table row.
 * Matches the actual table structure in Servicios.tsx
 */
export function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Placa - w-[100px] */}
            <TableCell className="w-[100px] py-4">
                <Skeleton className="h-7 w-[90px] rounded-md bg-muted/20" />
            </TableCell>
            {/* Concesionario - max-w-[200px] */}
            <TableCell className="max-w-[200px] py-4">
                <Skeleton className="h-4 w-32 rounded bg-muted/20" />
            </TableCell>
            {/* Mensajero - max-w-[200px] */}
            <TableCell className="max-w-[200px] py-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full bg-muted/20" />
                    <Skeleton className="h-4 w-28 rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Estado - w-[140px] */}
            <TableCell className="w-[140px] py-4">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/10 w-fit border border-border/40">
                    <Skeleton className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                    <Skeleton className="h-3.5 w-16 rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Creado - w-[120px] */}
            <TableCell className="w-[120px] py-4">
                <Skeleton className="h-4 w-24 rounded bg-muted/20" />
            </TableCell>
            {/* Acción - w-[120px] */}
            <TableCell className="w-[120px] py-4 text-center">
                <div className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded-lg bg-muted/20" />
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
        <Card className="mb-3 border-border/50 bg-background/40">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex flex-col items-center gap-2 w-fit">
                                <Skeleton className="h-7 w-28 rounded-full bg-muted/20" />
                                <div className="flex flex-col items-center">
                                    <Skeleton className="h-8 w-28 rounded bg-muted/20" />
                                    <Skeleton className="h-3 w-16 mt-0.5 rounded bg-muted/10" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton className="h-4 w-48 rounded bg-muted/10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton className="h-4 w-40 rounded bg-muted/10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton className="h-4 w-44 rounded bg-muted/10" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <Skeleton className="h-9 w-24 rounded-lg bg-muted/20" />
                        <Skeleton className="h-9 w-24 rounded-lg bg-muted/20" />
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
        <div className="space-y-2 animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="relative flex items-center bg-card/60 border border-border/50 rounded-xl overflow-hidden shadow-sm h-[72px]"
                >
                    {/* Status Strip Skeleton */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted/20 animate-pulse" />

                    <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
                        {/* Plate Badge Skeleton */}
                        <div className="flex flex-col items-center gap-1">
                            <Skeleton className="h-8 w-[80px] rounded bg-muted/20" />
                            <Skeleton className="h-2.5 w-12 rounded bg-muted/10" />
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Action Buttons Skeleton */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full bg-muted/20" />
                            <Skeleton className="h-9 w-9 rounded-full bg-muted/20" />
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
                    <Card className="p-5 bg-gradient-to-br from-card to-muted/20 border-border/50 rounded-2xl shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-1.5">
                                <Skeleton className="h-14 w-36 rounded-lg bg-muted/20" />
                                <Skeleton className="h-3 w-20 rounded bg-muted/10 mx-auto" />
                            </div>
                            <Skeleton className="h-7 w-28 rounded-full bg-muted/20" />
                            <div className="flex items-center gap-3 w-full mt-2">
                                <Skeleton className="flex-1 h-12 rounded-xl bg-muted/20" />
                                <Skeleton className="flex-1 h-12 rounded-xl bg-muted/20" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Dealership Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Skeleton className="h-8 w-8 rounded-xl bg-muted/20" />
                            <Skeleton className="h-5 w-48 rounded bg-muted/20" />
                        </div>
                        <div className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40">
                            <Skeleton className="h-5 w-56 rounded bg-muted/10" />
                            <Skeleton className="h-4 w-40 rounded bg-muted/10" />
                            <Skeleton className="h-4 w-full rounded bg-muted/10" />
                        </div>
                    </Card>
                </div>

                {/* Service Info Card Skeleton */}
                <div className="px-4 pb-2">
                    <Card className="p-4 border-border/50 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Skeleton className="h-8 w-8 rounded-xl bg-muted/20" />
                            <Skeleton className="h-5 w-56 rounded bg-muted/20" />
                        </div>
                        <div className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40">
                            <Skeleton className="h-4 w-64 rounded bg-muted/10" />
                            <Skeleton className="h-4 w-48 rounded bg-muted/10" />
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
        <div className="animate-in fade-in duration-500 pb-24">
            {/* Hero Card Skeleton */}
            <div className="p-4 pb-2">
                <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-border/50 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1.5">
                            <Skeleton className="h-14 w-36 rounded-lg bg-muted/20" />
                            <Skeleton className="h-3 w-20 rounded bg-muted/10 text-center" />
                        </div>
                        <Skeleton className="h-5 w-44 rounded bg-muted/10 mx-auto" />
                        <Skeleton className="h-8 w-28 rounded-full bg-muted/20" />
                    </div>
                </Card>
            </div>

            {/* Status Selection Skeleton */}
            <div className="px-4 py-3">
                <Skeleton className="h-4 w-32 mb-6 ml-1 rounded bg-muted/10" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border/40 bg-card/60"
                        >
                            <Skeleton className="h-14 w-14 rounded-xl bg-muted/20" stroke-width="2" />
                            <div className="flex-1 space-y-2.5">
                                <Skeleton className="h-5 w-28 rounded bg-muted/20" />
                                <Skeleton className="h-3.5 w-56 rounded bg-muted/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/95 backdrop-blur-md">
                <Skeleton className="w-full h-14 rounded-2xl bg-muted/30" />
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
                <Card className="p-5 border-border/50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-8 w-8 rounded-xl bg-muted/20" />
                        <Skeleton className="h-5 w-32 rounded bg-muted/20" />
                    </div>
                    <Skeleton className="w-full aspect-[4/3] rounded-2xl bg-muted/10 border border-border/40 shadow-inner" />
                </Card>
            </div>

            {/* Dealership Card Skeleton */}
            <div className="px-4 pb-2">
                <Card className="p-5 border-border/50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-8 w-8 rounded-xl bg-muted/20" />
                        <Skeleton className="h-5 w-44 rounded bg-muted/20" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl bg-muted/10 border border-border/40" />
                </Card>
            </div>

            {/* Fixed Bottom Action Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/95 backdrop-blur-md">
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-28 rounded-2xl bg-muted/20" />
                    <Skeleton className="flex-1 h-12 rounded-2xl bg-muted/30" />
                </div>
            </div>
        </div>
    )
}
