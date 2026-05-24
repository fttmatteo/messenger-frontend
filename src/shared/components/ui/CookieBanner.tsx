import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Preferences } from '@capacitor/preferences';
import { Button } from '@/shared/components/ui/button';
import { Cookie, Info } from 'lucide-react';
import { logger } from '@/shared/utils/logger';

const CONSENT_KEY = 'plak_cookie_consent';

const getCookie = (name: string): string | null => {
    try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    } catch (e) {
        logger.warn('Error reading cookie:', e);
    }
    return null;
};

const setCookie = (name: string, value: string, days: number) => {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        const maxAge = `max-age=${days * 24 * 60 * 60}`;
        const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${name}=${value || ""}; ${expires}; ${maxAge}; path=/; SameSite=Lax${isSecure}`;
    } catch (e) {
        logger.warn('Error setting cookie:', e);
    }
};

/**
 * Componente de Banner de Cookies y Almacenamiento Local.
 * Informa al usuario sobre el uso de tecnologías de almacenamiento local
 * y gestiona el consentimiento de forma persistente.
 */
export default function CookieBanner() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const checkConsent = async () => {
            try {
                const cookieConsent = getCookie(CONSENT_KEY);
                if (cookieConsent === 'accepted') {
                    return;
                }

                try {
                    const { value } = await Preferences.get({ key: CONSENT_KEY });
                    if (value === 'accepted') {
                        setCookie(CONSENT_KEY, 'accepted', 365);
                        return;
                    }
                } catch (e) {
                    logger.warn('Preferences API not available or failed', e);
                }

                try {
                    const localValue = localStorage.getItem(CONSENT_KEY);
                    if (localValue === 'accepted') {
                        setCookie(CONSENT_KEY, 'accepted', 365);
                        return;
                    }
                } catch (e) {
                    logger.warn('LocalStorage not available', e);
                }

                timer = setTimeout(() => setShow(true), 1500);
            } catch (e) {
                logger.warn('Error in checkConsent:', e);
                setShow(true);
            }
        };

        checkConsent();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    const handleAccept = async () => {
        setShow(false);

        try {
            setCookie(CONSENT_KEY, 'accepted', 365);
            
            try {
                localStorage.setItem(CONSENT_KEY, 'accepted');
            } catch (e) {
                logger.warn('No se pudo guardar en localStorage', e);
            }

            try {
                await Preferences.set({ key: CONSENT_KEY, value: 'accepted' });
            } catch (e) {
                logger.warn('No se pudo guardar en Preferences', e);
            }
        } catch (error) {
            logger.error('Error general guardando el consentimiento:', error);
        }
    };

    if (location.pathname === '/politica-cookies' || location.pathname === '/politica-privacidad') {
        return null;
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999]"
                >
                    <div className="bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-5 space-y-4 relative overflow-hidden">
                        
                        {/* Brillo Sutil Decorativo */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex gap-3">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Cookie className="h-5 w-5 animate-pulse" />
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                    Política de cookies
                                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        SIC
                                    </span>
                                </h3>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    Utilizamos almacenamiento local y cookies técnicas estrictamente necesarias para garantizar la seguridad de tu inicio de sesión y el funcionamiento óptimo de la aplicación.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm font-semibold rounded-xl hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
                                onClick={() => navigate('/politica-cookies')}
                            >
                                <Info className="h-3.5 w-3.5" />
                                Saber más
                            </Button>
                            
                            <Button
                                variant="default"
                                size="sm"
                                className="text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                onClick={handleAccept}
                            >
                                Aceptar
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
