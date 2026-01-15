import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BottomNavItemProps {
    /** Route path for navigation */
    path: string
    /** Icon component to render */
    icon: React.ComponentType<{ className?: string }>
    /** Label text displayed below icon */
    label: string
}

/**
 * Individual navigation item for the bottom nav bar.
 * Handles active state detection and navigation internally.
 * 
 * Optimized with memo to prevent unnecessary re-renders.
 */
export const BottomNavItem = memo(function BottomNavItem({
    path,
    icon: Icon,
    label
}: BottomNavItemProps) {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine if this item is currently active
    const isActive = path === '/messenger'
        ? location.pathname === '/messenger'
        : location.pathname.startsWith(path)

    const handleClick = () => {
        // Use replace to prevent infinite history buildup
        navigate(path, { replace: true })
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                // Base styles
                "bottom-nav-item",
                "flex flex-col items-center justify-center gap-0.5",
                "min-w-[var(--nav-touch-target)] min-h-[var(--nav-touch-target)]",
                "px-3 rounded-lg",
                "transition-all duration-[var(--nav-transition)]",
                // State styles
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:opacity-70"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
        >
            <Icon
                className={cn(
                    "h-[var(--nav-icon-size)] w-[var(--nav-icon-size)]",
                    "transition-transform duration-[var(--nav-transition)]",
                    isActive && "scale-105"
                )}
                aria-hidden="true"
            />
            <span
                className={cn(
                    "text-[var(--nav-label-size)] leading-none",
                    isActive ? "font-semibold" : "font-medium"
                )}
            >
                {label}
            </span>
        </button>
    )
})
