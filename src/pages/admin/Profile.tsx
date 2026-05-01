import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, User, ShieldCheck, Smartphone, FileText, KeyRound } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { profileService, type ProfileUpdateRequest } from "@/services/profile.service"
import { showToast } from "@/config/toast-config"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

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
    const [fullProfile, setFullProfile] = useState<{ document: string | number; role: string } | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
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
                fullName: data.fullName,
                phone: data.phone,
            }
            if (data.password) {
                updateData.password = data.password
            }

            const updated = await profileService.updateMe(updateData)
            
            updateUser({ name: updated.fullName })
            
            showToast.success("Perfil actualizado correctamente")
            
            reset({ ...data, password: "" })
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
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            {/* Header Section - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Mi Perfil" }]} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Mi Perfil</h1>
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 px-4">
                <div className="w-full space-y-3">
                    {/* Perfil Header Card */}
                    <Card>
                        <CardContent className="py-3 px-6">
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
                                Información Personal
                            </TabsTrigger>
                            <TabsTrigger value="security" className="text-xs py-1 data-[state=active]:bg-background">
                                Seguridad
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
                                <Card>
                                        <CardHeader className="py-3 px-6">
                                            <CardTitle className="text-base">Datos Personales</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 px-6 pb-4">
                                            <div className="grid gap-4 md:grid-cols-3">
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
                                    </Card>
                            </TabsContent>

                            <TabsContent value="security" className="mt-0 focus-visible:outline-none">
                                <Card>
                                        <CardHeader className="py-3 px-6">
                                            <CardTitle className="text-base">Seguridad</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 px-6 pb-4">
                                            <div className="max-w-md space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="flex items-center gap-2">
                                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                                        Nueva contraseña
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...register("password")}
                                                        className="bg-background/50 focus:bg-background"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Deja este campo vacío si no deseas cambiar tu contraseña actual.
                                                    </p>
                                                    {errors.password && (
                                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                            </TabsContent>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={saving} size="sm" className="min-w-[140px]">
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar cambios
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

/**
 * Esqueleto de carga que refleja exactamente el contenido de la página de perfil.
 * Incluye la cabecera con avatar, los tabs y la estructura del formulario.
 * Utiliza el componente Skeleton con la propiedad static para consistencia.
 */
function ProfileSkeleton() {
    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            {/* Header Skeleton - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-between min-h-[48px] mb-2 gap-4 px-4">
                <div className="flex-1">
                    <Skeleton static className="h-4 w-32 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Skeleton static className="h-8 w-48 rounded bg-muted/20" />
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 px-4">
                <div className="w-full space-y-3">
                    {/* Perfil Header Card Skeleton */}
                    <Card>
                        <CardContent className="py-3 px-6">
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
                    <div className="w-full">
                        <div className="flex gap-2 max-w-[320px] mb-2 p-1 bg-muted/30 rounded-lg">
                            <Skeleton static className="h-7 flex-1 rounded bg-muted/20" />
                            <Skeleton static className="h-7 flex-1 rounded bg-muted/20" />
                        </div>

                        {/* Form Skeleton */}
                        <Card>
                            <CardHeader className="py-3 px-6">
                                <Skeleton static className="h-5 w-32 rounded bg-muted/20" />
                            </CardHeader>
                            <CardContent className="space-y-4 px-6 pb-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton static className="h-3.5 w-20 rounded bg-muted/10" />
                                            <Skeleton static className="h-9 w-full rounded-md bg-muted/20" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Skeleton static className="h-8 w-32 rounded-md bg-muted/20" />
                    </div>
                </div>
            </div>
        </div>
    )
}
