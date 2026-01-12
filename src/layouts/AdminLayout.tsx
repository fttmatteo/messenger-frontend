import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LayoutDashboard, Users, Store, Bike, LogOut, Settings, Trash2, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.png"
import { useState, useRef } from "react"
import { AdminUIProvider } from "@/context/AdminUIContext"
import { SidebarToggleTab } from "@/components/SidebarToggleTab"

const menuItems = [
    { title: "Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Empleados", icon: Users, url: "/admin/empleados" },
    { title: "Concesionarios", icon: Store, url: "/admin/concesionarios" },
    { title: "Servicios", icon: Bike, url: "/admin/servicios" },
    { title: "Monitoreo", icon: Map, url: "/admin/tracking" },
    { title: "Eliminados", icon: Trash2, url: "/admin/eliminados" },
    { title: "Configuración", icon: Settings, url: "/admin/configuracion" },
]

function AdminLayoutContent() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }

    const confirmLogout = () => {
        logout()
        navigate("/login")
    }

    const isTrackingPage = location.pathname === '/admin/tracking'

    const handleBack = () => {
        navigate(-1)
    }

    // Scroll to top functionality
    const mainRef = useRef<HTMLDivElement>(null)

    return (
        <SidebarProvider className="h-screen w-screen overflow-hidden">
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            <Sidebar collapsible="offcanvas" className="h-screen">
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                        </div>
                        <ModeToggle showLabel={false} />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const isActive = location.pathname === item.url ||
                                        (item.url !== '/admin' && location.pathname.startsWith(item.url))
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                size="lg"
                                                isActive={isActive}
                                                onClick={() => navigate(item.url)}
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="pb-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                tooltip="Cerrar sesión"
                                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-xs font-medium">Cerrar sesión</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarToggleTab />
            <SidebarInset className="overflow-hidden flex flex-col h-screen">
                <div id="main-content" ref={mainRef} className={cn("flex-1 flex flex-col", isTrackingPage ? "p-0 overflow-hidden" : "p-2 overflow-y-auto")} role="main">
                    <Outlet context={{ searchQuery: "", handleBack }} />
                </div>
            </SidebarInset>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas cerrar sesión?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLogout} className="bg-red-500 text-white hover:bg-red-600">
                            Salir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    )
}

export default function AdminLayout() {
    return (
        <AdminUIProvider>
            <AdminLayoutContent />
        </AdminUIProvider>
    )
}
