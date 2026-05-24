import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/shared/components/ui/theme-provider';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { StatusColorProvider } from '@/shared/context/StatusColorContext';
import { NetworkProvider } from '@/shared/context/NetworkContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/shared/components/ui/sonner';
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog';
import { LazyMotion, domMax } from 'framer-motion';
import CookieBanner from '@/shared/components/ui/CookieBanner';

/**
 * Componente envoltorio que proporciona StatusColorProvider con el ID del usuario actual.
 * Usa la propiedad key para forzar el remontaje cuando userId cambia, asegurando la 
 * inicialización del estado con datos frescos.
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Elementos hijos
 */
function StatusColorWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  return (
    <StatusColorProvider key={userId ?? 'no-user'} userId={userId}>
      {children}
    </StatusColorProvider>
  );
}

/**
 * Componente principal de la aplicación.
 * Configura los proveedores de contexto (Tema, Red, Autenticación, Colores) y las rutas.
 */
export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" enableSystem attribute="class">
        <NetworkProvider>
          <AuthProvider>
            <StatusColorWrapper>
              <LazyMotion features={domMax} strict>
                <AppRoutes />
              </LazyMotion>
              <Toaster />
              <SessionExpiredDialog />
              <CookieBanner />
            </StatusColorWrapper>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

