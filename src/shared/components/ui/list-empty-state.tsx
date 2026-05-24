import type { ReactNode } from "react"
import { Button } from "@/shared/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/shared/components/ui/empty"
import { Search } from "lucide-react"
import { Plus } from "lucide-react"

interface ListEmptyStateProps {
    /** Whether this empty state is shown due to a search with no results */
    isSearchResult: boolean
    /** The current search query (shown when isSearchResult is true) */
    searchQuery?: string
    /** Icon to show when there is no data (not a search result) */
    emptyIcon: ReactNode
    /** Title when there is no data */
    emptyTitle: string
    /** Description when there is no data */
    emptyDescription: string
    /** Action button configuration (optional) */
    actionButton?: {
        label: string
        onClick: () => void
    }
    /** Custom className for the container */
    className?: string
}

/**
 * A reusable empty state component for list pages.
 * Handles both "no data" and "no search results" scenarios.
 */
export function ListEmptyState({
    isSearchResult,
    searchQuery = "",
    emptyIcon,
    emptyTitle,
    emptyDescription,
    actionButton,
    className = "py-12"
}: ListEmptyStateProps) {
    return (
        <Empty className={className}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {isSearchResult ? <Search /> : emptyIcon}
                </EmptyMedia>
                <EmptyTitle>
                    {isSearchResult ? "Sin resultados" : emptyTitle}
                </EmptyTitle>
                <EmptyDescription>
                    {isSearchResult
                        ? `No se encontraron resultados que coincidan con "${searchQuery}"`
                        : emptyDescription
                    }
                </EmptyDescription>
            </EmptyHeader>
            {!isSearchResult && actionButton && (
                <EmptyContent>
                    <Button onClick={actionButton.onClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {actionButton.label}
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )
}
