import { Inbox, History, Plus, Settings } from 'lucide-react'
import { BottomNavItem } from './BottomNavItem'
import { BottomNavAction } from './BottomNavAction'
import './bottom-nav.css'

/**
 * Navigation item configuration
 */
interface NavItemConfig {
    icon: React.ComponentType<{ className?: string }>
    label: string
    path: string
    isAction?: boolean
}

/**
 * Navigation items configuration.
 * Order determines display order from left to right.
 */
const NAV_ITEMS: NavItemConfig[] = [
    { icon: Inbox, label: 'Asignados', path: '/messenger' },
    { icon: History, label: 'Historial', path: '/messenger/servicios' },
    { icon: Plus, label: 'Crear', path: '/messenger/crear', isAction: true },
    { icon: Settings, label: 'Config', path: '/messenger/configuracion' },
]

/**
 * Bottom Navigation Bar Component
 * 
 * A fixed bottom navigation bar with integrated safe area support.
 * The navigation and safe area form a unified visual element with
 * seamless glass effect extending to the device's physical edge.
 * 
 * Features:
 * - 49px content height (Apple HIG standard)
 * - Integrated safe area (not separate)
 * - Glass blur effect with transparency
 * - GPU-accelerated for smooth scrolling
 * - Accessible with proper ARIA attributes
 */
export function BottomNav() {
    return (
        <nav
            className="bottom-nav"
            role="navigation"
            aria-label="Navegación principal"
        >
            <div className="bottom-nav__content">
                {NAV_ITEMS.map((item) => (
                    item.isAction ? (
                        <BottomNavAction
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            label={item.label}
                        />
                    ) : (
                        <BottomNavItem
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            label={item.label}
                        />
                    )
                ))}
            </div>
        </nav>
    )
}
