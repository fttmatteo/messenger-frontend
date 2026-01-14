import { useNavigate, useLocation } from "react-router-dom"
import { Inbox, History, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    path: string
    isCenter?: boolean
}

const navItems: NavItem[] = [
    { icon: Inbox, label: "Asignados", path: "/messenger" },
    { icon: History, label: "Historial", path: "/messenger/servicios" },
    { icon: Plus, label: "Crear", path: "/messenger/crear", isCenter: true },
    { icon: Settings, label: "Config", path: "/messenger/configuracion" },
]

/**
 * Bottom Navigation Component
 * 
 * Structure:
 * - flex-none: Takes only the space it needs in the parent flex container
 * - Content area: Fixed 56px height (Apple/Google standard)
 * - Safe area fill: Dynamic height based on device (env safe-area-inset-bottom)
 * 
 * This ensures:
 * 1. Navigation is always at the bottom of the screen
 * 2. No black bars appear below it
 * 3. Works universally on all iOS/Android devices
 */
export function BottomNavigation() {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === "/messenger") {
            return location.pathname === "/messenger"
        }
        return location.pathname.startsWith(path)
    }

    return (
        <nav
            className="flex-none flex flex-col bg-background border-t border-border/40 pb-[env(safe-area-inset-bottom,0px)]"
            role="navigation"
            aria-label="Navegación principal"
        >
            {/* Navigation content - Fixed 56px height */}
            <div className="h-14 flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    if (item.isCenter) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="flex items-center justify-center"
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md active:scale-95 transition-transform">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1",
                                active
                                    ? "text-primary"
                                    : "text-muted-foreground active:text-foreground"
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <Icon className={cn(
                                "h-5 w-5",
                                active && "scale-110"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium leading-none",
                                active && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
