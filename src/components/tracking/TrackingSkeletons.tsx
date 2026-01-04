import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MessengerDetailsSkeleton() {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header: Breadcrumb - Title - Badge */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 mb-2">
                <Skeleton className="h-4 w-48 justify-self-start" />
                <Skeleton className="h-8 w-64 justify-self-center" />
                <Skeleton className="h-7 w-28 justify-self-end rounded-full" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* General Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-5 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-5 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-9 w-full" />

                            {/* History List Placeholder */}
                            <div className="space-y-3 mt-4">
                                <div className="h-72 rounded-lg border bg-muted/10 p-4 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 rounded-lg border bg-card shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-16 rounded-full" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Map */}
                <Card className="lg:col-span-2 overflow-hidden border-2 shadow-inner">
                    <CardContent className="p-0 h-[600px] bg-muted/20">
                        <Skeleton className="w-full h-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
