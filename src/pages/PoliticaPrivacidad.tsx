import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChevronLeft, Shield, Eye, Scale, HelpCircle, Mail, MapPin, Edit3 } from 'lucide-react';
import { APP_CONFIG } from '@/shared/lib/app-config';

/**
 * Página pública de Política de Privacidad y Protección de Datos Personales.
 * Cumple con los requerimientos de la Ley 1581 de 2012 (Habeas Data) en Colombia
 * y establece las bases legales del procesamiento de datos en el backend de PLAK.
 */
export default function PoliticaPrivacidad() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-safe pb-safe animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                
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
                    <div className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
                        {APP_CONFIG.name} v{APP_CONFIG.version}
                    </div>
                </div>

                {/* Cabecera Principal */}
                <div className="text-center space-y-3 py-4 sm:py-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
                        <Shield className="h-8 w-8 animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                        Política de Privacidad
                    </h1>
                    <p className="text-foreground/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Transparencia, seguridad y control del tratamiento de tus datos bajo los lineamientos de la Ley 1581 de 2012.
                    </p>
                </div>

                {/* Sección 1: Datos Personales Recolectados */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Eye className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">1. Datos Personales que Recolectamos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-4">
                        <p>
                            Para habilitar los servicios logísticos de la plataforma <strong>{APP_CONFIG.name}</strong>, recopilamos y tratamos únicamente la información estrictamente necesaria de nuestros usuarios y operarios:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Shield className="h-4.5 w-4.5" />
                                    <span>Identificación</span>
                                </div>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    Nombres completos, número de documento de identidad (cédula) y rol asignado en la plataforma (Administrador o Transportista) para el control de accesos seguros.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <MapPin className="h-4.5 w-4.5" />
                                    <span>Ubicación GPS</span>
                                </div>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    Coordenadas de geolocalización en tiempo real exclusivamente para los usuarios transportistas durante su jornada y mientras gestionan o ejecutan un servicio activo.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Edit3 className="h-4.5 w-4.5" />
                                    <span>Evidencia digital</span>
                                </div>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    Firmas digitales en pantalla táctil y capturas fotográficas opcionales cargadas por los transportistas como soporte legal para validar la entrega de los servicios.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Finalidad del Tratamiento */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Scale className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">2. Finalidad del Tratamiento</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            De acuerdo con la legislación vigente, los datos personales recolectados en esta aplicación tienen las siguientes finalidades legítimas:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-foreground/80 my-2">
                            <li><strong>Gestión operativa:</strong> Sincronizar, despachar y dar seguimiento en tiempo real a las entregas entre concesionarios y transportistas.</li>
                            <li><strong>Seguridad vial y logística:</strong> Permitir a los administradores visualizar la ubicación en vivo de los transportistas para coordinar rutas eficientes y garantizar el auxilio en carretera de ser necesario.</li>
                            <li><strong>Soporte de auditoría:</strong> Conservar la firma digital y las fotos en la base de datos como comprobantes fehacientes de entrega, disponibles únicamente para los administradores de la plataforma y el concesionario solicitante.</li>
                        </ul>
                        <div className="bg-muted/40 border-l-4 border-primary p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong>Seguridad de Datos:</strong> Toda la información transmitida entre el celular, la aplicación web y nuestros servidores viaja cifrada mediante protocolos de seguridad HTTPS/TLS y se almacena en bases de datos con accesos estrictamente restringidos.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 3: Derechos de los Usuarios (Habeas Data) */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">3. Habeas Data (Ley 1581 de 2012)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            Como titular de los datos personales recolectados y almacenados en la plataforma, y de conformidad con la <strong>Ley 1581 de 2012 (Habeas Data) de Colombia</strong>, tienes derecho a:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-foreground/80 my-2">
                            <li>Conocer, actualizar, rectificar y solicitar la supresión de tus datos personales del sistema en cualquier momento.</li>
                            <li>Solicitar prueba de la autorización de tratamiento otorgada en la plataforma.</li>
                            <li>Ser informado por el administrador, previa solicitud, respecto del uso que se le ha dado a tus datos.</li>
                            <li>Revocar la autorización de tratamiento cuando consideres que no se respetan los principios, derechos y garantías constitucionales.</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Sección 4: Gestión de Solicitudes y Contacto */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Mail className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">4. Canales de Atención a Solicitudes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 leading-relaxed space-y-4">
                        <p>
                            Si deseas ejercer tus derechos de actualización, rectificación o supresión de datos, puedes radicar tu solicitud de forma gratuita directamente:
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/30 p-4 rounded-xl border border-border/30 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg border border-border/40 text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm leading-none mb-0.5">Tratamiento de Datos</p>
                                </div>
                            </div>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto font-bold"
                                onClick={() => window.open('mailto:contacto@plak.digital')}
                            >
                                contacto@plak.digital
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
            </div>
        </div>
    );
}
