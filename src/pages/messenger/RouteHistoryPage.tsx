import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-device-type"

export default function RouteHistoryPage() {
    const { isIOS } = useDeviceType()

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-1 overflow-auto p-4 ${isIOS ? 'pb-[104px]' : 'pb-[92px]'}`}>
                <h2 className="text-lg font-semibold mb-4">Historial de Recorrido</h2>

                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MapPin className="h-12 w-12 mb-4 opacity-20" />
                        <p>Funcionalidad de historial de rutas próximamente.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
