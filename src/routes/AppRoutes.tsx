import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import MessengerLayout from '../layouts/MessengerLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import Empleados from '../pages/admin/Empleados';
import CreateEmployee from '../pages/admin/CreateEmployee';
import EditEmployee from '../pages/admin/EditEmployee';
import Concesionarios from '../pages/admin/Concesionarios';
import CreateConcesionario from '../pages/admin/CreateConcesionario';
import EditConcesionario from '../pages/admin/EditConcesionario';
import Servicios from '../pages/admin/Servicios';
import CreateServicio from '../pages/admin/CreateServicio';
import UpdateServiceStatus from '../pages/admin/UpdateServiceStatus';
import ViewServicio from '../pages/admin/ViewServicio';
import Eliminados from '../pages/admin/Eliminados';
import LiveTracking from '../pages/admin/LiveTracking';
import Configuracion from '../pages/admin/Configuracion';
import MessengerDashboard from '../pages/messenger/Dashboard';
import MessengerCreateServicio from '../pages/messenger/CreateServicio';
import MessengerServiceDetails from '../pages/messenger/ServiceDetails';
import MessengerUpdateStatus from '../pages/messenger/UpdateStatus';
import MessengerStatsHistoryPage from '../pages/messenger/StatsHistoryPage';
import MessengerRouteHistoryPage from '../pages/messenger/RouteHistoryPage';
import MessengerStatsPage from '../pages/messenger/StatsPage';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOnlyGuard } from '@/components/MobileOnlyGuard';
import { DesktopOnlyGuard } from '@/components/DesktopOnlyGuard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function RoleBasedRedirect() {
    const { user } = useAuth();

    // Check for admin roles
    const isAdmin = user?.role?.toUpperCase().includes('ADMIN');

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    // Default to messenger for any other role
    return <Navigate to="/messenger" replace />;
}

export function AppRoutes() {
    const isMobile = useIsMobile()

    // Helper to render device-appropriate layout or loading state
    const renderAdminRoute = () => {
        if (isMobile === undefined) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando...</p>
                    </div>
                </div>
            );
        }
        return isMobile ? <DesktopOnlyGuard /> : <AdminLayout />;
    };

    const renderMessengerRoute = () => {
        if (isMobile === undefined) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando...</p>
                    </div>
                </div>
            );
        }
        return !isMobile ? <MobileOnlyGuard /> : <MessengerLayout />;
    };

    return (
        <Routes>
            {/* Public Routes - Login is universal */}
            <Route path="/login" element={<Login />} />

            {/* Role-based redirect */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <RoleBasedRedirect />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes - Desktop Only */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        {renderAdminRoute()}
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                {/* Employee routes */}
                <Route path="empleados" element={<Empleados />} />
                <Route path="empleados/crear" element={<CreateEmployee />} />
                <Route path="empleados/editar/:id" element={<EditEmployee />} />
                {/* Other admin routes */}
                {/* Dealership routes */}
                <Route path="concesionarios" element={<Concesionarios />} />
                <Route path="concesionarios/crear" element={<CreateConcesionario />} />
                <Route path="concesionarios/editar/:id" element={<EditConcesionario />} />
                {/* Services routes */}
                <Route path="servicios" element={<Servicios />} />
                <Route path="servicios/crear" element={<CreateServicio />} />
                <Route path="servicios/actualizar/:id" element={<UpdateServiceStatus />} />
                <Route path="servicios/:id" element={<ViewServicio />} />
                {/* Other routes */}
                <Route path="eliminados" element={<Eliminados />} />
                <Route path="tracking" element={<LiveTracking />} />
                <Route path="configuracion" element={<Configuracion />} />
            </Route>

            {/* Messenger Routes - Mobile Only */}
            <Route
                path="/messenger"
                element={
                    <ProtectedRoute>
                        {renderMessengerRoute()}
                    </ProtectedRoute>
                }
            >
                <Route index element={<MessengerDashboard />} />
                <Route path="crear" element={<MessengerCreateServicio />} />
                <Route path="servicio/:id" element={<MessengerServiceDetails />} />
                <Route path="servicio/:id/actualizar" element={<MessengerUpdateStatus />} />
                <Route path="historial-estadisticas" element={<MessengerStatsHistoryPage />} />
                <Route path="historial-recorrido" element={<MessengerRouteHistoryPage />} />
                <Route path="estadisticas" element={<MessengerStatsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

