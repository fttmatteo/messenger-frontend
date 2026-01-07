import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useLayoutEffect } from "react"

function ThemeColorSync() {
    const { resolvedTheme } = useTheme()

    useLayoutEffect(() => {
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

        // Force background color checks IMMEDIATELY before paint
        body.style.backgroundColor = color
        html.style.backgroundColor = color

    }, [resolvedTheme])

    return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props} disableTransitionOnChange>
            <ThemeColorSync />
            {children}
        </NextThemesProvider>
    )
}
