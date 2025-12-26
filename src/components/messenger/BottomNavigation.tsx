import { useNavigate, useLocation } from "react-router-dom"
import { Home, List, Plus, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    path: string
    isCenter?: boolean
}

const navItems: NavItem[] = [
    { icon: Home, label: "Inicio", path: "/messenger" },
    { icon: List, label: "Servicios", path: "/messenger/servicios" },
    { icon: Plus, label: "Crear", path: "/messenger/crear", isCenter: true },
    { icon: BarChart3, label: "Stats", path: "/messenger/estadisticas" },
    { icon: Settings, label: "Config", path: "/messenger/configuracion" },
]

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 pb-safe"
            role="navigation"
            aria-label="Navegación principal"
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    if (item.isCenter) {
                        // Center FAB-style button for "Crear"
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="flex items-center justify-center -mt-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-200"
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                            >
                                <Icon className="h-6 w-6" />
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                                active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <Icon className={cn(
                                "h-5 w-5 transition-transform",
                                active && "scale-110"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium",
                                active && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
