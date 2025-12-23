import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/components/mode-toggle"

const loginSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo se permiten números"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginMobile() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login({
                document: parseInt(data.document, 10),
                password: data.password,
                rememberMe: data.rememberMe
            })
            navigate("/")
        } catch (err: any) {
            toast.error(err.message || "Algo salió mal", {
                id: 'login-error',
                position: 'top-left',
                duration: 4000
            })
        }
    }

    return (
        <div className="flex items-center justify-center h-[100dvh] bg-background p-3 overflow-hidden">
            <Card className="w-full max-w-[380px] relative shadow-lg border-border/50">
                {/* Help Button - Top Left */}
                <div className="absolute top-2 left-2 z-10">
                    <Button variant="ghost" size="icon" className="h-7 w-7" type="button">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </div>
                {/* Mode Toggle Button - Consistent Position */}
                <div className="absolute top-2 right-2 z-10">
                    <ModeToggle className="h-7 w-7" />
                </div>
                <CardHeader className="space-y-0.5 pb-2 pt-8">
                    <div className="flex flex-col items-center justify-center mb-1">
                        <img src={logo} alt="PLAK Logo" className="h-10 w-10 object-contain" />
                    </div>
                    <div className="flex items-center justify-center">
                        <CardTitle className="text-lg font-semibold text-center tracking-tight">Inicio de sesión</CardTitle>
                    </div>
                    <CardDescription className="text-center text-xs text-muted-foreground">
                        Ingrese sus credenciales
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="document" className="text-xs font-medium text-foreground/80">Documento</Label>
                                {errors.document && (
                                    <p className="text-[10px] text-red-500 font-medium">{errors.document.message}</p>
                                )}
                            </div>
                            <Input
                                id="document"
                                type="text"
                                inputMode="numeric"
                                placeholder="Ingrese su número de documento"
                                autoComplete="username"
                                {...register("document")}
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">Contraseña</Label>
                                {errors.password && (
                                    <p className="text-[10px] text-red-500 font-medium">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingrese su contraseña"
                                    autoComplete="current-password"
                                    {...register("password")}
                                    className="pr-10 h-9 text-sm"
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
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-3.5 w-3.5 rounded-sm"
                                        />
                                    )}
                                />
                                <Label htmlFor="rememberMe" className="text-[11px] text-muted-foreground font-normal cursor-pointer">
                                    Recordar contraseña
                                </Label>
                            </div>
                            <Button variant="link" className="px-0 font-normal text-[11px] text-primary/80 h-auto" type="button">
                                ¿Olvidó su contraseña?
                            </Button>
                        </div>

                        <Button type="submit" className="w-full h-9 text-sm font-medium mt-1" disabled={isSubmitting}>
                            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
