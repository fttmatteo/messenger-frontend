import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
    ChevronLeft, FileText, Shield, Eye, Scale, HelpCircle, Mail,
    MapPin, Camera, Globe, AlertTriangle, Gavel, RefreshCw, Smartphone, Ban
} from 'lucide-react';
import { APP_CONFIG } from '@/shared/lib/app-config';

/**
 * Página pública de Términos y Condiciones de Uso de PLAK.
 * Documento legal vinculante que establece las reglas de uso de la plataforma,
 * las limitaciones de responsabilidad, la propiedad intelectual (DNDA No. 13-108-139),
 * el consentimiento para tracking GPS, y las cláusulas de protección de datos
 * conforme a la Ley 1581 de 2012 (Habeas Data) de Colombia.
 */
export default function TermsAndConditions() {
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
                        <FileText className="h-8 w-8 animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                        Términos y Condiciones de Uso
                    </h1>
                    <p className="text-foreground/90 font-medium max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Condiciones legales que regulan el acceso y uso de la plataforma <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong>. Al utilizar este servicio, usted acepta íntegramente estos términos.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Última actualización: 25 de mayo de 2026
                    </p>
                </div>

                {/* Sección 1: Objeto y Alcance */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Scale className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">1. Objeto y Alcance del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong> es una plataforma tecnológica de propiedad exclusiva de <strong className="font-extrabold text-foreground">Mateo Valencia Ardila</strong> (en adelante, &ldquo;el Titular&rdquo;), protegida bajo el <strong className="font-extrabold text-foreground">Registro DNDA No. 13-108-139</strong> de la Dirección Nacional de Derecho de Autor de Colombia.
                        </p>
                        <p>
                            La plataforma tiene como finalidad la gestión logística de entregas de motocicletas identificadas por número de chasis, incluyendo:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li>Creación, asignación y seguimiento de servicios de entrega entre concesionarios.</li>
                            <li>Monitoreo satelital en tiempo real de los transportistas durante la ejecución de entregas.</li>
                            <li>Captura de evidencia digital (firmas y fotografías) como soporte de las operaciones de entrega.</li>
                            <li>Optimización de rutas de distribución mediante servicios de geolocalización.</li>
                            <li>Canal de consulta automatizado a través de WhatsApp Business.</li>
                        </ul>
                        <div className="bg-muted/40 border-l-4 border-primary p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Alcance:</strong> Estos términos aplican a todos los usuarios de la plataforma, ya sea a través de su versión web (panel administrativo), la Aplicación Web Progresiva (PWA), la aplicación móvil nativa para Android destinada a los transportistas, o el canal de consulta vía WhatsApp Business.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Aceptación de los Términos */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">2. Aceptación de los Términos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Al acceder, registrarse o utilizar cualquier funcionalidad de <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong>, el usuario declara:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-foreground/90 font-medium">
                            <li>Haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones de Uso.</li>
                            <li>Ser mayor de edad conforme a la legislación colombiana (18 años cumplidos).</li>
                            <li>Actuar en calidad de empleado autorizado de la organización que opera la plataforma, ya sea como <strong className="font-extrabold text-foreground">Administrador</strong> o como <strong className="font-extrabold text-foreground">Transportista</strong>.</li>
                            <li>Aceptar la <strong className="font-extrabold text-foreground">Política de privacidad</strong> y la <strong className="font-extrabold text-foreground">Política de cookies</strong> de la plataforma como parte integral de estos términos.</li>
                        </ol>
                        <div className="bg-muted/40 border-l-4 border-amber-500 p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Importante:</strong> Si usted no está de acuerdo con alguna de las condiciones aquí establecidas, debe abstenerse de usar la plataforma y notificarlo de inmediato a su administrador.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 3: Cuentas y Credenciales */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Eye className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">3. Cuentas de Usuario y Credenciales</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Las cuentas de usuario son creadas exclusivamente por los administradores de la plataforma. A continuación se enumeran los compromisos que adquiere el usuario:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li><strong className="font-extrabold text-foreground">Confidencialidad:</strong> Mantener en estricta reserva sus credenciales de acceso (documento y contraseña). Toda actividad realizada con sus credenciales será de su exclusiva responsabilidad.</li>
                            <li><strong className="font-extrabold text-foreground">Seguridad:</strong> No compartir, prestar o transferir su cuenta a terceros bajo ninguna circunstancia.</li>
                            <li><strong className="font-extrabold text-foreground">Notificación:</strong> Informar de manera inmediata al administrador si sospecha de un acceso no autorizado a su cuenta.</li>
                            <li><strong className="font-extrabold text-foreground">Veracidad:</strong> Proporcionar información veraz y actualizada en su perfil de usuario.</li>
                        </ul>
                        <p>
                            El Titular se reserva el derecho de suspender o eliminar cuentas que violen estos términos sin previo aviso.
                        </p>
                    </CardContent>
                </Card>

                {/* Sección 4: Geolocalización y Tracking GPS */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">4. Consentimiento de Geolocalización y Tracking GPS</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            La plataforma <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong> requiere el acceso a la ubicación geográfica del dispositivo de los usuarios con rol <strong className="font-extrabold text-foreground">Transportista</strong>. Al utilizar la plataforma, el Transportista consiente expresa y voluntariamente que:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-foreground/90 font-medium">
                            <li>Su ubicación GPS será recopilada de forma continua (aproximadamente cada 45 segundos) durante la jornada laboral activa, tanto en primer plano como en segundo plano del dispositivo.</li>
                            <li>Los datos de geolocalización incluyen: <strong className="font-extrabold text-foreground">coordenadas de latitud y longitud</strong>, <strong className="font-extrabold text-foreground">velocidad de desplazamiento</strong>, <strong className="font-extrabold text-foreground">fuente del GPS</strong> (sensor, red o manual) y <strong className="font-extrabold text-foreground">marca temporal</strong>.</li>
                            <li>Esta información se utiliza exclusivamente para:
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    <li>Coordinar y optimizar las rutas de entrega.</li>
                                    <li>Garantizar la seguridad vial del transportista, permitiendo la asistencia en carretera de ser necesario.</li>
                                    <li>Generar un registro auditable del recorrido como soporte de la operación logística.</li>
                                </ul>
                            </li>
                            <li>El historial de ubicaciones se almacena durante un período de <strong className="font-extrabold text-foreground">doce (12) meses</strong> para fines de auditoría y análisis operativo, tras lo cual los datos se anonimizan de forma irreversible.</li>
                        </ol>
                        <div className="bg-muted/40 border-l-4 border-primary p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Base Legal:</strong> El tratamiento de datos de geolocalización se fundamenta en la ejecución de la relación laboral o contractual (Art. 10, Ley 1581 de 2012) y en el interés legítimo del empleador de garantizar la seguridad de sus operarios y la trazabilidad de las entregas.
                        </div>
                        <div className="bg-muted/40 border-l-4 border-amber-500 p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Derecho de revocación:</strong> El transportista podrá revocar su consentimiento en cualquier momento notificándolo por escrito al Titular de la plataforma a través del correo <strong className="font-extrabold text-foreground">{APP_CONFIG.supportEmail}</strong>. La revocación podrá implicar la imposibilidad de continuar utilizando la plataforma como transportista.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 5: Evidencia Digital */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Camera className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">5. Evidencia Digital (Firmas y Fotografías)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Durante la operación de entrega, la plataforma permite y/o requiere la captura de los siguientes elementos probatorios:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Scale className="h-4.5 w-4.5" />
                                    <span>Firma Digital</span>
                                </div>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    La firma capturada en pantalla táctil constituye un <strong className="font-extrabold text-foreground">acuse de recibo</strong> de la entrega del vehículo, conforme a los principios de la Ley 527 de 1999 sobre Comercio Electrónico. <strong className="font-extrabold text-foreground">No constituye un contrato vinculante</strong> ni sustituye la firma manuscrita para efectos legales de mayor alcance.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Camera className="h-4.5 w-4.5" />
                                    <span>Fotografías</span>
                                </div>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    Las fotografías adjuntas como evidencia deben limitarse al registro del estado del vehículo y del entorno de entrega. Queda prohibido capturar deliberadamente rostros de terceros sin su consentimiento. Los metadatos EXIF se eliminan automáticamente por razones de privacidad.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground pt-1">
                            Los archivos de evidencia se almacenan de forma cifrada en infraestructura de nube segura (Google Cloud Storage) y son accesibles exclusivamente por el Titular de la plataforma.
                        </p>
                    </CardContent>
                </Card>

                {/* Sección 6: Uso Aceptable */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Ban className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">6. Uso Aceptable y Prohibiciones</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>El usuario se compromete a utilizar la plataforma de manera ética y conforme a la ley. Queda estrictamente prohibido:</p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li>Intentar acceder a cuentas o datos de otros usuarios sin autorización.</li>
                            <li>Manipular, falsificar o alterar la información de los servicios de entrega, incluyendo estados, coordenadas y evidencia.</li>
                            <li>Utilizar herramientas automatizadas (bots, scrapers) para interactuar con la plataforma sin autorización expresa.</li>
                            <li>Interferir con el funcionamiento normal del sistema, incluyendo ataques de denegación de servicio o ingeniería inversa.</li>
                            <li>Compartir o divulgar información operativa, comercial o técnica de la plataforma a terceros no autorizados.</li>
                            <li>Utilizar la ubicación GPS reportada para fines distintos a los establecidos en la sección 4.</li>
                            <li>Manipular o falsear deliberadamente la ubicación GPS reportada (uso de GPS spoofing o ubicaciones ficticias).</li>
                        </ul>
                        <div className="bg-muted/40 border-l-4 border-red-500 p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Consecuencias:</strong> La violación de estas prohibiciones faculta al Titular para suspender o cancelar inmediatamente el acceso del usuario a la plataforma, sin perjuicio de las acciones legales civiles o penales que correspondan.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 7: Propiedad Intelectual */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Gavel className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">7. Propiedad Intelectual</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Todos los derechos de propiedad intelectual sobre la plataforma <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong>, incluyendo pero sin limitarse a:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li>Código fuente (backend y frontend)</li>
                            <li>Diseño de interfaz, iconografía y elementos visuales</li>
                            <li>Arquitectura de software y modelos de datos</li>
                            <li>Algoritmos de optimización de rutas</li>
                            <li>Documentación técnica y funcional</li>
                            <li>Nombre comercial y logotipos de PLAK</li>
                        </ul>
                        <p>
                            son propiedad exclusiva de <strong className="font-extrabold text-foreground">Mateo Valencia Ardila</strong>, protegidos bajo el <strong className="font-extrabold text-foreground">Registro DNDA No. 13-108-139</strong> de la Dirección Nacional de Derecho de Autor de Colombia, la Ley 23 de 1982 (Derechos de Autor) y la Decisión Andina 351 de 1993.
                        </p>
                        <div className="bg-muted/40 border-l-4 border-red-500 p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Queda prohibido:</strong> Copiar, reproducir, modificar, descompilar, realizar ingeniería inversa, distribuir o crear obras derivadas de cualquier componente de la plataforma sin autorización escrita y expresa del Titular.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 8: Protección de Datos Personales */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">8. Protección de Datos Personales</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-4">
                        <p>
                            El tratamiento de sus datos personales, información de ubicación (GPS), y evidencia digital se rige por los lineamientos establecidos en nuestra Política de Privacidad, en estricto cumplimiento de la <strong className="font-extrabold text-foreground">Ley 1581 de 2012 (Habeas Data)</strong> y normativas concordantes aplicables en Colombia.
                        </p>
                        <div className="bg-muted/40 border-l-4 border-primary p-4 rounded-r-xl">
                            <p className="text-foreground/90 font-medium mb-2">
                                Para conocer en detalle:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90 font-medium mb-3">
                                <li>Qué datos recolectamos y con qué finalidad.</li>
                                <li>Tiempos de retención y protocolos de seguridad (cifrado).</li>
                                <li>Cómo ejercer sus derechos de acceso, rectificación y supresión.</li>
                            </ul>
                            <p>
                                Le invitamos a consultar directamente nuestra{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/politica-privacidad')}
                                    className="text-primary underline font-bold hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                                >
                                    Política de Privacidad
                                </button>.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 9: Transferencia Internacional de Datos */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Globe className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">9. Transferencia Internacional de Datos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Para la prestación del servicio, ciertos datos personales pueden ser transferidos a proveedores de infraestructura tecnológica ubicados fuera de Colombia, conforme al artículo 26 de la Ley 1581 de 2012:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-foreground/90 font-medium">
                            <li>
                                <strong className="font-extrabold text-foreground">Google Cloud Platform (EE.UU.):</strong> Fotos, firmas, coordenadas.
                                <br /><span className="text-xs text-muted-foreground">Garantía: Cláusulas contractuales tipo (SCC) — <a href="https://cloud.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Política de Privacidad</a></span>
                            </li>
                            <li>
                                <strong className="font-extrabold text-foreground">Meta / WhatsApp (EE.UU. / Irlanda):</strong> Números de teléfono, mensajes.
                                <br /><span className="text-xs text-muted-foreground">Garantía: Términos de Meta Business — <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Política de Privacidad</a></span>
                            </li>
                            <li>
                                <strong className="font-extrabold text-foreground">Cloudflare (EE.UU.):</strong> Dirección IP, metadatos de seguridad.
                                <br /><span className="text-xs text-muted-foreground">Garantía: Cláusulas contractuales tipo (SCC) — <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Política de Privacidad</a></span>
                            </li>
                        </ul>
                        <div className="bg-muted/40 border-l-4 border-primary p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Consentimiento:</strong> Al aceptar estos Términos, el usuario autoriza expresamente la transferencia internacional de sus datos a los proveedores indicados, exclusivamente para las finalidades descritas. Dichos proveedores operan bajo estándares de seguridad equivalentes o superiores a los exigidos por la legislación colombiana.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 10: Canal WhatsApp */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">10. Canal de WhatsApp Business</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            La plataforma ofrece un canal de consulta automatizado a través de WhatsApp Business, sujeto a las siguientes condiciones:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li>El acceso al canal requiere la autenticación mediante un <strong className="font-extrabold text-foreground">PIN de 4 dígitos</strong> proporcionado y gestionado exclusivamente por el concesionario correspondiente.</li>
                            <li>La custodia y confidencialidad del PIN es responsabilidad exclusiva del concesionario que lo administra.</li>
                            <li>La información consultada a través de este canal se limita a estados de chasis y entregas pendientes asociadas al concesionario del PIN.</li>
                            <li>El acceso al bot se bloquea automáticamente durante 15 minutos tras 3 intentos fallidos consecutivos de autenticación.</li>
                            <li>Las sesiones de WhatsApp expiran automáticamente tras 12 horas de inactividad.</li>
                        </ul>
                        <p className="text-xs text-muted-foreground">
                            El uso del canal de WhatsApp implica la aceptación de los <a href="https://www.whatsapp.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Términos de Servicio de WhatsApp</a> y la <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Política de Privacidad de Meta</a>.
                        </p>
                    </CardContent>
                </Card>

                {/* Sección 11: Limitación de Responsabilidad */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">11. Limitación de Responsabilidad</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            En la máxima medida permitida por la legislación colombiana, el Titular <strong className="font-extrabold text-foreground">no será responsable</strong> por:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li><strong className="font-extrabold text-foreground">Interrupciones del servicio</strong> derivadas de mantenimiento programado, actualizaciones, fallos en servicios de terceros (Google Cloud, Meta, Cloudflare) o eventos de fuerza mayor.</li>
                            <li><strong className="font-extrabold text-foreground">Pérdida de datos</strong> ocasionada por el uso indebido de la plataforma, la eliminación intencional de información por parte de un administrador autorizado, o la falta de conectividad a internet del usuario.</li>
                            <li><strong className="font-extrabold text-foreground">Daños indirectos, consecuenciales o lucro cesante</strong> que pudieran derivarse del uso o la imposibilidad de uso de la plataforma.</li>
                            <li><strong className="font-extrabold text-foreground">Inexactitud de la geolocalización</strong> cuando las condiciones del dispositivo, la cobertura GPS o el entorno físico (túneles, edificios, zonas rurales) afecten la precisión de las coordenadas reportadas.</li>
                            <li><strong className="font-extrabold text-foreground">Acciones de los transportistas</strong> en vía pública, accidentes de tránsito o cualquier evento ocurrido durante la ejecución de una entrega. La plataforma es una herramienta de gestión y no sustituye la responsabilidad individual del conductor.</li>
                            <li><strong className="font-extrabold text-foreground">Acceso no autorizado</strong> al canal de WhatsApp derivado de la negligencia del concesionario en la custodia de su PIN de acceso.</li>
                        </ul>
                        <div className="bg-muted/40 border-l-4 border-amber-500 p-3.5 rounded-r-xl my-2 text-foreground/90 font-medium text-xs">
                            <strong className="font-extrabold text-foreground">Disponibilidad:</strong> La plataforma se proporciona &ldquo;tal como está&rdquo; (<em>as is</em>) y &ldquo;según disponibilidad&rdquo; (<em>as available</em>), sin garantías explícitas ni implícitas de funcionamiento ininterrumpido, libre de errores o adecuado para un fin particular.
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 12: Modificaciones */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <RefreshCw className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">12. Modificaciones a los Términos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            El Titular se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento. Las modificaciones serán comunicadas a los usuarios a través de:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li>Actualización de la fecha de &ldquo;Última actualización&rdquo; visible en la parte superior de este documento.</li>
                            <li>Notificación dentro de la plataforma cuando los cambios sean sustanciales.</li>
                        </ul>
                        <p>
                            El uso continuado de la plataforma después de la publicación de las modificaciones constituirá la aceptación tácita de los nuevos términos.
                        </p>
                    </CardContent>
                </Card>

                {/* Sección 13: Ley Aplicable y Jurisdicción */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Gavel className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">13. Ley Aplicable y Resolución de Disputas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-3">
                        <p>
                            Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la <strong className="font-extrabold text-foreground">República de Colombia</strong>, incluyendo pero sin limitarse a:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-foreground/90 font-medium">
                            <li><strong className="font-extrabold text-foreground">Ley 1581 de 2012</strong> — Protección de Datos Personales (Habeas Data)</li>
                            <li><strong className="font-extrabold text-foreground">Ley 527 de 1999</strong> — Comercio Electrónico y Firmas Digitales</li>
                            <li><strong className="font-extrabold text-foreground">Ley 23 de 1982</strong> — Derechos de Autor</li>
                            <li><strong className="font-extrabold text-foreground">Decisión Andina 351 de 1993</strong> — Régimen Común sobre Derecho de Autor</li>
                            <li><strong className="font-extrabold text-foreground">Código Sustantivo del Trabajo</strong> — En lo aplicable a la relación laboral</li>
                        </ul>
                        <p>
                            Cualquier controversia derivada de estos términos será sometida a los <strong className="font-extrabold text-foreground">jueces y tribunales competentes de la ciudad de domicilio del Titular en Colombia</strong>, salvo que las partes acuerden un mecanismo alternativo de resolución de conflictos (mediación o arbitraje).
                        </p>
                    </CardContent>
                </Card>

                {/* Sección 14: Contacto */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">14. Contacto y Atención al Usuario</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/90 font-medium leading-relaxed space-y-4">
                        <p>
                            Para consultas, reclamos o el ejercicio de cualquier derecho contemplado en estos términos, puede contactarnos a través de:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/30 p-4 rounded-xl border border-border/30 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg border border-border/40 text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm leading-none mb-0.5">Soporte Legal y Técnico</p>
                                </div>
                            </div>
                            <Button
                                variant="default"
                                size="sm"
                                className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto font-bold"
                                onClick={() => window.open(`mailto:${APP_CONFIG.supportEmail}`)}
                            >
                                {APP_CONFIG.supportEmail}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
