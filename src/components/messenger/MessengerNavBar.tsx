import { useNavigate } from "react-router-dom"
import { BarChart3, CalendarDays, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MessengerNavBar() {
    const navigate = useNavigate()

    return (
        <div className="grid grid-cols-3 gap-2">
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-3 px-1 gap-2 border-dashed"
                onClick={() => navigate('/messenger/historial-estadisticas')}
            >
                <CalendarDays className="h-5 w-5 text-primary" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                    Historial<br />Estad.
                </span>
            </Button>

            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-3 px-1 gap-2 border-dashed"
                onClick={() => navigate('/messenger/historial-recorrido')}
            >
                <Map className="h-5 w-5 text-primary" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                    Historial<br />Ruta
                </span>
            </Button>

            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-3 px-1 gap-2 border-dashed"
                onClick={() => navigate('/messenger/estadisticas')}
            >
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                    Estad.<br />Hoy
                </span>
            </Button>
        </div>
    )
}
