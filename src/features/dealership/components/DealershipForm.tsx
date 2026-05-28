import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ZONES, type DealershipFormValues } from "@/shared/schemas/dealership.schema"

interface ConcesionarioFormProps {
    form: UseFormReturn<DealershipFormValues>
    disabled?: boolean
}

/**
 * Formulario para la creación y edición de concesionarios.
 * Gestiona campos básicos como nombre, teléfono, dirección y zona.
 */
export function DealershipForm({ form, disabled }: ConcesionarioFormProps) {
    const { register, formState: { errors }, setValue, watch } = form
    const selectedZone = watch("zone")

    return (
        <div className="flex-1 grid gap-4 md:grid-cols-2 content-start">
            <div className="space-y-2">
                <Label htmlFor="name">
                    Nombre <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                    id="name"
                    placeholder="Concesionario"
                    autoComplete="organization"
                    disabled={disabled}
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">
                    Teléfono <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                    id="phone"
                    placeholder="3001234567"
                    autoComplete="tel"
                    disabled={disabled}
                    {...register("phone")}
                />
                {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                    Dirección completa <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Textarea
                    id="address"
                    placeholder="Calle 123 #45-67, Medellin"
                    rows={2}
                    autoComplete="street-address"
                    disabled={disabled}
                    {...register("address")}
                />
                {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="zone">
                    Zona <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Select
                    name="zone"
                    disabled={disabled}
                    value={selectedZone}
                    onValueChange={(value) => setValue("zone", value)}
                >
                    <SelectTrigger id="zone">
                        <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-muted-foreground">Selecciona una zona</SelectLabel>
                            {ZONES.map((zone) => (
                                <SelectItem key={zone.value} value={zone.value}>
                                    {zone.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {errors.zone && (
                    <p className="text-sm text-red-500">{errors.zone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappPin">PIN de WhatsApp (4 dígitos)</Label>
                <Input
                    id="whatsappPin"
                    placeholder="1234"
                    maxLength={4}
                    disabled={disabled}
                    {...register("whatsappPin")}
                />
                {errors.whatsappPin && (
                    <p className="text-sm text-red-500">{errors.whatsappPin.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground italic">
                    PIN requerido para que los asesores se autentiquen en el bot de WhatsApp.
                </p>
            </div>
        </div>
    )
}
