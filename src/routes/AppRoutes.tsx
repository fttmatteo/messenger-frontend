import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
}

const Login = React.lazy(() => import('@/pages/Login'));
const AdminLayout = React.lazy(() => import('@/layouts/AdminLayout'));
const MessengerLayout = React.lazy(() => import('@/layouts/MessengerLayout'));
const Empleados = React.lazy(() => import('@/pages/admin/Empleados'));
const CreateEmployee = React.lazy(() => import('@/pages/admin/CreateEmployee'));
const EditEmployee = React.lazy(() => import('@/pages/admin/EditEmployee'));
const Concesionarios = React.lazy(() => import('@/pages/admin/Concesionarios'));
const CreateConcesionario = React.lazy(() => import('@/pages/admin/CreateConcesionario'));
const EditConcesionario = React.lazy(() => import('@/pages/admin/EditConcesionario'));
const Servicios = React.lazy(() => import('@/pages/admin/Servicios'));
const ViewServicio = React.lazy(() => import('@/pages/admin/ViewServicio'));
const Eliminados = React.lazy(() => import('@/pages/admin/Eliminados'));
const LiveTracking = React.lazy(() => import('@/pages/admin/LiveTracking'));
const MessengerDetails = React.lazy(() => import('@/pages/admin/MessengerDetails'));
const Configuracion = React.lazy(() => import('@/pages/admin/Configuracion'));
const Profile = React.lazy(() => import('@/pages/admin/Profile'));
const MessengerDashboard = React.lazy(() => import('@/pages/messenger/Dashboard'));
const MessengerCreateServicio = React.lazy(() => import('@/pages/messenger/CreateServicio'));
const MessengerServiceDetails = React.lazy(() => import('@/pages/messenger/ServiceDetails'));
const MessengerUpdateStatus = React.lazy(() => import('@/pages/messenger/UpdateStatus'));
const MessengerServiciosPage = React.lazy(() => import('@/pages/messenger/ServiciosPage'));
const MessengerConfiguracionPage = React.lazy(() => import('@/pages/messenger/ConfiguracionPage'));
const MessengerAppearancePage = React.lazy(() => import('@/pages/messenger/AppearancePage'));
const MobileOnlyGuard = React.lazy(() => import('@/components/guards').then(m => ({ default: m.MobileOnlyGuard })));
const DesktopOnlyGuard = React.lazy(() => import('@/components/guards').then(m => ({ default: m.DesktopOnlyGuard })));

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

/**
 * Componente secundario que redirige al usuario a su panel correspondiente
 * (Administración o Mensajería) basándose en su rol.
 */
function RoleBasedRedirect() {
    const { user } = useAuth();

    const isAdmin = user?.role?.toUpperCase().includes('ADMIN');

    if (isAdmin) {
        return <Navigate to="/admin/servicios" replace />;
    }

    return <Navigate to="/messenger" replace />;
}

/**
 * Definición central de todas las rutas de la aplicación.
 * Organiza las rutas por perfiles (Admin, Messenger), gestiona la carga perezosa
 * de componentes y aplica guardias de protección y tipo de dispositivo.
 */
export function AppRoutes() {
    const { user } = useAuth();
    const isMobile = useIsMobile()

    const renderAdminRoute = () => {
        if (isMobile === undefined) {
            return <PageLoader />;
        }

        const isAdmin = user?.role?.toUpperCase().includes('ADMIN');
        if (!isAdmin) {
            return <Navigate to="/messenger" replace />;
        }

        return isMobile ? <DesktopOnlyGuard /> : <AdminLayout />;
    };

    const renderMessengerRoute = () => {
        if (isMobile === undefined) {
            return <PageLoader />;
        }

        const isAdmin = user?.role?.toUpperCase().includes('ADMIN');
        if (isAdmin && isMobile) {
            return <Navigate to="/admin" replace />;
        }

        return !isMobile ? <MobileOnlyGuard /> : <MessengerLayout />;
    };

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/login" element={<Login />} />


                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <RoleBasedRedirect />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            {renderAdminRoute()}
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/servicios" replace />} />

                    <Route path="empleados" element={<Empleados />} />
                    <Route path="empleados/crear" element={<CreateEmployee />} />
                    <Route path="empleados/editar/:id" element={<EditEmployee />} />


                    <Route path="concesionarios" element={<Concesionarios />} />
                    <Route path="concesionarios/crear" element={<CreateConcesionario />} />
                    <Route path="concesionarios/editar/:id" element={<EditConcesionario />} />

                    <Route path="servicios" element={<Servicios />} />
                    <Route path="servicios/:id" element={<ViewServicio />} />

                    <Route path="eliminados" element={<Eliminados />} />
                    <Route path="tracking" element={<LiveTracking />} />
                    <Route path="tracking/mensajero/:id" element={<MessengerDetails />} />
                    <Route path="configuracion" element={<Configuracion />} />
                    <Route path="perfil" element={<Profile />} />
                </Route>


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

                    <Route path="servicios" element={<MessengerServiciosPage />} />
                    <Route path="configuracion" element={<MessengerConfiguracionPage />} />
                    <Route path="configuracion/apariencia" element={<MessengerAppearancePage />} />
                    <Route path="perfil" element={<Profile />} />
                </Route>


                <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>
        </Suspense>
    );
}

