import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Calendar, Zap, Activity, Info, ShieldCheck, FileText, Download } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

/**
 * Componente Pasaporte Digital del Vehículo
 * Muestra la "identidad" del vehículo decodificada por los agentes.
 */
const VehiclePassport = ({ vehicleData, onDownloadReport }) => {
    const { isMobile } = useWindowSize();

    if (!vehicleData) {
        return (
            <div className="p-10 sm:p-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 rounded-full flex items-center justify-center animate-pulse border border-zinc-800">
                    <Fingerprint size={isMobile ? 32 : 40} className="text-zinc-700" />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Sincronizando Identidad</p>
                    <p className="text-xs text-zinc-500 max-w-[250px] leading-relaxed mx-auto uppercase tracking-tighter">
                        Conecta el scanner para decodificar la topología y el VIN del vehículo.
                    </p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Año', value: vehicleData.year, icon: <Calendar size={14} /> },
        { label: 'Motor', value: vehicleData.engine?.displacement || 'N/A', icon: <Zap size={14} /> },
        { label: 'Transmisión', value: vehicleData.transmission?.split(' ')[0] || 'N/A', icon: <Activity size={14} /> },
        { label: 'Combustible', value: vehicleData.engine?.fuel || 'Gasolina', icon: <Info size={14} /> }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-4 sm:p-8 space-y-8"
        >
            {/* Main Identity Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-30px] right-[-30px] opacity-[0.03] scale-[2.5] rotate-12 pointer-events-none">
                    <Fingerprint size={120} />
                </div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">Identidad Verificada</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter leading-tight sm:leading-none">
                            {vehicleData.make} <br />
                            <span className="text-blue-500">{vehicleData.model}</span>
                        </h2>
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/40 border border-zinc-800 rounded-xl w-fit">
                                <span className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">VIN:</span>
                                <span className="text-[9px] text-white font-mono tracking-widest uppercase">{vehicleData.vin}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/40 border border-zinc-800 rounded-xl w-fit">
                                <span className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">Plataforma:</span>
                                <span className="text-[9px] text-white font-mono tracking-widest uppercase">{vehicleData.platform || 'Gen-3'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-950 p-6 rounded-[2rem] sm:rounded-[3rem] border border-zinc-900/50 flex flex-col justify-between h-32 sm:h-40 hover:border-blue-500/30 transition-all group"
                    >
                        <div className="p-2 sm:p-3 bg-zinc-900 w-fit rounded-xl text-zinc-500 group-hover:text-blue-400 transition-colors">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                            <p className="text-lg sm:text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <div className="pt-4">
                <button 
                    onClick={onDownloadReport}
                    className="w-full bg-zinc-900 border border-zinc-800 py-6 sm:py-8 rounded-[2rem] sm:rounded-[3rem] flex flex-col sm:flex-row items-center justify-center gap-4 hover:bg-zinc-800 transition-all group px-8"
                >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="p-3 sm:p-4 bg-black rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Documentación Técnica</p>
                            <p className="text-xs sm:text-sm font-black text-white uppercase italic">Exportar Pasaporte Digital (PDF)</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex ml-auto items-center gap-2 text-zinc-700 group-hover:text-white transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-widest">Generar Archivo</span>
                        <Download size={18} />
                    </div>
                    <Download size={18} className="sm:hidden text-zinc-700" />
                </button>
            </div>
        </motion.div>
    );
};

export default VehiclePassport;
