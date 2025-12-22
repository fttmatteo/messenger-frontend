import { useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { dealershipService } from "@/services/dealership.service"
import { useDealerships } from "@/hooks/useDealerships"
import { useIsMobile } from "@/hooks/use-mobile"
import { useScrollToTop } from "@/hooks/useScrollToTop"
import { listItemVariants, fadeScaleVariants } from "@/lib/animation-variants"
import { SortIndicator } from "@/components/ui/sort-indicator"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TableRowSkeleton, CardSkeleton } from "@/components/dealership/DealershipSkeletons"
import { DealershipCard } from "@/components/dealership/DealershipCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TablePagination } from "@/components/ui/table-pagination"
import { Plus, MapPin, Smartphone, PhoneCall, Copy, MapPinned, Store, Globe, Navigation, ChevronUp, X } from "lucide-react"
import { toast } from "sonner"


export default function Concesionarios() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const isMobile = useIsMobile()
    const [geocoding, setGeocoding] = useState<number | null>(null)

    // Use custom hooks
    const { showScrollTop, scrollToTop } = useScrollToTop({ enabled: isMobile })
    const {
        dealerships,
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
        fetchDealerships,
    } = useDealerships({ searchQuery })

    const handleGeocode = async (id: number) => {
        try {
            setGeocoding(id)
            await dealershipService.geocode(id)
            toast.success("Concesionario geocodificado correctamente")
            fetchDealerships()
        } catch (error: any) {
            toast.error("Error al geocodificar", {
                description: error.message,
                id: "error-geocodificar"
            })
        } finally {
            setGeocoding(null)
        }
    }

    const filterLabel = zoneFilter !== "all" ? `zona: ${zoneFilter}` : undefined

    return (
        <div className="space-y-4 md:space-y-6">
            <AdminBreadcrumb segments={[{ label: "Concesionarios" }]} />

            {/* Header with inline filters on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">Concesionarios</h1>

                    {!isMobile && (
                        <div className="flex items-center gap-3">
                            <ToggleGroup
                                type="single"
                                value={zoneFilter}
                                onValueChange={(value) => setZoneFilter(value || "all")}
                                className="justify-start"
                            >
                                <ToggleGroupItem value="all" aria-label="Todos">Todos</ToggleGroupItem>
                                {uniqueZones.map((zone) => (
                                    <ToggleGroupItem key={zone} value={zone} aria-label={zone}>{zone}</ToggleGroupItem>
                                ))}
                            </ToggleGroup>

                            {zoneFilter !== "all" && (
                                <Button variant="ghost" size="sm" onClick={() => setZoneFilter("all")} className="h-9">
                                    <X className="h-4 w-4 mr-2" />Limpiar filtro
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Button onClick={() => navigate("/admin/concesionarios/crear")} size={isMobile ? "lg" : "default"} className="shrink-0">
                        <Plus className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
                        {!isMobile && "Nuevo concesionario"}
                    </Button>
                </div>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    <div className="mb-3 space-y-2">
                        <Select value={zoneFilter} onValueChange={(value) => setZoneFilter(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por zona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las zonas</SelectItem>
                                {uniqueZones.map((zone) => (
                                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {zoneFilter !== "all" && (
                            <Button variant="ghost" size="sm" onClick={() => setZoneFilter("all")} className="w-full">
                                <X className="h-4 w-4 mr-2" />Limpiar filtro
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedDealerships.length} de {dealerships.length} concesionario(s)
                        {searchQuery && ` - "${searchQuery}"`}
                        {zoneFilter !== "all" && ` (zona: ${zoneFilter})`}
                    </p>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    ) : filteredAndSortedDealerships.length === 0 ? (
                        <ListEmptyState
                            isSearchResult={!!searchQuery}
                            searchQuery={searchQuery}
                            emptyIcon={<Store />}
                            emptyTitle="Sin concesionarios"
                            emptyDescription="Aún no hay concesionarios registrados en el sistema"
                            actionButton={{ label: "Crear primer concesionario", onClick: () => navigate("/admin/concesionarios/crear") }}
                        />
                    ) : (
                        <motion.div>
                            <AnimatePresence mode="popLayout">
                                {paginatedDealerships.map((dealership) => (
                                    <div key={dealership.idDealership} className="cursor-pointer" onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}>
                                        <DealershipCard dealership={dealership} onEdit={() => { }} onDelete={() => { }} onGeocode={handleGeocode} deleting={null} geocoding={geocoding} hideActions={true} />
                                    </div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredAndSortedDealerships.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} filterLabel={filterLabel} />
                </div>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex flex-col gap-1">
                            <CardTitle>Lista de concesionarios</CardTitle>
                            <CardDescription>
                                {filteredAndSortedDealerships.length} de {dealerships.length} concesionario(s)
                                {searchQuery && ` - Buscando "${searchQuery}"`}
                                {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Dirección</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Zona</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                                </TableBody>
                            </Table>
                        ) : filteredAndSortedDealerships.length === 0 ? (
                            <ListEmptyState
                                isSearchResult={!!searchQuery}
                                searchQuery={searchQuery}
                                emptyIcon={<Store />}
                                emptyTitle="Sin concesionarios"
                                emptyDescription="Aún no hay concesionarios registrados en el sistema"
                                actionButton={{ label: "Crear primer concesionario", onClick: () => navigate("/admin/concesionarios/crear") }}
                            />
                        ) : (
                            <>
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
                                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("isGeolocated")}>
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-4 w-4" />Ubicación
                                                    <SortIndicator field="isGeolocated" currentSortField={sortField} sortDirection={sortDirection} />
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
                                                    <TableCell className="font-medium text-base">{dealership.name}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-base">{dealership.address}</TableCell>
                                                    <TableCell className="text-base">
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
                                                        <Badge variant="outline" className="text-base px-2 py-0.5">{dealership.zone}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge variant="default" className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
                                                                        onClick={() => {
                                                                            const coords = `${dealership.latitude}, ${dealership.longitude}`
                                                                            navigator.clipboard.writeText(coords)
                                                                            toast.success("Coordenadas copiadas", { description: coords })
                                                                        }}>
                                                                        <MapPin className="h-3 w-3 mr-1" />Ubicado
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="flex items-center gap-2">
                                                                    <Copy className="h-3 w-3" />{dealership.latitude}, {dealership.longitude}
                                                                </TooltipContent>
                                                            </Tooltip>
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
                                <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredAndSortedDealerships.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} filterLabel={filterLabel} />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Scroll to top button (mobile only) */}
            <AnimatePresence>
                {isMobile && showScrollTop && (
                    <motion.div variants={fadeScaleVariants} initial="hidden" animate="visible" exit="exit" className="fixed bottom-20 right-4 z-50">
                        <Button onClick={scrollToTop} size="icon" className="h-12 w-12 rounded-full shadow-lg">
                            <ChevronUp className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
