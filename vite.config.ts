import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { visualizer } from "rollup-plugin-visualizer"
import pkg from './package.json'
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'

  const envBase = env.VITE_BASE || ''
  const basePath = envBase
    ? envBase.endsWith('/')
      ? envBase
      : envBase + '/'
    : isProduction
    ? '/'
    : './'

  return {
    base: basePath, 
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [react(), tailwindcss(), VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'screenshots/*.png', 'assets/*.png', 'assets/*.svg'],
      manifest: {
        name: env.VITE_APP_NAME || 'PLAK',
        short_name: 'PLAK',
        description: env.VITE_APP_DESCRIPTION || 'Sistema de gestión de mensajería PLAK',
        theme_color: '#141414',
        background_color: '#141414',
        display: 'standalone',
        start_url: env.VITE_BASE || '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '390x844',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: isDevelopment ? [] : ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/(?!api)/],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }), visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }), cloudflare()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2020',
      sourcemap: !isProduction ? 'inline' : false,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'icons-vendor': ['lucide-react'],
            'ui-primitives': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-hover-card',
            ],
            'ui-layout': [
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-menubar',
              '@radix-ui/react-scroll-area',
            ],
            'ui-inputs': [
              '@radix-ui/react-checkbox',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-switch',
              '@radix-ui/react-slider',
              '@radix-ui/react-label',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
            ],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'charts-vendor': ['recharts'],
            'maps-vendor': ['@react-google-maps/api'],
            'animation-vendor': ['framer-motion'],
          },
        },
      },
    },
    server: isDevelopment ? {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/employees': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/dealerships': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/services': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/tracking': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      }
    } : undefined,
    preview: {
      port: 4173,
    },
  };
})