import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/shared/components/ui/theme-provider';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { NetworkProvider } from '@/shared/context/NetworkContext';
import { MapsProvider } from '@/shared/context/MapsContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/shared/components/ui/sonner';
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog';
import { LazyMotion, domMax } from 'framer-motion';
import CookieBanner from '@/shared/components/ui/CookieBanner';

/**
 * Componente principal de la aplicación.
 * Configura los proveedores de contexto (Tema, Red, Autenticación, Mapas) y las rutas.
 */
export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" enableSystem attribute="class">
        <NetworkProvider>
          <AuthProvider>
            <MapsProvider>
              <LazyMotion features={domMax} strict>
                <AppRoutes />
              </LazyMotion>
              <Toaster />
              <SessionExpiredDialog />
              <CookieBanner />
            </MapsProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

