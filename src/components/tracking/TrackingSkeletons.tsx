import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Skeleton for an individual messenger item in the Live Tracking list.
 */
export function MessengerListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-1 animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-3.5 border-b border-border/40 flex items-center justify-between gap-4 bg-background/30">
                    <div className="flex-1 min-w-0 space-y-2.5">
                        <Skeleton className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
                        <Skeleton className="h-4 w-24 rounded-full bg-muted/10" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Skeleton className="h-4 w-4 rounded-full bg-muted/20" />
                        <Skeleton className="h-4 w-4 rounded-full bg-muted/20" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton for the Messenger Side Panel (Monitoreo en Vivo selection).
 */
export function MessengerSidePanelSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 bg-background/20">
            {/* Header Skeleton */}
            <div className="p-4 border-b border-border/50 bg-background/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                    <div className="flex gap-1.5 shrink-0">
                        <Skeleton className="h-9 w-9 rounded-full bg-muted/20" />
                        <Skeleton className="h-9 w-9 rounded-full bg-muted/20" />
                        <Skeleton className="h-9 w-9 rounded-full bg-muted/20" />
                    </div>
                    <div className="ml-1 space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-32 rounded bg-muted/20" />
                        <Skeleton className="h-4 w-20 rounded-full bg-muted/10" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-muted/20" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 p-4 space-y-5 overflow-hidden">
                {/* Last update card placeholder */}
                <div className="bg-muted/10 rounded-xl px-4 py-3 border border-border/40 flex justify-between items-center">
                    <Skeleton className="h-3.5 w-24 rounded bg-muted/10" />
                    <Skeleton className="h-3.5 w-28 rounded bg-muted/20" />
                </div>

                {/* Productivity card */}
                <Card className="border-border/50 bg-background/40 shadow-none rounded-2xl">
                    <CardHeader className="p-4 pb-2 flex-row justify-between items-center space-y-0">
                        <Skeleton className="h-4 w-32 rounded bg-muted/20" />
                        <Skeleton className="h-4 w-4 rounded-full bg-muted/10" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-muted/10 p-3 rounded-xl space-y-2 border border-border/30">
                                    <Skeleton className="h-3 w-16 rounded bg-muted/5" />
                                    <Skeleton className="h-5 w-10 rounded bg-muted/20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline title */}
                <div className="flex justify-between items-center px-1">
                    <Skeleton className="h-4 w-36 rounded bg-muted/20" />
                    <Skeleton className="h-4 w-24 rounded bg-muted/10" />
                </div>

                {/* Timeline items */}
                <div className="space-y-5 pl-1">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-[3px] bg-muted/10 rounded-full shrink-0 mt-2 mb-2" />
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-28 rounded bg-muted/10" />
                                    <Skeleton className="h-3.5 w-16 rounded bg-muted/5" />
                                </div>
                                <Skeleton className="h-16 w-full rounded-2xl bg-muted/10 border border-border/40" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Skeleton for the Messenger Details full page.
 */
export function MessengerDetailsSkeleton() {
    return (
        <div className="space-y-5 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Header: Breadcrumb - Title - Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <Skeleton className="h-4 w-56 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton className="h-8 w-72 rounded-lg bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-end">
                    <Skeleton className="h-7 w-32 rounded-full bg-muted/20" />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column */}
                <div className="space-y-6 flex flex-col min-h-0">
                    {/* General Info Card */}
                    <Card className="border-border/50 bg-background/40 rounded-2xl overflow-hidden shadow-none">
                        <CardHeader className="p-5 pb-0">
                            <Skeleton className="h-5 w-48 rounded bg-muted/20" />
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 pt-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-9 w-9 rounded-xl bg-muted/20" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-24 rounded bg-muted/10" />
                                        <Skeleton className="h-4 w-48 rounded bg-muted/20" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card className="border-border/50 bg-background/40 rounded-2xl overflow-hidden shadow-none flex-1 flex flex-col min-h-0">
                        <CardHeader className="p-5 pb-0 flex-row justify-between items-center space-y-0">
                            <Skeleton className="h-5 w-48 rounded bg-muted/20" />
                            <Skeleton className="h-4 w-4 rounded-full bg-muted/10" />
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 pt-6 flex-1 flex flex-col min-h-0">
                            <div className="flex gap-3">
                                <Skeleton className="h-10 flex-1 rounded-xl bg-muted/10 border border-border/40" />
                                <Skeleton className="h-10 w-28 rounded-xl bg-muted/20" />
                            </div>

                            {/* History List Placeholder */}
                            <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden bg-muted/5 rounded-2xl p-4 border border-border/40">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 rounded-xl border border-border/30 bg-card/40 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-4 w-28 rounded bg-muted/20" />
                                            <Skeleton className="h-6 w-20 rounded-full bg-muted/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-full rounded bg-muted/10" />
                                            <Skeleton className="h-3 w-3/4 rounded bg-muted/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Map */}
                <Card className="lg:col-span-2 overflow-hidden border-border/50 bg-background/40 rounded-3xl shadow-lg flex flex-col h-full border-2">
                    <CardContent className="p-0 flex-1 relative bg-muted/5">
                        <Skeleton className="w-full h-full bg-muted/10 animate-pulse" />
                        <div className="absolute inset-x-0 bottom-6 flex justify-center">
                            <Skeleton className="h-12 w-64 rounded-full bg-muted/20 border border-white/20 backdrop-blur-md" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
