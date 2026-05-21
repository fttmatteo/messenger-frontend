import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Phone, Navigation, Clock, MapPin, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Employee } from "@/types/employee.types"

interface MessengerInfoCardProps {
    employee: Employee | null
    speed: number | null
    lastUpdate: Date | null
    currentLocation: { lat: number, lng: number } | null
}

/**
 * Tarjeta lateral que muestra información en tiempo real de un mensajero.
 * Incluye teléfono, velocidad actual, tiempo desde la última señal y coordenadas.
 */
export function MessengerInfoCard({ employee, speed, lastUpdate, currentLocation }: MessengerInfoCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Información general
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {employee?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${employee.phone}`} className="hover:underline font-medium text-primary">
                            {employee.phone}
                        </a>
                    </div>
                )}
                {speed !== null && speed > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{(speed * 3.6).toFixed(1)} km/h</span>
                    </div>
                )}
                {lastUpdate && (
                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Última señal: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
                        </span>
                    </div>
                )}
                {currentLocation && (
                    <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-[10px] bg-muted px-2 py-1 rounded select-all">
                            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
