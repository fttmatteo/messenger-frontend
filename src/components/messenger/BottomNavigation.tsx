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
                "flex-none relative bg-background border-t border-border/40"
            )}
            role="navigation"
            aria-label="Navegación principal"
        >
            {/* Content area */}
            <div className="flex items-center justify-around h-[56px] py-1 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    if (item.isCenter) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center rounded-full transition-all duration-200"
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
                                "flex flex-col items-center justify-center gap-1 transition-all duration-200 min-w-[64px]",
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
                                "text-[10px] font-medium leading-none",
                                active && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
            {/* Safe area fill - extends background to physical bottom edge */}
            <div className="h-[env(safe-area-inset-bottom,0px)] bg-background" />
        </nav>
    )
}
