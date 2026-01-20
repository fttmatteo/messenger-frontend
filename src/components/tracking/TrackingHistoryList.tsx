import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Route, CalendarIcon, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AddressDisplay } from "@/components/tracking"
import type { TrackingHistoryItem } from "@/types/tracking.types"

interface TrackingHistoryListProps {
    historyData: TrackingHistoryItem[]
    loading: boolean
    date: Date
    onDateSelect: (date: Date) => void
    showRoute: boolean
    onToggleRoute: () => void
    calendarOpen: boolean
    setCalendarOpen: (open: boolean) => void
}

/**
 * Lista lateral o inferior que muestra el historial de movimientos de un mensajero.
 * Agrupa puntos de ubicación cercanos en el tiempo para facilitar la lectura.
 */
export function TrackingHistoryList({
    historyData,
    loading,
    date,
    onDateSelect,
    showRoute,
    onToggleRoute,
    calendarOpen,
    setCalendarOpen
}: TrackingHistoryListProps) {

    const getGroupedHistory = () => {
        const grouped: Array<{
            startTime: string;
            endTime: string;
            lat: number;
            lng: number;
            count: number;
            maxSpeed: number;
        }> = [];

        const sorted = [...historyData].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sorted.forEach((item) => {
            const key = `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`;
            const last = grouped[grouped.length - 1];
            const lastKey = last ? `${last.lat.toFixed(4)},${last.lng.toFixed(4)}` : null;

            if (last && key === lastKey) {
                last.endTime = item.timestamp;
                last.count++;
                last.maxSpeed = Math.max(last.maxSpeed, (item.speed || 0) * 3.6);
            } else {
                grouped.push({
                    startTime: item.timestamp,
                    endTime: item.timestamp,
                    lat: item.latitude,
                    lng: item.longitude,
                    count: 1,
                    maxSpeed: (item.speed || 0) * 3.6
                });
            }
        });

        return grouped.reverse();
    }

    const safeFormat = (dateInput: string | Date | undefined, formatStr: string) => {
        if (!dateInput) return ""
        const d = new Date(dateInput)
        if (!isFinite(d.getTime())) return "Fecha inválida"
        return format(d, formatStr, { locale: es })
    }

    const groupedHistory = getGroupedHistory()

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    Historial del Día
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-10 border-dashed">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(date, "PPP", { locale: es })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                                if (d) {
                                    onDateSelect(d)
                                    setCalendarOpen(false)
                                }
                            }}
                            locale={es}
                            disabled={(d) => d > new Date()}
                        />
                    </PopoverContent>
                </Popover>


                {historyData.length > 0 && (
                    <Button
                        variant={showRoute ? "default" : "outline"}
                        size="sm"
                        className="w-full h-9"
                        onClick={onToggleRoute}
                    >
                        <Route className="h-4 w-4 mr-2" />
                        {showRoute ? "Ocultar ruta" : "Ver ruta en mapa"}
                    </Button>
                )}


                {loading ? (
                    null
                ) : historyData.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground font-medium">
                            Sin movimientos
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-1">
                            {format(date, "dd MMM yyyy", { locale: es })}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <ScrollArea className="h-72 rounded-lg border bg-muted/10">
                            <div className="p-4 space-y-3">
                                {groupedHistory.map((group, i) => (
                                    <div key={i} className="p-3 rounded-lg border bg-card text-xs shadow-sm hover:border-primary/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-1.5 font-bold text-primary">
                                                <span>{safeFormat(group.startTime, "HH:mm")}</span>
                                                {group.startTime !== group.endTime && (
                                                    <>
                                                        <span className="text-muted-foreground font-normal">→</span>
                                                        <span>{safeFormat(group.endTime, "HH:mm")}</span>
                                                    </>
                                                )}
                                            </div>
                                            {group.maxSpeed > 2 && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-4.5 font-mono">
                                                    {group.maxSpeed.toFixed(0)} km/h
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3 w-3 opacity-70 shrink-0" />
                                            <AddressDisplay lat={group.lat} lng={group.lng} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                            {historyData.length} puntos registrados
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
