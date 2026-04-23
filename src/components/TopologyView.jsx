import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

/**
 * Vista de Topología de Módulos (Red de Vehículo)
 * Inspirado en Launch X431 Pro
 */
const TopologyView = ({ modules = [] }) => {
    // Módulos por defecto si no hay data
    const defaultModules = [
        { id: 'pos', name: 'PCM/ECU', status: 'ok', type: 'Powertrain' },
        { id: 'abs', name: 'ABS/ESC', status: 'error', type: 'Chassis' },
        { id: 'srs', name: 'Airbag', status: 'ok', type: 'Safety' },
        { id: 'tcm', name: 'Gearbox', status: 'ok', type: 'Transmission' },
        { id: 'bcm', name: 'Body', status: 'ok', type: 'Comfort' },
        { id: 'tpms', name: 'Tires', status: 'warning', type: 'Safety' },
        { id: 'sas', name: 'Steering', status: 'ok', type: 'Chassis' },
    ];

    const displayModules = modules.length > 0 ? modules : defaultModules;

    const getStatusStyles = (status) => {
        switch (status) {
            case 'ok': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
            case 'error': return 'border-red-500 bg-red-500/20 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
            case 'warning': return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
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
        <div className="p-6 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Topología de Red</h2>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Health Scan: Intelligent Diagnosis</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase">7 Online</span>
                </div>
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
                {/* SVG Connections (simplified decorative lines) */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <svg width="100%" height="100%" className="stroke-zinc-800 stroke-1 fill-none">
                        <line x1="25%" y1="20%" x2="75%" y2="20%" />
                        <line x1="25%" y1="20%" x2="25%" y2="80%" />
                        <line x1="75%" y1="20%" x2="75%" y2="80%" />
                    </svg>
                </div>

                {displayModules.map((module, index) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative z-10 p-4 border rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 ${getStatusStyles(module.status)}`}
                    >
                        <div className="mb-2 p-2 bg-black/20 rounded-lg">
                            <Cpu size={16} className="opacity-80" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-tighter mb-1">{module.name}</h4>
                        <div className="flex items-center gap-1">
                            {getIcon(module.status)}
                            <span className="text-[7px] font-bold uppercase">{module.status === 'ok' ? 'Normal' : 'DTC Detected'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-center">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                    Escaneo Completo (Full System)
                </button>
            </div>
        </div>
    );
};

export default TopologyView;
