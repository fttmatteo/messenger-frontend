import { useState, useCallback, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/features/auth/context/AuthContext"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, HelpCircle, Package } from "lucide-react"
import { showToast } from "@/shared/config/toast-config"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/shared/components/ui/mode-toggle"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import LoginMobile from "@/pages/mobile/LoginMobile"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { APP_CONFIG, openSupportEmail } from "@/shared/lib/app-config"
import { FullScreenLoader } from "@/shared/components/ui/full-screen-loader"
import { TurnstileWidget } from "@/shared/components/ui/turnstile-widget"
import { useTurnstileReset } from "@/shared/hooks/use-turnstile-reset"
import AnimatedLogoBackground from "@/shared/components/ui/AnimatedLogoBackground"
import { Preferences } from '@capacitor/preferences'
import { setPreference, removePreference, getPreferenceSync } from "@/shared/utils/preferenceUtils"

const loginSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo se permiten números"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
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
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: getPreferenceSync('plak_remember_me') === 'true',
            acceptTerms: getPreferenceSync('plak_terms_accepted') === 'true'
        }
    })

    useEffect(() => {
        const loadAsyncPreferences = async () => {
            try {
                const { value: terms } = await Preferences.get({ key: 'plak_terms_accepted' });
                if (terms === 'true') setValue('acceptTerms', true);
                
                const { value: remember } = await Preferences.get({ key: 'plak_remember_me' });
                if (remember === 'true') setValue('rememberMe', true);
            } catch { /* ignore */ }
        };
        loadAsyncPreferences();
    }, [setValue]);

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
            <AnimatedLogoBackground />
            <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-3 overflow-hidden">
                <Card className="w-full max-w-[380px] relative shadow-lg border-border/50">
                    <div className="absolute top-3 left-3 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg !h-[32px] !w-[32px] !min-h-[32px] !max-h-[32px] box-border m-0"
                            type="button"
                            aria-label="Ayuda"
                            onClick={() => openSupportEmail()}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                        <ModeToggle showLabel={false} className="rounded-lg !h-[32px] !w-[32px] !min-h-[32px] !max-h-[32px] box-border m-0" />
                    </div>
                    <CardHeader className="space-y-0 pb-1.5 pt-3">
                        <div className="flex flex-col items-center justify-center mb-2.5">
                            {(!logoLoaded || logoError) && (
                                <div className="h-20 w-20 flex items-center justify-center bg-primary/10 rounded-2xl">
                                    <Package className="h-10 w-10 text-primary" />
                                </div>
                            )}
                            <img
                                src={logo}
                                alt="PLAK Logo"
                                className={`h-20 w-20 object-contain ${logoLoaded && !logoError ? '' : 'hidden'}`}
                                onLoad={() => setLogoLoaded(true)}
                                onError={() => setLogoError(true)}
                            />
                            <span className="text-[10px] font-medium text-muted-foreground leading-none mt-1.5">v{APP_CONFIG.version}</span>
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
                                    placeholder="Ingrese número de documento"
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
                                        placeholder="Ingrese contraseña"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        className="pr-10 h-10 text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        aria-label="Toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">Alternar visibilidad de contraseña</span>
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
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (checked === true) {
                                                        setPreference('plak_remember_me', 'true');
                                                    } else {
                                                        removePreference('plak_remember_me');
                                                    }
                                                }}
                                                className="h-4 w-4 rounded-sm"
                                            />
                                        )}
                                    />
                                        <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
                                        Recordar contraseña
                                    </Label>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1 pt-0.5 pb-1">
                                <div className="flex items-start space-x-2">
                                    <Controller
                                        name="acceptTerms"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="acceptTerms"
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (checked === true) {
                                                        setPreference('plak_terms_accepted', 'true');
                                                    } else {
                                                        removePreference('plak_terms_accepted');
                                                    }
                                                }}
                                                className="h-4 w-4 mt-0.5 shrink-0 rounded-sm"
                                            />
                                        )}
                                    />
                                    <label htmlFor="acceptTerms" className="text-xs text-muted-foreground font-normal leading-tight cursor-pointer">
                                        He leído y acepto los{' '}
                                        <span
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate('/terminos-condiciones');
                                            }}
                                            className="text-primary font-semibold hover:underline cursor-pointer"
                                        >
                                            términos y condiciones
                                        </span>{' '}
                                        y la{' '}
                                        <span
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate('/politica-privacidad');
                                            }}
                                            className="text-primary font-semibold hover:underline cursor-pointer"
                                        >
                                            política de privacidad
                                        </span>
                                        .
                                    </label>
                                </div>
                                {errors.acceptTerms && (
                                    <p className="text-xs text-red-500 font-medium pl-6">{errors.acceptTerms.message}</p>
                                )}
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

                            <Button type="submit" className="w-full h-10 text-sm font-bold shadow-sm transition-all active:scale-[0.98]" disabled={isSubmitting || !turnstileToken}>
                                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-2 text-center text-[9px] text-muted-foreground max-w-[300px] px-4 leading-tight space-y-1">
                    <p>
                        Soporte técnico -{' '}
                        <a href="mailto:contacto@plak.digital" className="hover:underline text-primary font-semibold">
                            contacto@plak.digital
                        </a>
                    </p>
                    <p className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button 
                            type="button"
                            onClick={() => navigate('/politica-cookies')}
                            className="underline text-primary font-semibold cursor-pointer"
                        >
                            Política de cookies
                        </button>
                    </p>
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
