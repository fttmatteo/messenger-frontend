import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function Concesionarios() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [geocoding, setGeocoding] = useState<number | null>(null)

    // Filter dealerships based on search query
    const filteredDealerships = dealerships.filter((dealership) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
            String(dealership.idDealership).includes(query) ||
            dealership.name.toLowerCase().includes(query) ||
            dealership.address.toLowerCase().includes(query) ||
            dealership.phone.includes(query) ||
            dealership.zone.toLowerCase().includes(query)
        )
    })

    const fetchDealerships = async () => {
        try {
            setLoading(true)
            const data = await dealershipService.getAll()
            setDealerships(data)
        } catch (error: any) {
            toast.error("Error al cargar concesionarios", {
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDealerships()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            setDeleting(id)
            await dealershipService.delete(id)
            toast.success("Concesionario eliminado correctamente")
            fetchDealerships()
        } catch (error: any) {
            toast.error("Error al eliminar concesionario", {
                description: error.message,
            })
        } finally {
            setDeleting(null)
        }
    }

    const handleGeocode = async (id: number) => {
        try {
            setGeocoding(id)
            await dealershipService.geocode(id)
            toast.success("Concesionario geocodificado correctamente")
            fetchDealerships()
        } catch (error: any) {
            toast.error("Error al geocodificar", {
                description: error.message,
            })
        } finally {
            setGeocoding(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Concesionarios</h1>
                </div>
                <Button onClick={() => navigate("/admin/concesionarios/crear")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Concesionario
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Concesionarios</CardTitle>
                    <CardDescription>
                        {filteredDealerships.length} de {dealerships.length} concesionario(s)
                        {searchQuery && ` - Buscando "${searchQuery}"`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredDealerships.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No se encontraron concesionarios con esa búsqueda." : "No hay concesionarios registrados."}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Zona</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDealerships.map((dealership) => (
                                    <TableRow key={dealership.idDealership}>
                                        <TableCell className="font-medium">
                                            {dealership.name}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {dealership.address}
                                        </TableCell>
                                        <TableCell>{dealership.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{dealership.zone}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {dealership.isGeolocated ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    Ubicado
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Sin ubicación
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {!dealership.isGeolocated && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleGeocode(dealership.idDealership)}
                                                        disabled={geocoding === dealership.idDealership}
                                                    >
                                                        {geocoding === dealership.idDealership ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MapPin className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                ¿Eliminar concesionario?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará permanentemente <strong>{dealership.name}</strong> del sistema.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(dealership.idDealership)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                disabled={deleting === dealership.idDealership}
                                                            >
                                                                {deleting === dealership.idDealership ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : null}
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
