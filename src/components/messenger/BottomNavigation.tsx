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
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300 border-t border-border/40"
            )}
            role="navigation"
            aria-label="Navegación principal"
        >
            <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-2 pb-1">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    if (item.isCenter) {
                        // Center button for "Crear" - Now inline, no text
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center gap-1 rounded-full text-primary hover:bg-primary/10 transition-all duration-200 -mt-4 bg-background border-4 border-background"
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                                title={item.label}
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg">
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-3 rounded-lg transition-all duration-200 min-w-[60px] relative mt-1",
                                active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <Icon className={cn(
                                "h-6 w-6 transition-transform",
                                active && "scale-100"
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
