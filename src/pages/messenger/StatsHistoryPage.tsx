import { StatsCalendar } from "@/components/messenger/StatsCalendar"

export default function StatsHistoryPage() {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Calendario de Actividad</h2>
            <StatsCalendar />
        </div>
    )
}
