import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { serviceDeliveryService } from "@/services/service.service"
import { useAuth } from "@/context/AuthContext"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DailyStats } from "@/types/service.types"
import { Badge } from "@/components/ui/badge"

interface StatsCalendarProps {
    className?: string
}

export function StatsCalendar({ className }: StatsCalendarProps) {
    const { user } = useAuth()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [stats, setStats] = useState<DailyStats[]>([])
    const [loading, setLoading] = useState(false)
    const [month, setMonth] = useState<Date>(new Date())

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return

            setLoading(true)
            try {
                // Fetch stats for the whole current month view
                // We add some buffer days to be sure
                const start = new Date(month.getFullYear(), month.getMonth(), 1)
                const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)

                const data = await serviceDeliveryService.getDailyStats(
                    Number(user.id),
                    start,
                    end
                )
                setStats(data)
            } catch (error) {
                console.error("Error fetching stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user?.id, month])

    // Find stats for specific day
    const getDayStats = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd")
        return stats.find(s => s.date === dateStr)
    }

    // Custom day renderer to show dots/indicators
    const selectedStats = date ? getDayStats(date) : null

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 border-none shadow-sm bg-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Historial de Servicios</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={month}
                            onMonthChange={setMonth}
                            locale={es}
                            className="rounded-md border bg-background pointer-events-auto"
                            modifiers={{
                                hasData: (day) => !!getDayStats(day)
                            }}
                            modifiersStyles={{
                                hasData: { fontWeight: 'bold', textDecoration: 'underline decoration-primary' }
                            }}
                            footer={
                                loading && <p className="text-xs text-muted-foreground mt-2 text-center">Cargando...</p>
                            }
                        />
                    </CardContent>
                </Card>

                {/* Day Details Card */}
                {date && (
                    <Card className="flex-1 border-none shadow-sm animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle className="text-base capitalize">
                                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedStats ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Total asignados</span>
                                        <span className="font-medium">{selectedStats.total}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                            <span className="text-xl font-bold">{selectedStats.delivered}</span>
                                            <span className="text-xs">Entregados</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                                            <span className="text-xl font-bold">{selectedStats.returned}</span>
                                            <span className="text-xs">Devueltos</span>
                                        </div>
                                    </div>
                                    {selectedStats.canceled > 0 && (
                                        <Badge variant="outline" className="w-full justify-center text-red-500 border-red-200 mt-2">
                                            {selectedStats.canceled} Cancelados
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                    No hay registros para este día
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
