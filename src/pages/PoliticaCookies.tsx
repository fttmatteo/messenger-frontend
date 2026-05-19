import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Cookie, Shield, Eye, HelpCircle, Mail } from 'lucide-react';
import { APP_CONFIG } from '@/lib/app-config';

interface StorageItem {
    key: string;
    type: string;
    purpose: string;
    data: string;
    duration: string;
}

const STORAGE_ITEMS: StorageItem[] = [
    {
        key: 'accessToken',
        type: 'Cookie / Storage',
        purpose: 'Seguridad y control de acceso cifrado a la cuenta.',
        data: 'Identificador único de sesión segura del usuario.',
        duration: '15 minutos / 8 horas'
    },
    {
        key: 'refreshToken',
        type: 'Cookie / Storage',
        purpose: 'Renovación automática de credenciales sin interrumpir tu flujo.',
        data: 'Token de refresco seguro.',
        duration: '8 horas'
    },
    {
        key: 'sidebar_state',
        type: 'Cookie HTTP',
        purpose: 'Personalización. Recuerda si expandiste el menú lateral.',
        data: 'Estado de la interfaz (true / false).',
        duration: '7 días'
    },
    {
        key: 'theme',
        type: 'localStorage',
        purpose: 'Personalización. Almacena tu preferencia visual (Claro/Oscuro).',
        data: 'Tema seleccionado (light / dark / system).',
        duration: 'Permanente'
    },
    {
        key: 'status-colors-[id]',
        type: 'localStorage',
        purpose: 'Caché de Interfaz. Caché local de la paleta de colores global del sistema configurada por la administración para identificar visualmente cada estado de servicio de forma unificada en toda la plataforma.',
        data: 'Mapa JSON de la paleta de colores global del sistema para los estados de servicio (Asignado, Pendiente, Entregado, etc.).',
        duration: 'Permanente'
    },
    {
        key: 'tracking_offline_queue',
        type: 'localStorage',
        purpose: 'Soporte Offline. Cola temporal de ubicaciones GPS capturadas sin señal de red para retransmisión automática.',
        data: 'Buffer JSON de geolocalización (latitud, longitud, velocidad, marca de tiempo).',
        duration: 'Temporal (hasta sincronizar)'
    },
    {
        key: 'messenger_services',
        type: 'IndexedDB',
        purpose: 'Soporte Offline. Caché de la lista de servicios asignados para permitir su visualización sin cobertura.',
        data: 'Estructura completa de servicios (direcciones, contactos y tareas).',
        duration: 'Máximo 24 horas'
    },
    {
        key: 'pending_offline_actions',
        type: 'IndexedDB',
        purpose: 'Soporte Offline. Cola de operaciones de actualización de servicios encoladas sin internet.',
        data: 'Datos de entregas pendientes (firmas digitales, fotos de soporte, coordenadas).',
        duration: 'Temporal (hasta sincronizar)'
    },
    {
        key: 'user',
        type: 'Preferences / Storage',
        purpose: 'Gestión de perfil en UI y soporte de operaciones offline.',
        data: 'Nombre, rol, documento y concesionario asignado.',
        duration: 'Sesión / Permanente'
    },
    {
        key: 'role',
        type: 'Preferences / Storage',
        purpose: 'Protección de rutas de acceso seguro en el cliente (Admin vs Mensajero).',
        data: 'Rol del usuario activo (ADMIN / MESSENGER).',
        duration: 'Sesión / Permanente'
    },
    {
        key: 'plak_cookie_consent',
        type: 'Capacitor Prefs',
        purpose: 'Evitar que vuelva a aparecer el aviso informativo de cookies.',
        data: 'Bandera de aceptación (accepted).',
        duration: 'Permanente'
    }
];

/**
 * Página pública de Política de Cookies y Almacenamiento Local.
 * Cumple con los requerimientos de transparencia de la Ley 1581 de 2012
 * y las directrices de la Superintendencia de Industria y Comercio (SIC) de Colombia.
 */
