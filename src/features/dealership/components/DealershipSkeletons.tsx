import { Skeleton } from "@/shared/components/ui/skeleton"
import { TableRow, TableCell } from "@/shared/components/ui/table"

/**
 * Esqueleto de carga para una fila de la tabla de concesionarios.
 */
export function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Nombre */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
            </TableCell>
            {/* Dirección - truncated */}
            <TableCell className="max-w-xs py-4">
                <Skeleton static className="h-4 w-full max-w-[224px] rounded bg-muted/10" />
            </TableCell>
            {/* Teléfono */}
            <TableCell className="py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-4 w-4 shrink-0 rounded-full bg-muted/20" />
                    <Skeleton static className="h-4 w-full max-w-[112px] rounded bg-muted/20" />
                </div>
            </TableCell>
            {/* Zona - badge */}
            <TableCell className="py-4">
                <Skeleton static className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border w-full max-w-[80px] rounded-full bg-muted/20 m-0" />
            </TableCell>
            {/* Ubicación - badge */}
            <TableCell className="py-4">
                <Skeleton static className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border w-full max-w-[112px] rounded-full bg-muted/20 m-0" />
            </TableCell>
        </TableRow>
    )
}




