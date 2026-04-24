import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Brain, Terminal, Cpu, FileText, History } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

/**
 * Navegación Inferior para la App Móvil y Tablet
 */
const BottomNav = ({ activeTab, onTabChange }) => {
    const { isMobile, isDesktop } = useWindowSize();
    
    const tabs = [
        { id: 'scanner', label: 'Scanner', icon: Gauge },
        { id: 'ai', label: 'IA Expert', icon: Brain },
        { id: 'actuations', label: 'Test ECU', icon: Terminal },
        { id: 'service', label: 'Resets', icon: Cpu },
        { id: 'reports', label: 'Reporte', icon: FileText },
        { id: 'history', label: 'Historial', icon: History }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-3xl border-t border-zinc-800/50 pb-safe px-4 pt-2">
            <div className={`max-w-screen-xl mx-auto flex justify-between items-center ${isDesktop ? 'h-20' : 'h-16'}`}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center relative flex-1 group transition-all"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabGlow"
                                    className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full"
                                />
                            )}
                            
                            <div className={`p-2 rounded-xl transition-all duration-300 ${
                                isActive ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-600 group-hover:text-zinc-400 group-hover:bg-zinc-900/50'
                            }`}>
                                <Icon 
                                    size={isMobile ? 20 : 22}
                                    className={isActive ? 'scale-110' : ''} 
                                />
                            </div>
                            
                            {!isMobile && (
                                <span 
                                    className={`text-[9px] font-black mt-1 uppercase tracking-widest transition-all duration-300 ${
                                        isActive ? 'text-blue-500 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100'
                                    }`}
                                >
                                    {tab.label}
                                </span>
                            )}
                            
                            {isMobile && (
                                <span className={`text-[7px] font-bold mt-1 uppercase tracking-tighter ${isActive ? 'text-blue-500' : 'text-zinc-600'}`}>
                                    {tab.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
