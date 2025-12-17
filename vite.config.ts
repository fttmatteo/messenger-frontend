/**
 * Configuración de Vite
 * 
 * Este archivo configura el bundler Vite para el proyecto:
 * - Plugin de React para JSX/TSX
 * - Plugin de Tailwind CSS v4
 * - Plugin PWA para Progressive Web App
 * - Alias de paths (@/ -> src/)
 * - Proxy para desarrollo (redirige peticiones al backend)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener __dirname en módulos ES (ESM no tiene __dirname nativo)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // Configuración PWA
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'E-PLACA - Sistema de Entregas',
                short_name: 'E-PLACA',
                description: 'Sistema de gestión de entregas y tracking en tiempo real',
                theme_color: '#1e293b',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                // Estrategias de caché para recursos
                runtimeCaching: [
                    {
                        // Caché para imágenes
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
                            }
                        }
                    },
                    {
                        // Caché para fuentes
                        urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
                            }
                        }
                    },
                    {
                        // Network first para API calls
                        urlPattern: /^https?:\/\/.*\/api\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 5 // 5 minutos
                            },
                            networkTimeoutSeconds: 10
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true // Habilitar PWA en desarrollo para testing
            }
        })
    ],
    resolve: {
        // Alias para imports más limpios
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        // Proxy para redirigir peticiones al backend durante desarrollo
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:8080',
                ws: true,
            },
        },
    },
})
