import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import { dealershipService } from "@/features/dealership/services/dealership.service"
import type { Dealership } from "@/features/dealership/types/dealership.types"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"

import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Label } from "@/shared/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { getErrorMessage } from "@/shared/lib/error-utils"

const formSchema = z.object({
    dealershipId: z.string().optional(),
    originDealershipId: z.string().optional(),
}).refine((data) => data.dealershipId || data.originDealershipId, {
    message: "Debes seleccionar al menos un nuevo origen o destino",
    path: ["originDealershipId"],
}).refine((data) => data.dealershipId !== data.originDealershipId, {
    message: "El origen y destino no pueden ser el mismo",
    path: ["dealershipId"],
})

type FormValues = z.infer<typeof formSchema>

export interface EditRouteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceDelivery
    onSuccess: () => void
}

export function EditRouteDialog({ open, onOpenChange, service, onSuccess }: EditRouteDialogProps) {
    const { setSuccess, setError } = useAdminUI()
    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loadingData, setLoadingData] = useState(true)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            dealershipId: String(service.dealership.idDealership),
            originDealershipId: String(service.originDealership.idDealership),
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                dealershipId: String(service.dealership.idDealership),
                originDealershipId: String(service.originDealership.idDealership),
            })
        }
    }, [open, form, service])

    const groupedDealerships = useMemo(() => {
        const groups: Record<string, Dealership[]> = {}
        dealerships.forEach(d => {
            const zone = d.zone || 'Sin Zona'
            if (!groups[zone]) {
                groups[zone] = []
            }
            groups[zone].push(d)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [dealerships])

    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;
            try {
                setLoadingData(true)
                const dealershipsData = await dealershipService.getAll()
                setDealerships(dealershipsData)
            } catch (error) {
                setError(getErrorMessage(error))
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [open, setError])

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            const currentDestId = String(service.dealership.idDealership)
            const currentOriginId = String(service.originDealership.idDealership)

            // Solo enviamos los datos si realmente cambiaron
            const payload: { dealershipId?: number, originDealershipId?: number } = {}
            
            if (values.dealershipId && values.dealershipId !== currentDestId) {
                payload.dealershipId = Number(values.dealershipId)
            }
            if (values.originDealershipId && values.originDealershipId !== currentOriginId) {
                payload.originDealershipId = Number(values.originDealershipId)
            }

            if (Object.keys(payload).length === 0) {
                setError("No has modificado ni el origen ni el destino")
                return
            }

            await serviceDeliveryService.editRoute(service.uuid, payload)

            setSuccess("Ruta editada exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-3">
                        <span>Editar ruta</span>
                    </DialogTitle>
                    <DialogDescription>
                        Modifica el concesionario origen o destino. El servicio registrará el cambio de ruta de forma inmutable en el historial
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="originDealershipId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-0 gap-2">
                                        <Label htmlFor="originDealershipId">
                                            Concesionario origen
                                        </Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loadingData}
                                            name="originDealershipId"
                                        >
                                            <FormControl>
                                                <SelectTrigger id="originDealershipId" className="w-full !h-[44px] box-border">
                                                    <SelectValue placeholder="Selecciona origen" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {groupedDealerships.map(([zone, zoneDealerships]) => (
                                                    <SelectGroup key={zone}>
                                                        <SelectLabel className="text-xs font-semibold text-primary bg-muted/50 py-2 px-2">
                                                            {zone}
                                                        </SelectLabel>
                                                        {zoneDealerships.map((dealership) => (
                                                            <SelectItem
                                                                key={dealership.idDealership}
                                                                value={String(dealership.idDealership)}
                                                                className="py-3 pl-4"
                                                            >
                                                                {dealership.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dealershipId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-0 gap-2">
                                        <Label htmlFor="dealershipId">
                                            Concesionario destino
                                        </Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loadingData}
                                            name="dealershipId"
                                        >
                                            <FormControl>
                                                <SelectTrigger id="dealershipId" className="w-full !h-[44px] box-border">
                                                    <SelectValue placeholder="Selecciona destino" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {groupedDealerships.map(([zone, zoneDealerships]) => (
                                                    <SelectGroup key={zone}>
                                                        <SelectLabel className="text-xs font-semibold text-primary bg-muted/50 py-2 px-2">
                                                            {zone}
                                                        </SelectLabel>
                                                        {zoneDealerships.map((dealership) => (
                                                            <SelectItem
                                                                key={dealership.idDealership}
                                                                value={String(dealership.idDealership)}
                                                                className="py-3 pl-4"
                                                            >
                                                                {dealership.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 sm:justify-end bg-muted/5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || loadingData || !form.formState.isDirty}
                                size="sm"
                                className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>Guardar Cambios</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
