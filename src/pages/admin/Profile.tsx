import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, User, ShieldCheck, Smartphone, FileText, KeyRound, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"
import { profileService, type ProfileUpdateRequest } from "@/features/auth/services/profile.service"
import { showToast } from "@/shared/config/toast-config"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { capitalizeWords } from "@/shared/utils/stringUtils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter} from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Skeleton } from "@/shared/components/ui/skeleton"

const profileSchema = z.object({
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().optional().refine(val => !val || val.length >= 6, {
        message: "La contraseña debe tener al menos 6 caracteres"
    }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

/**
 * Página de perfil de usuario.
 * Permite al usuario autenticado ver su información y actualizar
 * sus datos personales y contraseña.
 * Utiliza los estilos de toast y skeletons predefinidos para consistencia.
 */
export default function Profile() {
    const { user, updateUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [fullProfile, setFullProfile] = useState<{ document: string | number; role: string } | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const data = await profileService.getMe()
                setFullProfile({
                    document: data.document,
                    role: data.role
                })
                reset({
                    fullName: data.fullName,
                    phone: data.phone,
                    password: "",
                })
            } catch (error) {
                showToast.error("Error al cargar perfil: " + getErrorMessage(error))
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [reset])

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            setSaving(true)
            const updateData: ProfileUpdateRequest = {
                fullName: capitalizeWords(data.fullName),
                phone: data.phone,
            }
            if (data.password) {
                updateData.password = data.password
            }

            const updated = await profileService.updateMe(updateData)
            
            updateUser({ name: updated.fullName })
            
            showToast.success("Perfil actualizado correctamente")
            
            reset({ ...data, fullName: capitalizeWords(data.fullName), password: "" })
        } catch (error) {
            showToast.error("Error al actualizar perfil: " + getErrorMessage(error))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <ProfileSkeleton />
    }

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"

    return (
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            {/* Header Section - Hidden on Mobile */}
            <div className="hidden md:flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Perfil</h1>
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0">
                <div className="w-full flex flex-col gap-2 h-full overflow-y-auto pb-2">
                    {/* Perfil Header Card */}
                    <Card>
                        <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-background">
                                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-foreground leading-none">{user?.name}</h2>
                                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                                {fullProfile?.role || user?.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[320px] mb-2 bg-muted/50 p-1">
                            <TabsTrigger value="personal" className="text-xs py-1 data-[state=active]:bg-background">
                                Información personal
                            </TabsTrigger>
                            <TabsTrigger value="security" className="text-xs py-1 data-[state=active]:bg-background">
                                Seguridad
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                            <TabsContent value="personal" className="mt-0 focus-visible:outline-none flex-1 flex flex-col">
                                <Card className="flex-1 flex flex-col">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-base">Datos personales</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col p-4 pt-0">
                                            <div className="grid gap-4 md:grid-cols-3 flex-1 content-start">
                                                <div className="space-y-2">
                                                    <Label htmlFor="document" className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        Documento (No editable)
                                                    </Label>
                                                    <Input
                                                        id="document"
                                                        value={fullProfile?.document 
                                                            ? String(fullProfile.document).replace(/.(?=.{4})/g, '*') 
                                                            : ""}
                                                        disabled
                                                        className="bg-muted/30 border-dashed"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="fullName" className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        Nombre completo
                                                    </Label>
                                                    <Input
                                                        id="fullName"
                                                        placeholder="Tu nombre"
                                                        {...register("fullName")}
                                                        className="bg-background/50 focus:bg-background"
                                                    />
                                                    {errors.fullName && (
                                                        <p className="text-sm text-red-500">{errors.fullName.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                        Teléfono
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        placeholder="3001234567"
                                                        {...register("phone")}
                                                        className="bg-background/50 focus:bg-background"
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-3 p-4 pt-4 mt-auto border-t bg-muted/5">
                                            <Button type="submit" size="sm" disabled={saving || !isDirty}>
                                                {saving ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Guardar cambios
                                            </Button>
                                        </CardFooter>
                                    </Card>
                            </TabsContent>

                            <TabsContent value="security" className="mt-0 focus-visible:outline-none flex-1 flex flex-col">
                                <Card className="flex-1 flex flex-col">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-base">Seguridad</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col p-4 pt-0">
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 flex-1 content-start">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="flex items-center gap-2">
                                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                                        Nueva contraseña
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            {...register("password")}
                                                            className="bg-background/50 focus:bg-background pr-10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Deja este campo vacío si no deseas cambiar tu contraseña actual.
                                                    </p>
                                                    {errors.password && (
                                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-3 p-4 pt-4 mt-auto border-t bg-muted/5">
                                            <Button type="submit" size="sm" disabled={saving || !isDirty}>
                                                {saving ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Guardar cambios
                                            </Button>
                                        </CardFooter>
                                    </Card>
                            </TabsContent>

                            {/* Botón de guardar fue movido a cada pestaña para coincidir con otras páginas */}
                        </form>
                    </Tabs>
                </div>
            </div>
        </Card>
        </>
    )
}

/**
 * Esqueleto de carga que refleja exactamente el contenido de la página de perfil.
 * Incluye la cabecera con avatar, los tabs y la estructura del formulario.
 * Utiliza el componente Skeleton con la propiedad static para consistencia.
 */
function ProfileSkeleton() {
    return (
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            {/* Header Skeleton - Hidden on Mobile */}
            <div className="hidden md:flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <Skeleton static className="h-4 w-32 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Skeleton static className="h-6 w-24 rounded bg-muted/20" />
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0">
                <div className="w-full flex flex-col gap-2 h-full overflow-y-auto pb-2">
                    {/* Perfil Header Card Skeleton */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton static className="h-14 w-14 rounded-full border-2 border-background bg-muted/20" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                                    <Skeleton static className="h-3 w-32 rounded bg-muted/10" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Skeleton */}
                    <div className="w-full flex-1 flex flex-col">
                        <div className="flex gap-2 max-w-[320px] mb-2 p-1 bg-muted/30 rounded-lg">
                            <Skeleton static className="h-7 flex-1 rounded bg-muted/20" />
                            <Skeleton static className="h-7 flex-1 rounded bg-muted/20" />
                        </div>

                        {/* Form Skeleton */}
                        <Card className="flex-1 flex flex-col">
                            <CardHeader className="p-4 pb-2">
                                <Skeleton static className="h-5 w-32 rounded bg-muted/20" />
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-4 pt-0">
                                <div className="grid gap-4 md:grid-cols-3 flex-1 content-start">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton static className="h-3.5 w-20 rounded bg-muted/10" />
                                            <Skeleton static className="h-9 w-full rounded-md bg-muted/20" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-3 p-4 pt-4 mt-auto border-t bg-muted/5">
                                <Skeleton static className="h-9 w-36 rounded-md bg-muted/20" />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </Card>
    )
}
