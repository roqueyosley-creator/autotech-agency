import { useState, useEffect } from 'react';

/**
 * Hook para detectar el tamaño de la ventana y determinar el tipo de dispositivo.
 */
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    const [device, setDevice] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            setWindowSize({ width, height });
            
            setDevice({
                isMobile: width < 640,
                isTablet: width >= 640 && width <= 1024,
                isDesktop: width > 1024
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Ejecutar al inicio

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { ...windowSize, ...device };
};
