import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect, useState } from "react"

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
        // 1. Selector for standard theme-color (Get ALL to handle potential duplicates)
        const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')
        // 2. Selector for iOS status bar style
        const metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

        const html = document.documentElement

        // Professional way to get the computed background color without hardcoding
        // We Use a temporary element to resolve the CSS variable 'var(--background)'
        const tempDiv = document.createElement('div')
        tempDiv.style.visibility = 'hidden'
        tempDiv.style.position = 'absolute'
        tempDiv.style.backgroundColor = 'var(--background)'
        document.body.appendChild(tempDiv)

        const computedColor = getComputedStyle(tempDiv).backgroundColor
        document.body.removeChild(tempDiv)

        const isDark = resolvedTheme === 'dark'

        // Update ALL theme-color tags
        if (metaThemeColors.length > 0) {
            metaThemeColors.forEach(meta => {
                meta.setAttribute('content', computedColor)
            })
        } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = computedColor
            document.head.appendChild(meta)
        }

        // Update iOS specific status bar style
        // 'black-translucent' ensures white icons in dark mode
        // 'default' ensures dark icons in light mode
        if (metaAppleStatus) {
            metaAppleStatus.setAttribute('content', isDark ? 'black-translucent' : 'default')
        } else {
            const meta = document.createElement('meta')
            meta.name = 'apple-mobile-web-app-status-bar-style'
            meta.content = isDark ? 'black-translucent' : 'default'
            document.head.appendChild(meta)
        }

        // Ensure html element has the correct color scheme for system UI
        html.style.backgroundColor = computedColor
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