export default function PoliticaCookies() {
    const navigate = useNavigate();

    const handleBack = () => {
        // Si hay historial en el navegador, volvemos atrás; si no, redirigimos al login
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/login', { replace: true });
        }
    };

    // Obtener clase de color para cada tipo de almacenamiento en el badge móvil
    const getBadgeStyle = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('cookie')) {
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        }
        if (lowerType.includes('indexeddb')) {
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        }
        if (lowerType.includes('prefs') || lowerType.includes('preferences')) {
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        }
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'; // LocalStorage
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Botón de Retorno */}
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <Button 
                        variant="ghost" 
                        onClick={handleBack} 
                        className="flex items-center gap-2 hover:bg-muted/50 rounded-xl transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Volver</span>
                    </Button>
                    <div className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        {APP_CONFIG.name} v{APP_CONFIG.version}
                    </div>
                </div>

                {/* Cabecera Principal */}
                <div className="text-center space-y-3 py-4 sm:py-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
                        <Cookie className="h-8 w-8 animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                        Política de Cookies y Almacenamiento Local
                    </h1>
                    <p className="text-foreground/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Transparencia y cumplimiento de la Ley 1581 de 2012 respecto al almacenamiento de datos en tu navegador o terminal.
                    </p>
                </div>

                {/* Sección 1: Aclaración Técnica y Legal */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">1. Aclaración Técnica y Legal</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            En el desarrollo web y móvil moderno, muchas de las funciones tradicionalmente atribuidas a las <strong>cookies</strong> (pequeños archivos de texto) se realizan mediante otras APIs del navegador que, <strong>desde el punto de vista legal, se consideran equivalentes</strong>.
                        </p>
                        <p>
                            Estas tecnologías de almacenamiento local en el terminal incluyen <strong>`localStorage`</strong>, <strong>`sessionStorage`</strong> y las preferencias nativas del dispositivo <strong>`@capacitor/preferences`</strong>.
                        </p>
                        <div className="bg-muted/40 border-l-4 border-primary p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium">
                            <strong>Nota Importante:</strong> El 100% de las tecnologías utilizadas en <strong>{APP_CONFIG.name}</strong> son de carácter técnico y funcional (estrictamente necesarias). No utilizamos cookies publicitarias, comerciales, ni de seguimiento de terceros.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Tabla de Declaración de Cookies */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Eye className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">2. Declaración Técnica de Almacenamiento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            A continuación, se detallan los elementos específicos que la plataforma almacena de forma local en tu terminal de acuerdo con la circular de la <strong>Superintendencia de Industria y Comercio (SIC)</strong>:
                        </p>
                        
                        {/* VISTA ESCRITORIO (Table Layout) */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40 shadow-inner">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-muted/70 text-foreground font-semibold border-b border-border/40">
                                        <th className="p-3">Llave / Clave</th>
                                        <th className="p-3">Tipo / Método</th>
                                        <th className="p-3">Finalidad Principal</th>
                                        <th className="p-3">Datos que Contiene</th>
                                        <th className="p-3">Duración</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20 text-foreground/80">
                                    {STORAGE_ITEMS.map((item) => (
                                        <tr key={item.key} className="hover:bg-muted/10 transition-colors">
                                            <td className="p-3 font-semibold text-foreground font-mono">{item.key}</td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getBadgeStyle(item.type)}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs sm:text-sm">{item.purpose}</td>
                                            <td className="p-3 text-xs sm:text-sm">{item.data}</td>
                                            <td className="p-3 text-xs sm:text-sm shrink-0 whitespace-nowrap">{item.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VISTA MÓVIL (Card List Layout) */}
                        <div className="block md:hidden space-y-3">
                            {STORAGE_ITEMS.map((item) => (
                                <div key={item.key} className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-3">
                                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border/10 pb-2">
                                        <span className="font-bold text-foreground text-sm font-mono break-all">
                                            {item.key}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${getBadgeStyle(item.type)}`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-foreground/80 leading-relaxed">
                                            <strong className="text-foreground/90 font-medium">Propósito:</strong> {item.purpose}
                                        </p>
                                        <p className="text-xs text-foreground/85 leading-relaxed">
                                            <strong className="text-foreground/90 font-medium">Valores:</strong> {item.data}
                                        </p>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-border/10">
                                        <span className="text-[10px] text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded">
                                            Duración: {item.duration}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 3: Derechos de los Usuarios y Contacto */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">3. Derechos y Configuración</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            Al ser de naturaleza estrictamente técnica, la desactivación de estas tecnologías podría comprometer gravemente el funcionamiento de la aplicación, inhabilitando el inicio de sesión y la visualización de rutas.
                        </p>
                        <p>
                            No obstante, de conformidad con la <strong>Ley 1581 de 2012</strong>, tienes derecho a conocer, actualizar y rectificar tus datos personales almacenados en el sistema en cualquier momento.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/30 p-4 rounded-xl border border-border/30 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg border border-border/40 text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm leading-none mb-0.5">Soporte Técnico y Privacidad</p>
                                    <p className="text-[11px] text-foreground/70">Desarrollado por Mateo Valencia Ardila</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto"
                                onClick={() => window.open('mailto:soporte@plak.digital')}
                            >
                                soporte@plak.digital
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
            </div>
        </div>
    );
}
