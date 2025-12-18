import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
