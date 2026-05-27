import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ChevronLeft, Printer, FileText, UserCheck, Briefcase } from 'lucide-react';
import { APP_CONFIG } from '@/shared/lib/app-config';

/**
 * Plantilla del Acuerdo de Tratamiento de Datos Laborales.
 * Diseñada para ser impresa (`@media print`) y firmada físicamente por 
 * los transportistas al momento de su vinculación con la empresa.
 * Cumple con la Ley 1581 de 2012 y la normativa laboral colombiana.
 */
export default function LaborAgreement() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-safe pb-safe print:bg-white print:text-black">
            {/* Controles (Ocultos en impresión) */}
            <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 print:hidden flex items-center justify-between border-b border-border/40">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 hover:bg-muted/50 rounded-xl transition-all"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Volver</span>
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-xl font-bold"
                    >
                        <Printer className="h-4.5 w-4.5" />
                        <span>Imprimir PDF</span>
                    </Button>
                </div>
            </div>

            {/* Documento Principal */}
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 lg:px-12 print:max-w-none print:p-0 print:m-0 space-y-8">
                
                {/* Cabecera del Documento */}
                <div className="text-center space-y-4 print:space-y-2 border-b-2 border-primary/20 print:border-black pb-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20 print:hidden">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
                        Autorización de Tratamiento de Datos Personales
                    </h1>
                    <h2 className="text-lg font-bold text-foreground/90 font-medium uppercase">
                        (Perfil: Transportista / Operario Logístico)
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground print:text-black">
                        Documento anexo al contrato de vinculación — Ley 1581 de 2012
                    </p>
                </div>

                <Card className="border-none shadow-none bg-transparent print:bg-white">
                    <CardContent className="p-0 text-sm leading-relaxed space-y-6 text-foreground/90 print:text-black">
                        
                        {/* Bloque de Identificación */}
                        <div className="space-y-4">
                            <p className="text-justify">
                                Yo, <span className="inline-block border-b border-foreground/30 print:border-black w-64"></span>, 
                                mayor de edad, identificado(a) con la Cédula de Ciudadanía N° 
                                <span className="inline-block border-b border-foreground/30 print:border-black w-48 ml-2"></span> 
                                expedida en <span className="inline-block border-b border-foreground/30 print:border-black w-48"></span>, 
                                actuando en nombre propio, por medio del presente documento manifiesto que otorgo mi <strong className="font-extrabold text-foreground">CONSENTIMIENTO PREVIO, EXPRESO E INFORMADO</strong> a 
                                <strong className="font-extrabold text-foreground"> MATEO VALENCIA ARDILA (Plataforma {APP_CONFIG.name})</strong>, 
                                en adelante el <strong className="font-extrabold text-foreground">EMPLEADOR/CONTRATANTE</strong>, para que realice el Tratamiento de mis datos personales de acuerdo con las siguientes condiciones:
                            </p>
                        </div>

                        {/* Cláusula 1: Finalidad */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-base flex items-center gap-2 print:text-black">
                                <Briefcase className="h-4 w-4 print:hidden" />
                                1. FINALIDAD DEL TRATAMIENTO
                            </h3>
                            <p className="text-justify">
                                Autorizo expresamente la recolección, almacenamiento, uso, circulación, transmisión y/o transferencia (incluso a nivel internacional) de mis datos personales, los cuales incluyen pero no se limitan a: datos de identificación, datos de contacto, <strong className="font-extrabold text-foreground">datos biométricos (firma en pantalla táctil)</strong> y <strong className="font-extrabold text-foreground">datos de geolocalización (GPS)</strong>. Estos datos serán utilizados para los siguientes fines:
                            </p>
                            <ul className="list-disc pl-8 space-y-2 text-justify">
                                <li>Ejecución, cumplimiento y control del contrato laboral o de prestación de servicios.</li>
                                <li><strong className="font-extrabold text-foreground">Monitoreo y rastreo GPS continuo (en primer y segundo plano)</strong> durante mi jornada laboral a través de la aplicación móvil de la empresa, con el fin de optimizar las rutas de entrega, garantizar la seguridad vial, coordinar operaciones logísticas y generar evidencia auditable de la ejecución del servicio.</li>
                                <li>Captura y almacenamiento de mi firma digital como acuse de recibo de los vehículos asignados.</li>
                                <li>Cumplimiento de obligaciones legales, fiscales y contables por parte del EMPLEADOR/CONTRATANTE.</li>
                            </ul>
                        </div>

                        {/* Cláusula 2: Datos Sensibles (Geolocalización) */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-base flex items-center gap-2 print:text-black">
                                <UserCheck className="h-4 w-4 print:hidden" />
                                2. TRATAMIENTO DE DATOS SENSIBLES
                            </h3>
                            <p className="text-justify">
                                Manifiesto que el EMPLEADOR/CONTRATANTE me ha informado de manera clara y expresa que:
                            </p>
                            <ul className="list-disc pl-8 space-y-2 text-justify">
                                <li>El rastreo continuo de mi ubicación geográfica (GPS) es considerado un dato personal que incide en mi esfera de privacidad.</li>
                                <li>He sido informado(a) que este monitoreo es un <strong className="font-extrabold text-foreground">requisito indispensable</strong> para la ejecución de mis funciones como transportista en la plataforma {APP_CONFIG.name}.</li>
                                <li>El historial de mis rutas será conservado por un período de <strong className="font-extrabold text-foreground">12 meses</strong> para fines de auditoría operativa, tras lo cual será anonimizado de forma irreversible.</li>
                            </ul>
                        </div>

                        {/* Cláusula 3: Derechos del Titular */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-base">3. DERECHOS DEL TITULAR (LEY 1581 DE 2012)</h3>
                            <p className="text-justify">
                                Declaro conocer que, como titular de los datos personales, me asisten los derechos previstos en la Constitución y la Ley (Artículo 8, Ley 1581 de 2012), especialmente el derecho a conocer, actualizar, rectificar y suprimir mi información personal, así como el derecho a revocar el consentimiento otorgado para el tratamiento de datos personales, dirigiendo una solicitud al correo electrónico: <strong className="font-extrabold text-foreground">{APP_CONFIG.supportEmail}</strong>. Comprendo que la revocación de la autorización para el rastreo GPS implicará la imposibilidad técnica de continuar ejecutando mis labores de transporte mediante la plataforma.
                            </p>
                        </div>

                        {/* Declaración Final */}
                        <div className="pt-4 space-y-4">
                            <p className="text-justify font-bold uppercase text-xs border p-4 rounded-xl border-border/40 print:border-black print:rounded-none">
                                DECLARO QUE HE LEÍDO COMPRENDIDO Y ACEPTADO LAS CONDICIONES DEL PRESENTE DOCUMENTO, Y QUE LA INFORMACIÓN PROPORCIONADA POR MÍ ES VERAZ, COMPLETA Y ACTUALIZADA.
                            </p>
                            <p className="text-justify">
                                Para constancia de lo anterior, firmo el presente documento en la ciudad de 
                                <span className="inline-block border-b border-foreground/30 print:border-black w-48 ml-2"></span>, 
                                a los <span className="inline-block border-b border-foreground/30 print:border-black w-12 text-center"></span> días del mes de 
                                <span className="inline-block border-b border-foreground/30 print:border-black w-32 ml-2"></span> del año 
                                <span className="inline-block border-b border-foreground/30 print:border-black w-24 ml-2"></span>.
                            </p>
                        </div>

                        {/* Firmas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 print:pt-16">
                            <div className="space-y-2">
                                <div className="border-b border-foreground print:border-black h-12 w-full max-w-xs"></div>
                                <p className="font-bold text-sm">FIRMA DEL TITULAR (TRABAJADOR)</p>
                                <div className="space-y-1 text-xs">
                                    <p>Nombre: <span className="inline-block border-b border-dotted border-foreground/50 print:border-black w-48"></span></p>
                                    <p>C.C.: <span className="inline-block border-b border-dotted border-foreground/50 print:border-black w-52"></span></p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="border-b border-foreground print:border-black h-12 w-full max-w-xs"></div>
                                <p className="font-bold text-sm">HUELLA DACTILAR</p>
                                <div className="h-24 w-20 border border-foreground/30 print:border-black rounded-lg print:rounded-none mt-2"></div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
            
            {/* Estilos específicos para impresión */}
            <style>{`
                @media print {
                    @page { margin: 2cm; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
