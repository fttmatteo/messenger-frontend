/**
 * ErrorBoundary - Componente para Captura de Errores
 * 
 * Captura errores de renderizado en componentes hijos y muestra
 * una UI de fallback en lugar de crashear toda la aplicación.
 * 
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props del ErrorBoundary
 */
interface ErrorBoundaryProps {
    /** Componentes hijos a proteger */
    children: ReactNode
    /** UI personalizada de fallback (opcional) */
    fallback?: ReactNode
}

/**
 * Estado interno del ErrorBoundary
 */
interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * ErrorBoundary Component
 * 
 * Captura errores de JavaScript en el árbol de componentes hijo,
 * registra el error y muestra una UI de respaldo.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    /**
     * Actualiza el estado cuando ocurre un error
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    /**
     * Registra información del error para debugging
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error)
        console.error('Component stack:', errorInfo.componentStack)

        // TODO: Enviar a servicio de logging (Sentry, LogRocket, etc.)
    }

    /**
     * Reinicia el estado de error
     */
    handleReset = (): void => {
        this.setState({ hasError: false, error: null })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Si hay fallback personalizado, usarlo
            if (this.props.fallback) {
                return this.props.fallback
            }

            // UI de fallback por defecto
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-10 h-10 text-red-400" />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-white mb-2">
                            Algo salió mal
                        </h2>

                        <p className="text-slate-400 mb-6">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>

                        {/* Mostrar error en desarrollo */}
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-slate-900 p-4 rounded mb-6 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reintentar
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Ir al Inicio
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
