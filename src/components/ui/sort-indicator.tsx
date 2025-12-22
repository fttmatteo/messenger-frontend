import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface SortIndicatorProps<T extends string | null> {
    field: T
    currentSortField: T
    sortDirection: "asc" | "desc"
    className?: string
}

/**
 * A reusable sort indicator component for table headers.
 * Shows up/down arrow based on current sort state, or neutral arrow when not sorted by this field.
 */
export function SortIndicator<T extends string | null>({
    field,
    currentSortField,
    sortDirection,
    className = "h-4 w-4 ml-1"
}: SortIndicatorProps<T>) {
    if (currentSortField !== field) {
        return <ArrowUpDown className={`${className} opacity-50`} />
    }
    return sortDirection === "asc"
        ? <ArrowUp className={className} />
        : <ArrowDown className={className} />
}
