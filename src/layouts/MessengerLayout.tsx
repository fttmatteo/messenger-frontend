import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
    Home,
    Package,
    User,
    LogOut,
} from "lucide-react"
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
import logo from "@/assets/logo.png"

const navItems = [
    { title: "Inicio", icon: Home, url: "/messenger" },
    { title: "Entregas", icon: Package, url: "/messenger/entregas" },
    { title: "Perfil", icon: User, url: "/messenger/perfil" },
]

export default function MessengerLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

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
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.url || (item.url !== "/messenger" && location.pathname.startsWith(item.url))}
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
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">@{user?.username}</span>
                        <ModeToggle />
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
