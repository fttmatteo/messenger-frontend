import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Loading skeleton for the ViewServicio page.
 * Displays placeholder content while service data is being fetched.
 */
export function ViewServicioSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb skeleton */}
            <Skeleton className="h-5 w-64" />

            {/* Header skeleton */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-80" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>

            {/* General Information - Horizontal layout for desktop */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-44" />
                </CardHeader>
                <CardContent>
                    {/* Desktop: Horizontal grid layout */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile: Vertical layout */}
                    <div className="md:hidden space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Historial skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 pl-8">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
