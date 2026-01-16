import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow, TableCell } from "@/components/ui/table"

export function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Nombre - with icon */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[160px] rounded bg-muted/20" />
            </TableCell>
            {/* Rol - badge */}
            <TableCell className="py-4">
                <Skeleton static className="h-6 w-full max-w-[96px] rounded-full bg-muted/20" />
            </TableCell>
            {/* Documento - mono font */}
            <TableCell className="py-4">
                <Skeleton static className="h-4 w-full max-w-[128px] rounded bg-muted/10" />
            </TableCell>
            {/* Teléfono */}
            <TableCell className="py-4">
                <div className="flex items-center gap-2">
                    <Skeleton static className="h-4 w-4 shrink-0 rounded-full bg-muted/20" />
                    <Skeleton static className="h-4 w-full max-w-[112px] rounded bg-muted/20" />
                </div>
            </TableCell>
        </TableRow>
    )
}

export function CardSkeleton() {
    return (
        <Card className="mb-3 border-border/50 bg-background/40">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                            <Skeleton static className="h-5 w-48 rounded bg-muted/20" />
                            <Skeleton static className="h-5 w-24 rounded-full bg-muted/10" />
                        </div>
                        <div className="space-y-2.5 pt-1">
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-32 rounded bg-muted/20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton static className="h-4 w-4 rounded-full bg-muted/10" />
                                <Skeleton static className="h-4 w-36 rounded bg-muted/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function EmployeeFormSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <Skeleton static className="h-4 w-48 rounded bg-muted/20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton static className="h-8 w-64 rounded-md bg-muted/20" />
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0 border-border/50">
                <CardContent className="pt-6 flex-1 overflow-y-auto">
                    <div className="h-full flex flex-col">
                        <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3 content-start">
                            {/* Document Field */}
                            <div className="space-y-2.5">
                                <Skeleton static className="h-4 w-24 rounded bg-muted/10" />
                                <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2.5">
                                <Skeleton static className="h-4 w-20 rounded bg-muted/10" />
                                <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                            </div>

                            {/* Name Field */}
                            <div className="space-y-2.5 md:col-span-2 lg:col-span-1">
                                <Skeleton static className="h-4 w-32 rounded bg-muted/10" />
                                <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2.5">
                                <Skeleton static className="h-4 w-36 rounded bg-muted/10" />
                                <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                            </div>

                            {/* Role Field */}
                            <div className="space-y-2.5">
                                <Skeleton static className="h-4 w-16 rounded bg-muted/10" />
                                <Skeleton static className="h-10 w-full rounded-md bg-muted/20" />
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="flex flex-wrap gap-4 pt-6 mt-auto border-t border-border/50">
                            <Skeleton static className="h-9 w-24 rounded-md bg-muted/20" />
                            <Skeleton static className="h-9 w-36 rounded-md bg-muted/20" />
                            <Skeleton static className="h-9 w-24 rounded-md bg-muted/20 ml-auto" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
