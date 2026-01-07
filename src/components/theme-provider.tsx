import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect } from "react"

function ThemeColorSync() {
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        const body = document.body
        const html = document.documentElement

        // Define colors matching index.css
        const darkColor = '#141414'
        const lightColor = '#ffffff'

        const color = resolvedTheme === 'dark' ? darkColor : lightColor

        // 1. Update Meta Tag
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color)
        } else {
            // Create if missing
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = color
            document.head.appendChild(meta)
        }

        // 2. Force background color on body/html immediately to prevent white flashes
        // This reinforces the CSS variables but acts as a fail-safe
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
