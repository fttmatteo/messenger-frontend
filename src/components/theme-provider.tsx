import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect, useState } from "react"

function ThemeColorSync() {
    const { resolvedTheme, theme, setTheme } = useTheme()
    const [, forceUpdate] = useState(0)

    // Listen for system theme changes when in "system" mode
    // This is needed for PWAs installed on desktop which don't always receive theme change events
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = () => {
            // Force a re-render to pick up the new system theme
            forceUpdate(prev => prev + 1)
            // Temporarily switch away and back to system to force next-themes to re-evaluate
            setTheme('light')
            setTimeout(() => setTheme('system'), 10)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme, setTheme])

    // Fallback for iOS PWAs: re-evaluate theme when app returns to foreground
    // iOS doesn't always fire matchMedia change events in PWA mode
    useEffect(() => {
        if (theme !== 'system') return

        let lastSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const currentSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

                // Only update if system theme changed while app was in background
                if (currentSystemTheme !== lastSystemTheme) {
                    lastSystemTheme = currentSystemTheme
                    forceUpdate(prev => prev + 1)
                    setTheme('light')
                    setTimeout(() => setTheme('system'), 10)
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [theme, setTheme])

    useEffect(() => {
        // 1. Selector for standard theme-color (Get ALL to handle potential duplicates)
        const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')
        // 2. Selector for iOS status bar style
        const metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

        const body = document.body
        const html = document.documentElement

        // Define colors matching index.css
        const darkColor = '#141414'
        const lightColor = '#ffffff'

        const isDark = resolvedTheme === 'dark'
        const color = isDark ? darkColor : lightColor

        // Update ALL theme-color tags
        if (metaThemeColors.length > 0) {
            metaThemeColors.forEach(meta => {
                meta.setAttribute('content', color)
            })
        } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = color
            document.head.appendChild(meta)
        }

        // Update iOS specific status bar style
        if (metaAppleStatus) {
            metaAppleStatus.setAttribute('content', isDark ? 'black-translucent' : 'default')
        } else {
            const meta = document.createElement('meta')
            meta.name = 'apple-mobile-web-app-status-bar-style'
            meta.content = isDark ? 'black-translucent' : 'default'
            document.head.appendChild(meta)
        }

        // Force background color checks
        body.style.backgroundColor = color
        html.style.backgroundColor = color

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
