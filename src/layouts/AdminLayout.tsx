import { Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import {
    Sidebar,
    SidebarContent,
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    LayoutDashboard,
    Users,
    Store,
    Bike,
    LogOut,
    Settings,
    Search,
    Map,
    ArrowLeft,
    ChevronUp,
    Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logo from "@/assets/logo.png"
import { useState, useRef, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"

const menuItems = [
    { title: "Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Empleados", icon: Users, url: "/admin/empleados" },
    { title: "Concesionarios", icon: Store, url: "/admin/concesionarios" },
    { title: "Servicios", icon: Bike, url: "/admin/servicios" },
    { title: "Mapa", icon: Map, url: "/admin/tracking" },
    { title: "Eliminados", icon: Trash2, url: "/admin/eliminados" },
    { title: "Configuración", icon: Settings, url: "/admin/configuracion" },
]

export default function AdminLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get("q") || ""
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showSearchInput, setShowSearchInput] = useState(false)
    const isMobile = useIsMobile()

    // Detect if we're on a nested page (create/edit/details/update or viewing a specific service)
    const isNestedPage = location.pathname.includes('/crear') ||
        location.pathname.includes('/editar') ||
        location.pathname.includes('/detalles') ||
        location.pathname.includes('/actualizar') ||
        /\/servicios\/\d+$/.test(location.pathname)

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
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        const mainElement = mainRef.current
        if (!mainElement) return

        const handleScroll = () => {
            setShowScrollTop(mainElement.scrollTop > 300)
        }

        mainElement.addEventListener('scroll', handleScroll)
        return () => mainElement.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }


    // Desktop Layout with Sidebar
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                            <span className="font-semibold">PLAK</span>
                        </div>
                        <ModeToggle />
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
            </Sidebar>
            <SidebarInset className="overflow-hidden flex flex-col h-screen">
                <header className="flex-shrink-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6 shadow-sm">
                    {isMobile && isNestedPage ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            aria-label="Volver"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    ) : (
                        <SidebarTrigger />
                    )}
                    {isMobile ? (
                        // Mobile header layout
                        <>
                            {showSearchInput ? (
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-9 h-9"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        autoFocus
                                        onBlur={() => !searchQuery && setShowSearchInput(false)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowSearchInput(true)}
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" size="icon" onClick={handleLogout} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        // Desktop header layout
                        <>
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="flex-1" />
                            <Button variant="outline" size="icon" onClick={handleLogout} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </header>
                <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet context={{ searchQuery }} />
                </main>

                {/* Scroll to top button */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="fixed bottom-6 right-6 z-50"
                        >
                            <Button
                                onClick={scrollToTop}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg"
                            >
                                <ChevronUp className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
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
