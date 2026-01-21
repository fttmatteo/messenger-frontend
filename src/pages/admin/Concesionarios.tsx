import { useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { useDealerships } from "@/hooks/use-dealerships"
import { useAdminUI } from "@/context/AdminUIContext"
import { listItemVariants } from "@/lib/animation-variants"
import { SortIndicator } from "@/components/ui/sort-indicator"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TableRowSkeleton } from "@/components/dealership/DealershipSkeletons"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TablePagination } from "@/components/ui/table-pagination"
import { Map } from "@/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { Plus, MapPin, Smartphone, PhoneCall, Copy, MapPinned, Store, Globe, Navigation, X, ExternalLink } from "lucide-react"

/**
 * Componente que renderiza un marcador personalizado en el mapa para la ubicación de un concesionario.
 * Utiliza AdvancedMarkerElement de la API de Google Maps.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {google.maps.LatLngLiteral} props.position - Coordenadas de latitud y longitud.
 */
function DealershipMarker({ position }: { position: google.maps.LatLngLiteral }) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title: "Ubicación del concesionario",
            content: new google.maps.marker.PinElement({
                background: '#10b981',
                borderColor: 'white',
                glyphColor: 'white',
            }).element
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, position])

    return null
}

/**
 * Componente que muestra la dirección física a partir de coordenadas GPS
 * utilizando el servicio de geocodificación inversa de Google Maps.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {number} props.lat - Latitud.
 * @param {number} props.lng - Longitud.
 */
function AddressDisplay({ lat, lng }: { lat: number, lng: number }) {
    const [address, setAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const fetchAddress = async () => {
            setLoading(true)
            try {
                if (!window.google?.maps?.Geocoder) {
                    if (isMounted) {
                        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`) // Fallback
                        setLoading(false)
                    }
                    return
                }

                const geocoder = new google.maps.Geocoder()
                const response = await geocoder.geocode({ location: { lat, lng } })

                if (isMounted) {
                    if (response.results?.[0]) {
                        setAddress(response.results[0].formatted_address)
                    } else {
                        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                    }
                    setLoading(false)
                }
            } catch (err) {
                console.error('Reverse geocode error:', err)
                if (isMounted) {
                    setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                    setLoading(false)
                }
            }
        }

        fetchAddress()

        return () => { isMounted = false }
    }, [lat, lng])

    if (loading) return <Skeleton static className="h-4 w-48" />

    return (
        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
            <MapPinned className="h-3 w-3" />
            {address}
        </span>
    )
}

/**
 * Página principal de administración de concesionarios.
 * Permite visualizar la lista de concesionarios, filtrar por zona,
 * buscar por nombre o dirección, y acceder a la creación/edición.
 * También permite previsualizar la ubicación geográfica en un mapa emergente.
 */
export default function Concesionarios() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const { setSuccess } = useAdminUI()
    const [locationPopup, setLocationPopup] = useState<{ name: string; lat: number; lng: number } | null>(null)

    const {
        loading,
        filteredAndSortedDealerships,
        paginatedDealerships,
        uniqueZones,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort,
        zoneFilter,
        setZoneFilter,
    } = useDealerships({ searchQuery })

    const filterLabel = zoneFilter !== "all" ? `zona: ${zoneFilter}` : undefined

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Concesionarios" }]} />
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Concesionarios</h1>
                    <ToggleGroup
                        type="single"
                        value={zoneFilter}
                        onValueChange={(value) => setZoneFilter(value || "all")}
                        className="justify-start shrink-0"
                    >
                        <ToggleGroupItem value="all" aria-label="Todos" className="h-8 px-2 text-xs">Todos</ToggleGroupItem>
                        {uniqueZones.map((zone) => (
                            <ToggleGroupItem key={zone} value={zone} aria-label={zone} className="h-8 px-2 text-xs">{zone}</ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {zoneFilter !== "all" && (
                        <Button variant="ghost" size="sm" onClick={() => setZoneFilter("all")} className="h-8 text-xs shrink-0">
                            <X className="h-3 w-3 mr-1" />Limpiar
                        </Button>
                    )}
                </div>

                <div className="flex-1 flex justify-end">
                    <Button onClick={() => navigate("/admin/concesionarios/crear")} size="sm" className="shrink-0 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Nuevo concesionario
                    </Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0 !overflow-hidden">
                <CardContent className="flex-1 flex flex-col min-h-0 !overflow-hidden">
                    {loading ? (
                        <div className="flex-1 overflow-auto min-h-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Dirección</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Zona</TableHead>
                                        <TableHead>GPS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                                </TableBody>
                            </Table>
                        </div>
                    ) : filteredAndSortedDealerships.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <ListEmptyState
                                isSearchResult={!!searchQuery}
                                searchQuery={searchQuery}
                                emptyIcon={<Store />}
                                emptyTitle="Sin concesionarios"
                                emptyDescription="Aún no hay concesionarios registrados en el sistema"
                                className="py-0"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto min-h-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("name")}>
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4" />Nombre
                                                    <SortIndicator field="name" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2"><MapPinned className="h-4 w-4" />Dirección</div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Teléfono</div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("zone")}>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />Zona
                                                    <SortIndicator field="zone" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-4 w-4" />GPS
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {paginatedDealerships.map((dealership, index) => (
                                                <motion.tr
                                                    key={dealership.idDealership}
                                                    variants={listItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                                >
                                                    <TableCell className="font-medium text-sm">{dealership.name}</TableCell>
                                                    <TableCell className="max-w-xs text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default">
                                                                    {dealership.address.includes(',')
                                                                        ? dealership.address.split(',')[0]
                                                                        : dealership.address}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-sm">
                                                                <p>
                                                                    {dealership.address.includes(',')
                                                                        ? dealership.address.substring(dealership.address.indexOf(',') + 1).trim()
                                                                        : dealership.address}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${dealership.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-1 w-fit">
                                                                    <PhoneCall className="h-3 w-3" />{dealership.phone}
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Llamar</p></TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs px-2 py-0.5">{dealership.zone}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setLocationPopup({
                                                                        name: dealership.name,
                                                                        lat: dealership.latitude!,
                                                                        lng: dealership.longitude!
                                                                    })
                                                                }}
                                                            >
                                                                <MapPin className="h-3 w-3 mr-1" />Ubicación
                                                            </Badge>
                                                        ) : dealership.isGeolocated ? (
                                                            <Badge variant="default" className="bg-green-500"><MapPin className="h-3 w-3 mr-1" />Ubicado</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Sin ubicación</Badge>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredAndSortedDealerships.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} filterLabel={filterLabel} />
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!locationPopup} onOpenChange={(open) => !open && setLocationPopup(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-500" />
                            {locationPopup?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="h-64 rounded-lg overflow-hidden border">
                            {locationPopup && (
                                <Map center={{ lat: locationPopup.lat, lng: locationPopup.lng }} zoom={16}>
                                    <DealershipMarker position={{ lat: locationPopup.lat, lng: locationPopup.lng }} />
                                </Map>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            {locationPopup && (
                                <AddressDisplay lat={locationPopup.lat} lng={locationPopup.lng} />
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (locationPopup) {
                                            const coords = `${locationPopup.lat}, ${locationPopup.lng}`
                                            navigator.clipboard.writeText(coords)
                                            setSuccess("Coordenadas copiadas")
                                        }
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        if (locationPopup) {
                                            window.open(
                                                `https://www.google.com/maps?q=${locationPopup.lat},${locationPopup.lng}`,
                                                '_blank'
                                            )
                                        }
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Google Maps
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}
