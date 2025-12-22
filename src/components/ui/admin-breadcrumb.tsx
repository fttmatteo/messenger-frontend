import { Link } from "react-router-dom"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

interface BreadcrumbSegment {
    label: string
    href?: string
}

interface AdminBreadcrumbProps {
    /** Array of breadcrumb segments. Last one is treated as current page (no link). */
    segments: BreadcrumbSegment[]
    /** Custom className for the container */
    className?: string
}

/**
 * A reusable breadcrumb component for admin pages.
 * Automatically includes the home icon linking to /admin.
 */
export function AdminBreadcrumb({ segments, className }: AdminBreadcrumbProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/admin">
                            <Home className="h-4 w-4" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    return (
                        <span key={segment.label} className="contents">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={segment.href || "#"}>{segment.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </span>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
