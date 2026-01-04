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
                <Card className="h-[calc(100vh-180px)] min-h-[500px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <Skeleton className="h-6 w-44" />
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-y-auto mt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* History Timeline */}
                <Card className="h-[calc(100vh-180px)] min-h-[500px] flex flex-col">
                    <CardHeader className="p-2 pb-0">
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto mt-4">
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <div className="w-0.5 h-full bg-muted mt-2" />
                                    </div>
                                    <div className="flex-1 space-y-2 pb-6">
                                        <Skeleton className="h-7 w-32 rounded-full" />
                                        <Card className="mt-2">
                                            <CardContent className="p-3 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </CardContent>
                                        </Card>
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
