import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { StatusColorProvider } from './context/StatusColorContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { SessionExpiredDialog } from './components/SessionExpiredDialog';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" enableSystem attribute="class">
        <StatusColorProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
            <SessionExpiredDialog />
          </AuthProvider>
        </StatusColorProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

