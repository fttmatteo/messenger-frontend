import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { MapPin, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { APP_CONFIG } from '@/shared/lib/app-config';
import { logger } from '@/shared/utils/logger';

const GPS_CONSENT_KEY = 'plak_gps_consent';

import { setPreference, getPreferenceAsync } from '@/shared/utils/preferenceUtils';

/**
 * Modal bloqueante de consentimiento de geolocalización GPS para transportistas.
 * Cumple con la Ley 1581 de 2012 (Habeas Data) y el principio de consentimiento
 * informado para el tratamiento de datos de geolocalización sensibles.
 *
 * Se muestra una sola vez al primer acceso del transportista. El consentimiento
 * se persiste en localStorage y Capacitor Preferences para cobertura web + nativa.
 *
 * Si el usuario rechaza, se cierra su sesión ya que el GPS es requisito operativo.
 */
export default function GpsConsentDialog({ onDecline }: { onDecline: () => void }) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkConsent = async () => {
            try {
                const val = await getPreferenceAsync(GPS_CONSENT_KEY);
                if (val && val.startsWith('accepted')) {
                    return;
                }
                setShow(true);
            } catch (e) {
                logger.error('Error verificando consentimiento GPS:', e);
                setShow(true);
            }
        };

        const timer = setTimeout(() => checkConsent(), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleAccept = useCallback(async () => {
        setShow(false);

        const timestamp = new Date().toISOString();
        const consentValue = `accepted|${timestamp}`;

        try {
            await setPreference(GPS_CONSENT_KEY, consentValue);
            try { localStorage.setItem(`${GPS_CONSENT_KEY}_timestamp`, timestamp); } catch { /* ignore */ }
        } catch (e) {
            logger.warn('No se pudo guardar GPS consent:', e);
        }
    }, []);

    const handleDecline = useCallback(() => {
        setShow(false);
        onDecline();
    }, [onDecline]);

    if (!show) return null;

    return (
        <AlertDialog open={show} onOpenChange={() => { /* No permitir cerrar sin acción */ }}>
            <AlertDialogContent className="max-w-[92vw] sm:max-w-lg max-h-[90dvh] flex flex-col rounded-2xl bg-background border-border/50 shadow-2xl p-0 overflow-hidden">

                {/* Cabecera con icono */}
                <div className="bg-primary/5 border-b border-border/30 px-6 pt-6 pb-4 shrink-0">
                    <AlertDialogHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shrink-0">
                                <MapPin className="h-5.5 w-5.5" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-base font-bold tracking-tight">
                                    Consentimiento de Geolocalización
                                </AlertDialogTitle>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                                    Ley 1581 de 2012 — Art. 9
                                </p>
                            </div>
                        </div>
                    </AlertDialogHeader>
                </div>

                {/* Cuerpo */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
                    <AlertDialogDescription className="text-sm text-foreground/90 font-medium leading-relaxed" asChild>
                        <div className="space-y-3">
                            <p>
                                Para garantizar la seguridad de tus operaciones de entrega y la coordinación logística,
                                la plataforma <strong className="font-extrabold text-foreground">{APP_CONFIG.name}</strong> requiere acceder a tu <strong className="font-extrabold text-foreground">ubicación GPS en tiempo real</strong>.
                            </p>

                            <div className="bg-muted/30 rounded-xl border border-border/30 p-3.5 space-y-2.5">
                                <div className="flex items-start gap-2.5">
                                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                        Tu ubicación se recopila <strong className="font-extrabold text-foreground">cada ~45 segundos</strong> durante tu jornada activa
                                        (coordenadas, velocidad y marca temporal) y se almacena durante <strong className="font-extrabold text-foreground">12 meses</strong> para
                                        auditoría, tras lo cual se anonimiza de forma irreversible.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                        Los datos se usan <strong className="font-extrabold text-foreground">exclusivamente</strong> para: optimización de rutas, seguridad vial
                                        y asistencia en carretera, y auditoría del recorrido de entrega.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                Puedes revocar este consentimiento en cualquier momento escribiendo a{' '}
                                <strong className="font-extrabold text-foreground">{APP_CONFIG.supportEmail}</strong>. Consulta los detalles completos en nuestros{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/terminos-condiciones')}
                                    className="text-primary underline font-semibold inline-flex items-center gap-0.5"
                                >
                                    Términos y Condiciones
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </button>
                                {' '}(sección 4).
                            </p>
                        </div>
                    </AlertDialogDescription>
                </div>

                {/* Footer con acciones */}
                <AlertDialogFooter className="px-6 pb-5 pt-4 sm:pt-0 flex-col sm:flex-row gap-2 shrink-0 border-t sm:border-t-0 border-border/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground w-full sm:w-auto"
                        onClick={handleDecline}
                    >
                        Rechazar y cerrar sesión
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto"
                        onClick={handleAccept}
                    >
                        Acepto el rastreo GPS
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
