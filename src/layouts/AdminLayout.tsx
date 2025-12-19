import { Outlet, useNavigate, useSearchParams } from "react-router-dom"
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
    LayoutDashboard,
    Users,
    Store,
    Bike,
    LogOut,
    Settings,
    Search,
    Map,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logo from "@/assets/logo.png"

const menuItems = [
    { title: "Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Empleados", icon: Users, url: "/admin/empleados" },
    { title: "Concesionarios", icon: Store, url: "/admin/concesionarios" },
    { title: "Servicios", icon: Bike, url: "/admin/servicios" },
    { title: "Mapa", icon: Map, url: "/admin/tracking" },
    { title: "Configuración", icon: Settings, url: "/admin/configuracion" },
]

export default function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get("q") || ""

    const handleSearchChange = (value: string) => {
        if (value) {
            setSearchParams({ q: value })
        } else {
            setSearchParams({})
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }



    // Desktop Layout with Sidebar
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center gap-2 px-2 py-2">
                        <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                        <span className="font-semibold">PLAK</span>
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
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                    <SidebarTrigger />
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
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">@{user?.username}</span>
                        <ModeToggle />
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet context={{ searchQuery }} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
