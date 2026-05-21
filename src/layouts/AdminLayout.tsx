import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Users, Store, Bike, LogOut, Settings, Trash2, Map, HelpCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import logoHorizontal from "@/assets/logo-horizontal.png"
import { useState, useRef } from "react"
import { AdminUIProvider } from "@/context/AdminUIContext"
import { openSupportEmail } from "@/lib/app-config"
import { SidebarToggleTab } from "@/components/SidebarToggleTab"

const menuItems = [
    { title: "Transportistas", icon: Users, url: "/admin/empleados" },
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

    const mainRef = useRef<HTMLDivElement>(null)

    return (
        <SidebarProvider className="h-screen w-screen overflow-hidden">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            <Sidebar collapsible="offcanvas" className="h-screen">
                <SidebarHeader className="border-b border-sidebar-border pt-safe">
                    <div className="flex items-center justify-between px-2 py-2">
                        <img src={logoHorizontal} alt="PLAK" className="h-6 w-auto object-contain" />
                        <ModeToggle showLabel={false} />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const isActive = location.pathname === item.url ||
                                        location.pathname.startsWith(item.url)
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
                                onClick={() => navigate("/admin/perfil")}
                                tooltip="Perfil"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span className="text-xs font-medium">Perfil</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => openSupportEmail()}
                                tooltip="Soporte"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <HelpCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Soporte</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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
            <SidebarInset className="overflow-hidden flex flex-col h-screen pt-safe">
                <div id="main-content" ref={mainRef} className={cn("flex-1 flex flex-col pb-safe overscroll-none custom-scrollbar", isTrackingPage ? "p-0 overflow-hidden" : "px-2 pb-0 pt-0 overflow-y-auto")} role="main">
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

/**
 * Layout principal para la interfaz de administración.
 * Proporciona una barra lateral de navegación persistente, gestión de temas y
 * envuelve el contenido en un proveedor de contexto de UI de administración.
 */
export default function AdminLayout() {
    return (
        <AdminUIProvider>
            <AdminLayoutContent />
        </AdminUIProvider>
    )
}
