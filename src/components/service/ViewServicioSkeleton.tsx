import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Loading skeleton for the ViewServicio page.
 * Displays placeholder content while service data is being fetched.
 */
export function ViewServicioSkeleton() {
    return (
        <div className="flex flex-col h-full gap-1">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton className="h-9 w-32 rounded-full" />
                </div>
                <div className="flex-1 flex justify-end gap-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>

            {/* Split Layout: Info (Left), History (Right) & Map (Bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* General Information */}
                <Card className="h-[calc(100vh-135px)] min-h-[500px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <Skeleton className="h-6 w-44" />
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-y-auto mt-4 px-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* History Timeline */}
                <Card className="h-[calc(100vh-135px)] min-h-[500px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto mt-4 px-4">
                        <div className="space-y-0">
                            {[1, 2, 3].map((i, index) => (
                                <div key={i} className="flex gap-3 relative pb-6 last:pb-0">
                                    {/* Timeline Line & Dot */}
                                    <div className="flex flex-col items-center absolute left-0 top-1 h-full">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        {index < 2 && (
                                            <div className="w-0.5 h-full bg-muted mt-1" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pl-6 space-y-2">
                                        <Skeleton className="h-5 w-24 rounded-full" /> {/* Compact Pill */}
                                        <div className="bg-muted/30 rounded-lg p-2.5 space-y-2 border border-border/50">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Map Skeleton */}
                <Card className="md:col-span-2 h-[400px]">
                    <CardContent className="p-0 h-full">
                        <Skeleton className="w-full h-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
