import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/shared/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select"

interface TablePaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
    /** Optional label for active filters, e.g. "2 filtros activos" */
    filterLabel?: string
}

/**
 * Reusable pagination component for table/list views.
 * Includes results info, items per page selector, and page navigation.
 */
export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    filterLabel,
}: TablePaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    const hasResults = totalItems > 0

    return (
        <div className="mt-auto pt-2 pb-4 flex items-center justify-between gap-4">
            {/* Left: Results info */}
            <p className="text-xs text-muted-foreground min-w-[200px]">
                {hasResults ? (
                    <>
                        Mostrando <span className="font-medium">{startItem}-{endItem}</span> de{" "}
                        <span className="font-medium">{totalItems}</span> resultado(s)
                        {filterLabel && (
                            <span className="text-primary ml-1">({filterLabel})</span>
                        )}
                    </>
                ) : (
                    "Sin resultados"
                )}
            </p>

            {/* Center: Pagination navigation */}
            {totalPages > 1 && (
                <div className="flex-1 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) onPageChange(currentPage - 1)
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    aria-disabled={currentPage === 1}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onPageChange(pageNum)
                                            }}
                                            isActive={currentPage === pageNum}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) onPageChange(currentPage + 1)
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    aria-disabled={currentPage === totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Right: Items per page selector */}
            {hasResults && (
                <div className="flex items-center gap-2 justify-end min-w-[200px]">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Items por página:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="w-[70px] !h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5" className="text-xs">5</SelectItem>
                            <SelectItem value="10" className="text-xs">10</SelectItem>
                            <SelectItem value="20" className="text-xs">20</SelectItem>
                            <SelectItem value="50" className="text-xs">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
