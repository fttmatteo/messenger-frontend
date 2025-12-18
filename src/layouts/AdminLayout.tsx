import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Users,
    Store,
    Truck,
    LogOut,
    Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
    { title: "Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Empleados", icon: Users, url: "/admin/empleados" },
    { title: "Concesionarios", icon: Store, url: "/admin/concesionarios" },
    { title: "Mapa", icon: Truck, url: "/admin/tracking" },
    { title: "Configuración", icon: Settings, url: "/admin/configuracion" },
]

// Subset of menu items for mobile bottom nav (max 5 recommended)
const mobileNavItems = [
    { title: "Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Empleados", icon: Users, url: "/admin/empleados" },
    { title: "Mapa", icon: Truck, url: "/admin/tracking" },
    { title: "Config", icon: Settings, url: "/admin/configuracion" },
]

export default function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const isMobile = useIsMobile()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                            F
                        </div>
                        <span className="font-semibold">FOXX</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 pb-20">
                    <Outlet />
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background safe-area-inset-bottom">
                    <div className="flex h-16 items-center justify-around">
                        {mobileNavItems.map((item) => {
                            const isActive = location.pathname === item.url ||
                                (item.url !== "/admin" && location.pathname.startsWith(item.url))
                            return (
                                <button
                                    key={item.title}
                                    onClick={() => navigate(item.url)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-xs font-medium">{item.title}</span>
                                </button>
                            )
                        })}
                    </div>
                </nav>
            </div>
        )
    }

    // Desktop Layout with Sidebar
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center gap-2 px-2 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            F
                        </div>
                        <span className="font-semibold">FOXX</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                        >
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="border-t border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.username}</span>
                                <span className="text-xs text-muted-foreground">{user?.role}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                    <SidebarTrigger />
                    <div className="flex-1" />
                    <ModeToggle />
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
