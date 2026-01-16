import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect, useState } from "react"

// Define explicit theme colors (Design Tokens) at module level for stable reference
// avoiding DOM read latency or race conditions with Sidebar/Overlays.
// Sync with global.css: Dark (hsl 0 0% 8% -> #141414), Light (#ffffff)
const THEME_COLORS = {
    light: '#ffffff',
    dark: '#141414'
} as const

function ThemeColorSync() {
    const { resolvedTheme, theme } = useTheme()
    const [, forceUpdate] = useState(0)

    // Listen for system theme changes when in "system" mode
    // This works for both PWAs and regular web browsers
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const applySystemTheme = (isDark: boolean) => {
            const html = document.documentElement
            // Immediately apply the correct class for instant visual feedback
            if (isDark) {
                html.classList.add('dark')
                html.classList.remove('light')
                html.style.colorScheme = 'dark'
            } else {
                html.classList.remove('dark')
                html.classList.add('light')
                html.style.colorScheme = 'light'
            }
            // Force React to re-render and sync with next-themes
            forceUpdate(prev => prev + 1)
        }

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            applySystemTheme(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    // Fallback for iOS PWAs: re-evaluate theme when app returns to foreground
    // iOS doesn't always fire matchMedia change events in PWA mode
    useEffect(() => {
        if (theme !== 'system') return

        let lastSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const currentSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches

                // Only update if system theme changed while app was in background
                if (currentSystemTheme !== lastSystemTheme) {
                    lastSystemTheme = currentSystemTheme
                    const html = document.documentElement
                    if (currentSystemTheme) {
                        html.classList.add('dark')
                        html.classList.remove('light')
                        html.style.colorScheme = 'dark'
                    } else {
                        html.classList.remove('dark')
                        html.classList.add('light')
                        html.style.colorScheme = 'light'
                    }
                    forceUpdate(prev => prev + 1)
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [theme])


    useEffect(() => {
        const isDark = resolvedTheme === 'dark'
        const themeColor = isDark ? THEME_COLORS.dark : THEME_COLORS.light

        // 1. Update standard theme-color (Android/Desktop)
        const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')
        if (metaThemeColors.length > 0) {
            metaThemeColors.forEach(meta => {
                meta.setAttribute('content', themeColor)
            })
        } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = themeColor
            document.head.appendChild(meta)
        }

        // 2. Update iOS specific status bar style implementation
        // 'black-translucent' gives light text (for dark background)
        // 'default' gives dark text (for light background)
        const metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        const appleStatus = isDark ? 'black-translucent' : 'default'

        if (metaAppleStatus) {
            metaAppleStatus.setAttribute('content', appleStatus)
        } else {
            const meta = document.createElement('meta')
            meta.name = 'apple-mobile-web-app-status-bar-style'
            meta.content = appleStatus
            document.head.appendChild(meta)
        }

        // 3. Ensure HTML element has correct system UI properties
        const html = document.documentElement
        html.style.backgroundColor = themeColor
        html.style.colorScheme = isDark ? 'dark' : 'light'

    }, [resolvedTheme])

    return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeColorSync />
            {children}
        </NextThemesProvider>
    )
}
