import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BottomNavActionProps {
    /** Route path for navigation */
    path: string
    /** Icon component to render */
    icon: React.ComponentType<{ className?: string }>
    /** Accessible label for screen readers */
    label: string
}

/**
 * Central floating action button for the bottom nav.
 * Designed for primary actions like "Create".
 * 
 * Features:
 * - Prominent primary color styling
 * - Subtle shadow for depth
 * - Positioned within flow (no negative margins)
 */
export const BottomNavAction = memo(function BottomNavAction({
    path,
    icon: Icon,
    label
}: BottomNavActionProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = location.pathname.startsWith(path)

    const handleClick = () => {
        navigate(path, { replace: true })
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                // Container for proper alignment
                "bottom-nav-action",
                "flex items-center justify-center",
                // Size
                "w-[var(--nav-action-size)] h-[var(--nav-action-size)]",
                // Visual styling
                "rounded-full",
                "bg-primary text-primary-foreground",
                "shadow-md shadow-primary/20",
                // Interaction
                "transition-all duration-[var(--nav-transition)]",
                "hover:shadow-lg hover:shadow-primary/30",
                "active:scale-95",
                // Focus
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            title={label}
        >
            <Icon
                className="h-6 w-6"
                aria-hidden="true"
            />
        </button>
    )
})
