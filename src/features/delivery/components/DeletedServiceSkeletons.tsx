import { Skeleton } from "@/shared/components/ui/skeleton"
import { TableRow, TableCell } from "@/shared/components/ui/table"

/**
 * Componente que muestra un esqueleto de carga para una fila de la tabla de servicios eliminados.
 * Proporciona feedback visual mientras se obtienen los datos.
 */
export function DeletedServiceRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Chasis */}
            <TableCell className="py-4">
                <Skeleton static className="h-6 w-[140px] rounded-md bg-muted/20" />
            </TableCell>
            {/* Origen */}
            <TableCell className="max-w-[150px] md:max-w-[200px] truncate py-4">
                <Skeleton static className="h-4 w-[150px] rounded bg-muted/20" />
            </TableCell>
            {/* Destino */}
            <TableCell className="max-w-[150px] md:max-w-[200px] truncate py-4">
                <Skeleton static className="h-4 w-[100px] rounded bg-muted/20" />
            </TableCell>
            {/* Mensajero */}
            <TableCell className="max-w-[150px] md:max-w-[200px] truncate py-4">
                <Skeleton static className="h-4 w-[120px] rounded bg-muted/10" />
            </TableCell>
            {/* Eliminado (Date) */}
            <TableCell className="w-[120px] whitespace-nowrap py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-4 w-4 shrink-0 rounded-md bg-muted/10" />
                    <Skeleton static className="h-4 w-[85px] rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Tiempo restante (Badge) */}
            <TableCell className="w-[140px] py-4">
                <Skeleton static className="h-6 w-[70px] rounded-full bg-muted/20" />
            </TableCell>
            {/* Acción (Buttons) */}
            <TableCell className="w-[120px] text-center py-4">
                <div className="flex items-center justify-center gap-2">
                    <Skeleton static className="h-8 w-8 rounded-md bg-transparent" />
                    <Skeleton static className="h-8 w-8 rounded-md bg-transparent" />
                </div>
            </TableCell>
        </TableRow>
    )
}

