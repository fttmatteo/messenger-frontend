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

import { cn } from "@/lib/utils"
import logo from "@/assets/logo.png"

const navItems = [
    { title: "Inicio", icon: Home, url: "/messenger" },
    { title: "Entregas", icon: Package, url: "/messenger/entregas" },
    { title: "Perfil", icon: User, url: "/messenger/perfil" },
]

export default function MessengerLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                    <span className="font-semibold">PLAK</span>
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
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.url ||
                            (item.url !== "/messenger" && location.pathname.startsWith(item.url))
                        return (
                            <button
                                key={item.title}
                                onClick={() => navigate(item.url)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
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
