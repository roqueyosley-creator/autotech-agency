import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

/**
 * Vista de Topología de Módulos (Red de Vehículo)
 * Inspirado en Launch X431 Pro
 */
const TopologyView = ({ modules = [] }) => {
    const { isMobile, isDesktop } = useWindowSize();

    // Módulos por defecto si no hay data
    const defaultModules = [
        { id: 'pos', name: 'PCM/ECU', status: 'ok', type: 'Powertrain' },
        { id: 'abs', name: 'ABS/ESC', status: 'error', type: 'Chassis' },
        { id: 'srs', name: 'Airbag', status: 'ok', type: 'Safety' },
        { id: 'tcm', name: 'Gearbox', status: 'ok', type: 'Transmission' },
        { id: 'bcm', name: 'Body', status: 'ok', type: 'Comfort' },
        { id: 'tpms', name: 'Tires', status: 'warning', type: 'Safety' },
        { id: 'sas', name: 'Steering', status: 'ok', type: 'Chassis' },
        { id: 'hvac', name: 'HVAC', status: 'ok', type: 'Comfort' },
    ];

    const displayModules = modules.length > 0 ? modules : defaultModules;

    const getStatusStyles = (status) => {
        switch (status) {
            case 'ok': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
            case 'error': return 'border-red-500 bg-red-500/20 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse';
            case 'warning': return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
            default: return 'border-zinc-800 bg-zinc-900/50 text-zinc-500';
        }
    };

    const getIcon = (status) => {
        switch (status) {
            case 'ok': return <CheckCircle2 size={10} />;
            case 'error': return <ShieldAlert size={10} />;
            case 'warning': return <AlertTriangle size={10} />;
            default: return null;
        }
    };

    return (
        <div className="p-6 sm:p-10 bg-zinc-950/50 rounded-[2rem] sm:rounded-[3rem] border border-zinc-900 backdrop-blur-xl relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-white">Topología de Red</h2>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-1">Health Scan: Intelligent Diagnosis Interface</p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            {displayModules.filter(m => m.status === 'ok').length} Online
                        </span>
                    </div>
                    <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        {displayModules.filter(m => m.status === 'error').length} Faults
                    </span>
                </div>
            </div>

            <div className="relative">
                {/* SVG Connections - Adjusted for responsiveness */}
                {!isMobile && (
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
                        <svg width="100%" height="100%" className="stroke-zinc-700 stroke-1 fill-none">
                            <path d="M 100 100 L 900 100 M 500 100 L 500 400" />
                            <circle cx="500" cy="100" r="4" fill="currentColor" className="text-blue-500" />
                        </svg>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {displayModules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`relative z-10 p-5 sm:p-6 border-2 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 ${getStatusStyles(module.status)} hover:bg-zinc-900/40 cursor-pointer group`}
                        >
                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                {getIcon(module.status)}
                            </div>
                            
                            <div className="mb-3 p-3 bg-black/20 rounded-xl group-hover:bg-black/40 transition-colors">
                                <Cpu size={isMobile ? 18 : 22} className={module.status === 'error' ? 'text-red-400' : 'text-zinc-400'} />
                            </div>
                            
                            <h4 className="text-[11px] sm:text-[13px] font-black uppercase tracking-tighter mb-1 text-white">{module.name}</h4>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2">{module.type}</p>
                            
                            <div className={`mt-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                module.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' : 
                                module.status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                                {module.status === 'ok' ? 'Normal' : 'DTC Active'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-zinc-900 pt-8">
                <button className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-600/30 transition-all active:scale-95 italic">
                    Iniciar Escaneo de Salud Completo
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all">
                    Resetear Módulos
                </button>
            </div>
        </div>
    );
};

export default TopologyView;
