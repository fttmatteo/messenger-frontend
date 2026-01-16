import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ViewServicioSkeleton() {
    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden animate-in fade-in duration-500">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <Skeleton static className="h-5 w-full max-w-[256px] rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton static className="h-9 w-full max-w-[144px] rounded-full bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-end gap-3">
                    <Skeleton static className="h-9 w-full max-w-[112px] rounded-lg bg-muted/20" />
                    <Skeleton static className="h-9 w-9 shrink-0 rounded-lg bg-muted/20" />
                </div>
            </div>

            {/* 3-Column Layout: Equal distribution (33% each) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
                {/* General Information */}
                <Card className="h-full flex flex-col border-border/50 bg-background/40">
                    <CardHeader className="p-2 pb-0">
                        <h3 className="text-base text-foreground font-semibold px-3">Información general</h3>
                    </CardHeader>
                    <CardContent className="space-y-5 flex-1 overflow-y-auto mt-6 px-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton static className="h-9 w-9 flex-shrink-0 rounded-xl bg-muted/20" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton static className="h-3 w-full max-w-[96px] rounded bg-muted/10" />
                                    <Skeleton static className="h-4 w-full max-w-[176px] rounded bg-muted/20" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* History Timeline - 33% width */}
                <Card className="h-full flex flex-col border-border/50 bg-background/40">
                    <CardHeader className="p-2 pb-0">
                        <h3 className="text-base text-foreground font-semibold px-3">Historial de estados</h3>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden mt-6 px-5">
                        <div className="space-y-0 relative">
                            {[1, 2, 3].map((i, index) => (
                                <div key={i} className="flex gap-4 relative pb-8 last:pb-0">
                                    {/* Timeline Line & Dot */}
                                    <div className="flex flex-col items-center absolute left-0 top-1.5 h-full">
                                        <Skeleton static className="h-3.5 w-3.5 rounded-full bg-muted/30 z-10" />
                                        {index < 2 && (
                                            <div className="w-[2px] h-full bg-muted/10 mt-1" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pl-7 space-y-2.5">
                                        <Skeleton static className="h-5 w-28 rounded-full bg-muted/20" />
                                        <div className="bg-muted/5 rounded-2xl p-4 space-y-3 border border-border/40">
                                            <div className="flex justify-between items-center">
                                                <Skeleton static className="h-4 w-32 rounded bg-muted/20" />
                                                <Skeleton static className="h-3.5 w-24 rounded bg-muted/10" />
                                            </div>
                                            <Skeleton static className="h-3 w-full rounded bg-muted/5" />
                                            <Skeleton static className="h-3 w-4/5 rounded bg-muted/5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Map Skeleton */}
                <Card className="h-full flex flex-col border-border/50 bg-background/40">
                    <CardHeader className="px-5 py-4 space-y-3">
                        <h3 className="text-sm text-foreground font-medium">Ubicaciones</h3>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <Skeleton static className="h-3.5 w-14 rounded bg-muted/10" />
                                <Skeleton static className="h-3.5 w-14 rounded bg-muted/10" />
                                <Skeleton static className="h-3.5 w-14 rounded bg-muted/10" />
                            </div>
                            {/* Distance and time badges */}
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-6 w-16 rounded-full bg-muted/20" />
                                <Skeleton static className="h-6 w-20 rounded-full bg-muted/10" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-1 flex flex-col min-h-0">
                        <Skeleton static className="w-full flex-1 min-h-[250px] rounded-2xl bg-muted/10 border border-border/40 shadow-inner" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
