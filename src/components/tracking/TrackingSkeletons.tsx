import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Skeleton for an individual messenger item in the Live Tracking list.
 * Matches the layout of MessengerListPanel items.
 */
export function MessengerListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="divide-y animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-3 space-y-1.5">
                    {/* Row 1: Name + Status badges */}
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton static className="h-4 w-full max-w-[140px] rounded bg-muted/20" />
                        <div className="flex items-center gap-1 shrink-0">
                            <Skeleton static className="h-5 w-7 rounded-full bg-muted/15" />
                            <Skeleton static className="h-5 w-7 rounded-full bg-muted/15" />
                        </div>
                    </div>
                    {/* Row 2: Last update time */}
                    <Skeleton static className="h-3 w-28 rounded bg-muted/10" />
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton for the Messenger Side Panel (Monitoreo en Vivo selection).
 * Matches the exact layout of MessengerSidePanel.
 */
export function MessengerSidePanelSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 bg-background/20">
            {/* Header Skeleton - matches real header */}
            <div className="p-3 border-b border-border/50 bg-background/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                    <div className="flex items-center gap-1 shrink-0">
                        <Skeleton static className="h-8 w-8 rounded-full bg-muted/20" />
                        <Skeleton static className="h-8 w-8 rounded-full bg-muted/20" />
                        <Skeleton static className="h-8 w-8 rounded-full bg-muted/20" />
                    </div>
                    <div className="min-w-0 flex-1 ml-1 space-y-1">
                        <Skeleton static className="h-3.5 w-28 rounded bg-muted/20" />
                        <Skeleton static className="h-3 w-16 rounded-full bg-muted/10" />
                    </div>
                </div>
                <Skeleton static className="h-7 w-7 rounded-full bg-muted/20" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 p-3 space-y-4 overflow-hidden">
                {/* Last update card - matches real card */}
                <div className="bg-secondary/5 rounded-xl px-3 py-2 border border-secondary/10 flex justify-between items-center">
                    <Skeleton static className="h-2.5 w-20 rounded bg-muted/10" />
                    <Skeleton static className="h-3 w-24 rounded bg-muted/20" />
                </div>

                {/* Productivity section - matches MessengerProductivity */}
                <div className="space-y-3">
                    <Skeleton static className="h-3 w-28 rounded bg-muted/15" />
                    <div className="grid grid-cols-2 gap-1.5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-background/40 border p-2 rounded-lg text-center space-y-1">
                                <Skeleton static className="h-2 w-14 mx-auto rounded bg-muted/5" />
                                <Skeleton static className="h-4 w-6 mx-auto rounded bg-muted/20" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline section - matches MessengerActivityTimeline header */}
                <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton static className="h-3 w-20 rounded bg-muted/15" />
                        <Skeleton static className="h-7 w-20 rounded-lg bg-muted/10" />
                    </div>

                    {/* Timeline items skeleton */}
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton static className="h-8 w-8 rounded-full shrink-0 bg-muted/15" />
                                <div className="space-y-2 flex-1 pt-1">
                                    <Skeleton static className="h-3 w-20 rounded bg-muted/10" />
                                    <Skeleton static className="h-3 w-full rounded bg-muted/5" />
                                </div>
                            </div>
                        ))}
                    </div>
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
                    <Skeleton static className="h-4 w-56 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton static className="h-8 w-72 rounded-lg bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-end">
                    <Skeleton static className="h-7 w-32 rounded-full bg-muted/20" />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column */}
                <div className="space-y-6 flex flex-col min-h-0">
                    {/* General Info Card */}
                    <Card className="border-border/50 bg-background/40 rounded-2xl overflow-hidden shadow-none">
                        <CardHeader className="p-5 pb-0">
                            <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 pt-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton static className="h-9 w-9 rounded-xl bg-muted/20" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton static className="h-3 w-24 rounded bg-muted/10" />
                                        <Skeleton static className="h-4 w-48 rounded bg-muted/20" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card className="border-border/50 bg-background/40 rounded-2xl overflow-hidden shadow-none flex-1 flex flex-col min-h-0">
                        <CardHeader className="p-5 pb-0 flex-row justify-between items-center space-y-0">
                            <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                            <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 pt-6 flex-1 flex flex-col min-h-0">
                            <div className="flex gap-3">
                                <Skeleton static className="h-10 flex-1 rounded-xl bg-muted/10 border border-border/40" />
                                <Skeleton static className="h-10 w-28 rounded-xl bg-muted/20" />
                            </div>

                            {/* History List Placeholder */}
                            <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden bg-muted/5 rounded-2xl p-4 border border-border/40">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 rounded-xl border border-border/30 bg-card/40 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Skeleton static className="h-4 w-28 rounded bg-muted/20" />
                                            <Skeleton static className="h-6 w-20 rounded-full bg-muted/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton static className="h-3 w-full rounded bg-muted/10" />
                                            <Skeleton static className="h-3 w-3/4 rounded bg-muted/10" />
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
                        <Skeleton static className="w-full h-full bg-muted/10" />
                        <div className="absolute inset-x-0 bottom-6 flex justify-center">
                            <Skeleton static className="h-12 w-64 rounded-full bg-muted/20 border border-white/20 backdrop-blur-md" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
