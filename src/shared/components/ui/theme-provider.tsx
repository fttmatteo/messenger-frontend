import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect, useState } from "react"

const THEME_COLORS = {
    light: '#ffffff',
    dark: '#141414'
} as const

function forceStatusBarUpdate(isDark: boolean) {
    const themeColor = isDark ? THEME_COLORS.dark : THEME_COLORS.light

    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')
    metaThemeColors.forEach(meta => {
        meta.setAttribute('content', themeColor)
    })

    const html = document.documentElement
    html.style.backgroundColor = themeColor
    html.style.colorScheme = isDark ? 'dark' : 'light'
    document.body.style.backgroundColor = themeColor
    document.body.style.colorScheme = isDark ? 'dark' : 'light'

    requestAnimationFrame(() => {
        html.style.transform = 'translateZ(0)'
        requestAnimationFrame(() => {
            html.style.transform = ''
        })
    })
}

import { setPreference, getPreferenceAsync } from "@/shared/utils/preferenceUtils"

function ThemeColorSync() {
    const { resolvedTheme, theme, setTheme } = useTheme()
    const [, forceUpdate] = useState(0)

    useEffect(() => {
        getPreferenceAsync('theme').then((savedTheme) => {
            if (savedTheme && savedTheme !== theme) {
                setTheme(savedTheme)
            }
        })
    }, [])

    useEffect(() => {
        if (theme) {
            setPreference('theme', theme)
        }
    }, [theme])

    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const applySystemTheme = (isDark: boolean) => {
            const html = document.documentElement
            if (isDark) {
                html.classList.add('dark')
                html.classList.remove('light')
                html.style.colorScheme = 'dark'
            } else {
                html.classList.remove('dark')
                html.classList.add('light')
                html.style.colorScheme = 'light'
            }

            forceStatusBarUpdate(isDark)

            forceUpdate(prev => prev + 1)
        }

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            applySystemTheme(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    useEffect(() => {
        if (theme !== 'system') return

        let lastSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const currentSystemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches

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

                    forceStatusBarUpdate(currentSystemTheme)

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

        const html = document.documentElement
        html.style.backgroundColor = themeColor
        html.style.colorScheme = isDark ? 'dark' : 'light'

        document.body.style.backgroundColor = themeColor

        const metaNavButton = document.querySelector('meta[name="msapplication-navbutton-color"]')
        if (metaNavButton) {
            metaNavButton.setAttribute('content', themeColor)
        } else {
            const meta = document.createElement('meta')
            meta.name = 'msapplication-navbutton-color'
            meta.content = themeColor
            document.head.appendChild(meta)
        }

        document.body.style.colorScheme = isDark ? 'dark' : 'light'

    }, [resolvedTheme])

    return null
}

/**
 * Proveedor global de temas que extiende NextThemesProvider.
 * Sincroniza el color de la barra de estado del sistema y otros metadatos con el tema activo.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeColorSync />
            {children}
        </NextThemesProvider>
    )
}
