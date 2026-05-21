import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Preferences } from '@capacitor/preferences';
import { Button } from '@/components/ui/button';
import { Cookie, Info } from 'lucide-react';

const CONSENT_KEY = 'plak_cookie_consent';

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
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
        const checkConsent = async () => {
            try {
                const cookieConsent = getCookie(CONSENT_KEY);
                if (cookieConsent === 'accepted') {
                    return;
                }

                const { value } = await Preferences.get({ key: CONSENT_KEY });
                if (value === 'accepted') {
                    setCookie(CONSENT_KEY, 'accepted', 365);
                    return;
                }

                const localValue = localStorage.getItem(CONSENT_KEY);
                if (localValue === 'accepted') {
                    setCookie(CONSENT_KEY, 'accepted', 365);
                    return;
                }

                const timer = setTimeout(() => setShow(true), 1500);
                return () => clearTimeout(timer);
            } catch {
                const cookieConsent = getCookie(CONSENT_KEY);
                const localConsent = localStorage.getItem(CONSENT_KEY);
                if (cookieConsent !== 'accepted' && localConsent !== 'accepted') {
                    setShow(true);
                }
            }
        };

        checkConsent();
    }, []);

    const handleAccept = async () => {
        try {
            setCookie(CONSENT_KEY, 'accepted', 365);
            await Preferences.set({ key: CONSENT_KEY, value: 'accepted' });
            localStorage.setItem(CONSENT_KEY, 'accepted');
        } catch {
            setCookie(CONSENT_KEY, 'accepted', 365);
            localStorage.setItem(CONSENT_KEY, 'accepted');
        }
        setShow(false);
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
                                    Política de Cookies
                                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        SIC
                                    </span>
                                </h3>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    Utilizamos Almacenamiento Local y Cookies Técnicas Estrictamente Necesarias para Garantizar la Seguridad de tu Inicio de Sesión y el Funcionamiento Óptimo de la Aplicación.
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
                                Saber Más
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
