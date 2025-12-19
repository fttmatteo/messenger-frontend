import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { SessionExpiredDialog } from './components/SessionExpiredDialog';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <SessionExpiredDialog />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
