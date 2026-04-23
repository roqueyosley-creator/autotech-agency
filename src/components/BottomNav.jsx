import React from 'react';
import { Gauge, History, User, Activity, BarChart3, Cpu, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Navegación Inferior para la App Móvil
 */
const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'scanner', label: 'Scanner', icon: Gauge },
        { id: 'analysis', label: 'Analizar', icon: BarChart3 },
        { id: 'topology', label: 'Red Pro', icon: Cpu },
        { id: 'program', label: 'Coding', icon: Terminal },
        { id: 'history', label: 'Informes', icon: History }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-800 pb-safe pt-2 px-6">
            <div className="max-w-md mx-auto flex justify-between items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center relative flex-1 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabGlow"
                                    className="absolute -top-1 w-8 h-8 bg-blue-500/20 blur-xl rounded-full"
                                />
                            )}
                            <Icon 
                                className={`w-6 h-6 transition-all duration-300 ${
                                    isActive ? 'text-blue-500 scale-110' : 'text-zinc-600 group-hover:text-zinc-400'
                                }`} 
                            />
                            <span 
                                className={`text-[10px] font-bold mt-1 uppercase tracking-tighter transition-all duration-300 ${
                                    isActive ? 'text-blue-500' : 'text-zinc-600'
                                }`}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
