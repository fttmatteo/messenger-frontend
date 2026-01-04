import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatusColorProvider } from './context/StatusColorContext';
import { NetworkProvider } from './context/NetworkContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { SessionExpiredDialog } from './components/SessionExpiredDialog';

// Wrapper component that provides StatusColorProvider with the current user's ID
// Using key prop to force remount when userId changes, ensuring fresh state initialization
function StatusColorWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  return (
    <StatusColorProvider key={userId ?? 'no-user'} userId={userId}>
      {children}
    </StatusColorProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" enableSystem attribute="class">
        <NetworkProvider>
          <AuthProvider>
            <StatusColorWrapper>
              <AppRoutes />
              <Toaster />
              <SessionExpiredDialog />
            </StatusColorWrapper>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

