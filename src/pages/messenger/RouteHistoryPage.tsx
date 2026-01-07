import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
export default function RouteHistoryPage() {

    return (
        <div className="">
            <div className="p-4">
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
