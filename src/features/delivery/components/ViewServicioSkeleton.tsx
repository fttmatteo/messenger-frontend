import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

/**
 * Esqueleto de carga exhaustivo para la vista de detalles de un servicio.
 * Cubre la información general, línea de tiempo e indicadores de ubicación.
 */
export function ViewServicioSkeleton() {
    return (
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <Skeleton static className="h-4 w-48 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton static className="h-6 w-32 rounded-full bg-muted/20" />
                </div>
                <div className="hidden md:flex md:flex-1 justify-end gap-2">
                    <Skeleton static className="h-8 w-24 rounded-lg bg-muted/20" />
                    <Skeleton static className="h-8 w-8 shrink-0 rounded-lg bg-muted/20" />
                </div>
            </div>

            <CardContent className="flex-1 pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-y-auto pb-2">
                    <Card className="flex flex-col gap-1 py-1 min-h-0">
                        <CardHeader className="p-2 pb-0">
                            <h3 className="text-base text-foreground font-semibold px-2">Información general</h3>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 overflow-y-auto mt-4 px-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton static className="h-8 w-8 flex-shrink-0 rounded-xl bg-muted/20" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton static className="h-2.5 w-full max-w-[96px] rounded bg-muted/10" />
                                        <Skeleton static className="h-3.5 w-full max-w-[176px] rounded bg-muted/20" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col gap-1 py-1 min-h-0">
                        <CardHeader className="p-2 pb-0">
                            <h3 className="text-base text-foreground font-semibold px-2">Historial de estados</h3>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto mt-4 px-4">
                            <div className="space-y-0 relative">
                                {[1, 2, 3].map((i, index) => (
                                    <div key={i} className="flex gap-3 relative pb-6 last:pb-0">
                                        <div className="flex flex-col items-center absolute left-0 top-1 h-full">
                                            <Skeleton static className="h-3 w-3 rounded-full bg-muted/30 z-10" />
                                            {index < 2 && (
                                                <div className="w-[2px] h-full bg-muted/10 mt-1" />
                                            )}
                                        </div>

                                        <div className="flex-1 pl-6 space-y-2">
                                            <Skeleton static className="h-4 w-24 rounded-full bg-muted/20" />
                                            <div className="bg-muted/5 rounded-xl p-3 space-y-2 border border-border/40">
                                                <div className="flex justify-between items-center">
                                                    <Skeleton static className="h-3.5 w-28 rounded bg-muted/20" />
                                                    <Skeleton static className="h-3 w-20 rounded bg-muted/10" />
                                                </div>
                                                <Skeleton static className="h-2.5 w-full rounded bg-muted/5" />
                                                <Skeleton static className="h-2.5 w-3/4 rounded bg-muted/5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col gap-1 py-1 min-h-0">
                        <CardHeader className="p-2 pb-0 space-y-2">
                            <h3 className="text-base text-foreground font-semibold px-2">Ubicaciones</h3>
                            <div className="flex flex-col gap-1.5 px-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton static className="h-3 w-12 rounded bg-muted/10" />
                                    <Skeleton static className="h-3 w-12 rounded bg-muted/10" />
                                    <Skeleton static className="h-3 w-12 rounded bg-muted/10" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton static className="h-5 w-14 rounded-full bg-muted/20" />
                                    <Skeleton static className="h-5 w-16 rounded-full bg-muted/10" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-2 flex flex-col min-h-0">
                            <Skeleton static className="w-full flex-1 min-h-[200px] rounded-xl bg-muted/10 border border-border/40 shadow-inner" />
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}
