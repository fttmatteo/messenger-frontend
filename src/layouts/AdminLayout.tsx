import { Link, Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LayoutDashboard, Users, Store, Bike, LogOut, Settings, Search, Map, ArrowLeft, Trash2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.png"
import { useState, useRef } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { AdminUIProvider } from "@/context/AdminUIContext"
import { useNetwork } from "@/hooks/use-network"

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
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get("q") || ""
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showSearchInput, setShowSearchInput] = useState(false)
    const isMobile = useIsMobile()
    const { isOnline: isNetworkOnline } = useNetwork()

    // Detect if we're on a nested page
    const isNestedPage = location.pathname.includes('/crear') ||
        location.pathname.includes('/editar') ||
        location.pathname.includes('/detalles') ||
        location.pathname.includes('/actualizar') ||
        /\/servicios\/\d+$/.test(location.pathname)

    // Detect if we're on the tracking page (fullscreen map)
    const isTrackingPage = location.pathname === '/admin/tracking'

    const handleSearchChange = (value: string) => {
        if (value) {
            setSearchParams({ q: value })
        } else {
            setSearchParams({})
        }
    }

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }

    const confirmLogout = () => {
        logout()
        navigate("/login")
    }

    const handleBack = () => {
        navigate(-1)
    }

    // Scroll to top functionality
    const mainRef = useRef<HTMLElement>(null)

    return (
        <SidebarProvider>
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            <Sidebar collapsible="none" className="h-screen">
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                            <span className="font-semibold">PLAK</span>
                        </div>
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
                                            size="lg"
                                        >
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
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
            <SidebarInset className="overflow-hidden flex flex-col h-screen">
                {!isTrackingPage && (
                    <header className="flex-shrink-0 z-40 flex h-12 items-center gap-4 border-b bg-background px-4 shadow-sm">
                        {isMobile && isNestedPage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                aria-label="Volver"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        {isMobile ? (
                            // Mobile header layout
                            <>
                                {showSearchInput ? (
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar..."
                                            className="pl-9 h-9 border-none !bg-transparent dark:!bg-transparent shadow-none focus-visible:ring-0 text-sm"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            autoFocus
                                            onBlur={() => !searchQuery && setShowSearchInput(false)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 text-center">
                                            {/* Mobile Error Display could go here if needed, keeping simple for now */}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowSearchInput(true)}
                                            aria-label="Abrir búsqueda"
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                        {/* Subtle network offline indicator */}
                                        {!isNetworkOnline && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs text-amber-700 dark:text-amber-400">Offline</span>
                                            </div>
                                        )}
                                        <ModeToggle />
                                    </>
                                )}
                            </>
                        ) : (
                            // Desktop header layout
                            <>
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-9 h-9 border-none !bg-transparent dark:!bg-transparent shadow-none focus-visible:ring-0 text-sm"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1" />
                                {/* Subtle network offline indicator */}
                                {!isNetworkOnline && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        <span className="text-xs text-amber-700 dark:text-amber-400">Offline</span>
                                    </div>
                                )}
                                <ModeToggle />
                            </>
                        )}
                    </header>
                )}
                <main id="main-content" ref={mainRef} className={cn("flex-1 overflow-x-hidden overflow-y-auto", isTrackingPage ? "p-0" : "p-2")} role="main">
                    <Outlet context={{ searchQuery }} />
                </main>
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
