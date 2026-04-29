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
import { Eye, EyeOff, HelpCircle, Package } from "lucide-react"
import { showToast } from "@/config/toast-config"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/components/mode-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import LoginMobile from "@/pages/mobile/LoginMobile"
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
 * Página de inicio de sesión de la aplicación.
 * Gestiona la autenticación de usuarios (Administradores y Mensajeros),
 * el manejo de errores de red, el control de intentos fallidos (rate limiting)
 * y la redirección según el tipo de dispositivo.
 */
export default function Login() {
    const isMobile = useIsMobile()
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [logoError, setLogoError] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null)
    const resetTurnstile = useTurnstileReset(turnstileWidgetId)

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

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token)
    }, [])

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken(null)
        showToast.error("Error al cargar la verificación de seguridad. Por favor, verifica tu conexión o deshabilita bloqueadores de anuncios.")
    }, [])

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken(null)
    }, [])

    const onSubmit = async (data: LoginFormValues) => {
        if (!turnstileToken) {
            showToast.error("Por favor, espera a que se complete la verificación de seguridad.")
            return
        }

        try {
            await login({
                document: parseInt(data.document, 10),
                password: data.password,
                rememberMe: data.rememberMe,
                turnstileToken
            })
            navigate("/", { replace: true })
        } catch (error) {
            // Resetear Turnstile en caso de error para obtener un nuevo token
            resetTurnstile()
            setTurnstileToken(null)

            const err = error as { statusCode?: number }

            // Manejar rate limiting (429)
            if (err.statusCode === 429) {
                // Mostrar notificación persistente de Sonner
                const toastId = showToast.error(
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
                        showToast.dismiss(toastId);
                        showToast.success('Cuenta desbloqueada. Puedes intentar de nuevo.', {
                            duration: 4000,
                        });
                        return;
                    }

                    // Actualizar el toast con el tiempo restante
                    showToast.error(
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
                showToast.error(getErrorMessage(error), {
                    duration: 4000
                })
            }
        }
    }

    // Mostrar cargando mientras se detecta el tipo de dispositivo
    if (isMobile === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    // Renderizar versión móvil en dispositivos móviles
    if (isMobile) {
        return <LoginMobile />
    }


    const handleExit = () => {
        window.open('', '_self', '');
        window.close();
        const win = window.open("about:blank", "_self");
        if (win) win.close();
        setTimeout(() => {
            if (window.location) {
                window.location.href = "about:blank";
            }
        }, 300);
    }

    return (
        <>
            {isSubmitting && <FullScreenLoader />}
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-3 overflow-hidden">
                <Card className="w-full max-w-[380px] relative shadow-lg border-border/50">
                    <div className="absolute top-3 left-3 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            type="button"
                            aria-label="Ayuda"
                            onClick={() => openSupportEmail()}
                        >
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                        <ModeToggle showLabel={false} />
                    </div>
                    <CardHeader className="space-y-0 pb-1.5 pt-8">
                        <div className="flex flex-col items-center justify-center mb-0.5">
                            {(!logoLoaded || logoError) && (
                                <div className="h-9 w-9 flex items-center justify-center bg-primary/10 rounded-lg">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                            )}
                            <img
                                src={logo}
                                alt="PLAK Logo"
                                className={`h-9 w-9 object-contain ${logoLoaded && !logoError ? '' : 'hidden'}`}
                                onLoad={() => setLogoLoaded(true)}
                                onError={() => setLogoError(true)}
                            />
                            <span className="text-[10px] font-medium text-muted-foreground leading-none mt-0.5">v{APP_CONFIG.version}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <CardTitle className="text-lg font-semibold text-center tracking-tight">Inicio de sesión</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1.5">
                            <div className="space-y-0.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="document" className="text-sm font-medium text-foreground/90">Documento</Label>
                                    {errors.document && (
                                        <p className="text-sm text-red-500 font-medium">{errors.document.message}</p>
                                    )}
                                </div>
                                <Input
                                    id="document"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ingrese su número de documento"
                                    autoComplete="username"
                                    {...register("document")}
                                    className="h-10 text-sm"
                                />
                            </div>

                            <div className="space-y-0.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Contraseña</Label>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingrese su contraseña"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        className="pr-10 h-10 text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
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
                                    <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
                                        Recordar contraseña
                                    </Label>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <TurnstileWidget
                                    onVerify={handleTurnstileVerify}
                                    onError={handleTurnstileError}
                                    onExpire={handleTurnstileExpire}
                                    onWidgetId={setTurnstileWidgetId}
                                    theme="auto"
                                />
                            </div>

                            <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={isSubmitting || !turnstileToken}>
                                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-2 text-center text-[9px] text-muted-foreground max-w-[300px] px-4 leading-tight">
                    PLAK es un software desarrollado y operado por Mateo Valencia Ardila. Para soporte técnico, por favor contáctanos a través del correo electrónico o el botón de ayuda en la esquina superior izquierda.
                </div>



                <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Salir de la aplicación?</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro que deseas salir? Esto cerrará la aplicación.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleExit} className="bg-red-500 text-white hover:bg-red-600">Salir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
