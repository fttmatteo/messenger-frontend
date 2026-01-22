import { useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { navigateAfterLogin } from "@/hooks/useNavigationGuard"
import { Eye, EyeOff, HelpCircle, Package } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/components/mode-toggle"
import { getErrorMessage } from "@/lib/error-utils"
import { APP_CONFIG, openSupportEmail } from "@/lib/app-config"
import { FullScreenLoader } from "@/components/ui/full-screen-loader"
import { TurnstileWidget } from "@/components/ui/turnstile-widget"
import { useTurnstileReset } from "@/hooks/use-turnstile-reset"

const loginSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo se permiten números"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Componente de inicio de sesión optimizado para dispositivos móviles.
 * Proporciona una interfaz simplificada para que los mensajeros autentiquen
 * su acceso mediante documento y contraseña. Incluye manejo de errores de red,
 * bloqueo por intentos fallidos (rate limiting) y persistencia de sesión.
 */
export default function LoginMobile() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [logoError, setLogoError] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null)
    const resetTurnstile = useTurnstileReset(turnstileWidgetId)

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token)
    }, [])

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken(null)
        toast.error("Error al cargar la verificación de seguridad. Por favor, verifica tu conexión o deshabilita bloqueadores de anuncios.")
    }, [])

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken(null)
    }, [])

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    })

    const onSubmit = async (data: LoginFormValues) => {
        if (!turnstileToken) {
            toast.error("Por favor, espera a que se complete la verificación de seguridad.")
            return
        }

        try {
            await login({
                document: parseInt(data.document, 10),
                password: data.password,
                rememberMe: data.rememberMe,
                turnstileToken
            })
            // Limpiar historial y navegar al inicio de mensajero
            // Esto evita que el gesto de retroceso regrese al login
            navigateAfterLogin(navigate)
        } catch (error) {
            // Resetear Turnstile en caso de error para obtener un nuevo token
            resetTurnstile()
            setTurnstileToken(null)

            const err = error as { statusCode?: number }

            // Manejar rate limiting (429)
            if (err.statusCode === 429) {
                // Mostrar notificación persistente de Sonner con mismo diseño
                const toastId = toast.error(
                    `Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.`,
                    {
                        duration: Infinity, // Persistente mientras esté bloqueado
                        closeButton: false,
                    }
                );

                // Contar hacia atrás y actualizar el toast
                let counter = 15;
                const interval = setInterval(() => {
                    counter--;

                    if (counter <= 0) {
                        clearInterval(interval);
                        if (toastId) {
                            toast.dismiss(toastId);
                        }
                        toast.success('Cuenta desbloqueada. Puedes intentar de nuevo.', {
                            duration: 4000,
                        });
                        return;
                    }

                    // Actualizar el toast con el tiempo restante
                    toast.error(
                        `Demasiados intentos fallidos. Intenta de nuevo en ${counter} minuto${counter !== 1 ? 's' : ''}`,
                        {
                            id: toastId,
                            duration: Infinity,
                            closeButton: false,
                        }
                    );
                }, 60000); // Actualizar cada minuto
            } else {
                // Otros errores
                toast.error(getErrorMessage(error), {
                    duration: 4000
                })
            }
        }
    }

    return (
        <>
            {isSubmitting && <FullScreenLoader />}
            <div className="flex items-center justify-center min-h-[100dvh] w-full bg-background p-3 overflow-hidden supports-[min-height:100dvh]:min-h-[100dvh] supports-[min-height:100dvh]:h-[100dvh]">
                <Card className="w-full max-w-[380px] relative shadow-lg border-border/50">
                    <div className="absolute top-2 left-2 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            type="button"
                            aria-label="Ayuda"
                            onClick={() => openSupportEmail()}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                        <ModeToggle showLabel={false} />
                    </div>
                    <CardHeader className="space-y-0.5 pb-2 pt-8">
                        <div className="flex flex-col items-center justify-center mb-1">
                            {(!logoLoaded || logoError) && (
                                <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            <img
                                src={logo}
                                alt="PLAK Logo"
                                className={`h-10 w-10 object-contain ${logoLoaded && !logoError ? '' : 'hidden'}`}
                                onLoad={() => setLogoLoaded(true)}
                                onError={() => setLogoError(true)}
                            />
                            <span className="text-[10px] font-medium text-muted-foreground leading-none mt-1">v{APP_CONFIG.version}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <CardTitle className="text-xl font-semibold text-center tracking-tight">Inicio de sesión</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="document" className="text-sm font-medium text-foreground/90">Documento</Label>
                                    {errors.document && (
                                        <p className="text-xs text-red-500 font-medium">{errors.document.message}</p>
                                    )}
                                </div>
                                <Input
                                    id="document"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ingrese su número de documento"
                                    autoComplete="username"
                                    {...register("document")}
                                    className="h-11 text-base"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Contraseña</Label>
                                    {errors.password && (
                                        <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingrese su contraseña"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        className="pr-10 h-11 text-base"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center space-x-1.5">
                                    <Controller
                                        name="rememberMe"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="rememberMe"
                                                name={field.name}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-4 w-4 rounded-sm"
                                            />
                                        )}
                                    />
                                    <Label htmlFor="rememberMe" className="text-sm text-muted-foreground font-normal cursor-pointer">
                                        Recordar contraseña
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium mt-1"
                                disabled={isSubmitting || !turnstileToken}
                            >
                                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <TurnstileWidget
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileExpire}
                        onWidgetId={setTurnstileWidgetId}
                        theme="auto"
                        size="normal"
                    />
                </div>
            </div>
        </>
    )
}
