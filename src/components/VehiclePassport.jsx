import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Info, ShieldCheck, Calendar, Activity, Zap, FileText, Download } from 'lucide-react';

/**
 * Componente Pasaporte Digital del Vehículo
 * Muestra la "identidad" del vehículo decodificada por los agentes.
 */
const VehiclePassport = ({ vehicleData, onDownloadReport }) => {
    if (!vehicleData) {
        return (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center animate-pulse border border-zinc-800">
                    <Fingerprint size={40} className="text-zinc-700" />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Syncing Identity</p>
                    <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">Conecte el scanner para decodificar la topología y el VIN del vehículo.</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Year', value: vehicleData.year, icon: <Calendar size={14} /> },
        { label: 'Engine', value: vehicleData.engine?.displacement || 'N/A', icon: <Zap size={14} /> },
        { label: 'Trans', value: vehicleData.transmission?.split(' ')[0] || 'N/A', icon: <Activity size={14} /> },
        { label: 'Fuel', value: vehicleData.engine?.fuel || 'Gasoline', icon: <Info size={14} /> }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-6 space-y-6"
        >
            {/* Main Identity Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-30px] right-[-30px] opacity-[0.03] scale-[2.5] rotate-12">
                    <Fingerprint size={120} />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">VIN Verified</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            {vehicleData.make} <br />
                            <span className="text-blue-500">{vehicleData.model}</span>
                        </h2>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-black/40 border border-zinc-800 rounded-xl">
                            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">VIN:</span>
                            <span className="text-[10px] text-white font-mono tracking-widest uppercase">{vehicleData.vin}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-950 p-6 rounded-[2.5rem] border border-zinc-900/50 flex flex-col justify-between h-32"
                    >
                        <div className="p-2 bg-zinc-900 w-fit rounded-xl text-zinc-400">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <div className="pt-4">
                <button 
                    onClick={onDownloadReport}
                    className="w-full bg-zinc-900 border border-zinc-800 py-6 rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all group"
                >
                    <div className="p-3 bg-black rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Documentación</p>
                        <p className="text-xs font-bold text-white uppercase italic">Exportar Pasaporte Digital</p>
                    </div>
                    <Download size={18} className="ml-auto mr-8 text-zinc-700" />
                </button>
            </div>
        </motion.div>
    );
};

export default VehiclePassport;