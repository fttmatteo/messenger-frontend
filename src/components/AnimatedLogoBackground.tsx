import React from "react"
import { MessageSquare, Bike, Package, Zap, MapPin } from "lucide-react"

const ICONS_LIST = [MessageSquare, Bike, Package, Zap, MapPin]

const FLOATING_ICONS = [
    { Icon: MessageSquare, top: "15%", left: "12%", size: 150, animationClass: "animate-float-1" },
    { Icon: Bike, top: "68%", left: "8%", size: 180, animationClass: "animate-float-2" },
    { Icon: Package, top: "18%", left: "76%", size: 190, animationClass: "animate-float-3" },
    { Icon: Zap, top: "72%", left: "82%", size: 140, animationClass: "animate-float-4" },
    { Icon: MapPin, top: "45%", left: "45%", size: 120, animationClass: "animate-float-5" },
]

const GRID_ITEMS = Array.from({ length: 144 })

/**
 * Componente AnimatedLogoBackground
 * Renderiza un fondo animado premium, 100% acelerado por hardware.
 * Envuelto en React.memo y utilizando animaciones CSS puras que se ejecutan en el hilo del compositor del navegador.
 * Esto garantiza cero parpadeos, cero recálculos de diseño (layout thrashing) y cero reinicios durante los re-renderizados de React.
 */
const AnimatedLogoBackground = React.memo(function AnimatedLogoBackground() {
    return (
        <div className="fixed inset-0 -z-20 w-screen h-screen overflow-hidden bg-background pointer-events-none select-none">
            {/* Animaciones CSS locales para renderizado en el compositor de la GPU */}
            <style>{`
                @keyframes driftGrid {
                    0%, 100% {
                        transform: translate(0px, 0px);
                    }
                    50% {
                        transform: translate(-30px, -30px);
                    }
                }
                @keyframes floatIcon1 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    50% { transform: translate(15px, -20px) rotate(6deg); }
                }
                @keyframes floatIcon2 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    50% { transform: translate(-20px, 15px) rotate(-8deg); }
                }
                @keyframes floatIcon3 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    50% { transform: translate(20px, 20px) rotate(5deg); }
                }
                @keyframes floatIcon4 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    50% { transform: translate(-15px, -15px) rotate(-6deg); }
                }
                @keyframes floatIcon5 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    50% { transform: translate(10px, 15px) rotate(8deg); }
                }

                .animate-grid-drift {
                    animation: driftGrid 60s ease-in-out infinite;
                    will-change: transform;
                }
                .animate-float-1 {
                    animation: floatIcon1 24s ease-in-out infinite;
                    will-change: transform;
                }
                .animate-float-2 {
                    animation: floatIcon2 28s ease-in-out infinite;
                    will-change: transform;
                }
                .animate-float-3 {
                    animation: floatIcon3 26s ease-in-out infinite;
                    will-change: transform;
                }
                .animate-float-4 {
                    animation: floatIcon4 30s ease-in-out infinite;
                    will-change: transform;
                }
                .animate-float-5 {
                    animation: floatIcon5 32s ease-in-out infinite;
                    will-change: transform;
                }
            `}</style>

            {/* Efecto de resplandor de fondo para una estética moderna premium */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/2" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/2" />

            {/* Cuadrícula repetitiva de iconos con desplazamiento */}
            <div 
                className="absolute top-[-100px] left-[-100px] w-[calc(100%+200px)] h-[calc(100%+200px)] grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-8 sm:gap-12 md:gap-16 p-16 opacity-[0.075] dark:opacity-[0.055] text-primary animate-grid-drift overflow-hidden"
            >
                {GRID_ITEMS.map((_, idx) => {
                    const IconComponent = ICONS_LIST[idx % ICONS_LIST.length]
                    return (
                        <div key={idx} className="flex items-center justify-center">
                            <IconComponent size={52} strokeWidth={1} />
                        </div>
                    )
                })}
            </div>

            {/* Iconos temáticos grandes flotantes y giratorios */}
            {FLOATING_ICONS.map((item, idx) => {
                const IconComponent = item.Icon
                return (
                    <div
                        key={idx}
                        className={`absolute text-foreground/4 dark:text-foreground/2 select-none pointer-events-none blur-[1.5px] ${item.animationClass}`}
                        style={{
                            top: item.top,
                            left: item.left,
                        }}
                    >
                        <IconComponent size={item.size} strokeWidth={0.75} />
                    </div>
                )
            })}
        </div>
    )
})

export default AnimatedLogoBackground
