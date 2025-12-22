import { Smartphone, Monitor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import logo from "@/assets/logo.png"

export function MobileOnlyGuard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-6">
            <Card className="max-w-md w-full shadow-2xl border-2">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <img src={logo} alt="PLAK" className="h-16 w-16 object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Dispositivo no compatible
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                            <Monitor className="h-10 w-10 text-red-500" />
                        </div>
                        <span className="text-3xl text-muted-foreground">→</span>
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Smartphone className="h-10 w-10 text-green-500" />
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <p className="text-lg font-medium">
                            Esta aplicación está diseñada exclusivamente para dispositivos móviles.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Por favor, accede desde tu smartphone o tablet para utilizar el sistema de mensajería.
                        </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-amber-800 dark:text-amber-200 text-sm text-center">
                            <strong>¿Por qué solo móvil?</strong><br />
                            El rastreo GPS y las funciones de entrega requieren un dispositivo móvil para funcionar correctamente.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
