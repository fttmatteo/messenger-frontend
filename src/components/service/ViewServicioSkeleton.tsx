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

            {/* Content grid skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Detalles del Servicio */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-5 w-5" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Imágenes del Servicio */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <Skeleton className="h-32 w-48" />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
