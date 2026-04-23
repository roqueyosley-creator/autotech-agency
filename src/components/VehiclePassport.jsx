import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Fingerprint, Globe, Factory, Engine, 
    Settings, Zap, AlertTriangle, Info,
    ChevronRight, Share2, Download
} from 'lucide-react';

const VehiclePassport = ({ vehicleData, onDownloadReport }) => {
    if (!vehicleData) return null;

    const specs = [
        { label: 'País de Origen', value: vehicleData.country, icon: Globe, color: 'text-blue-400' },
        { label: 'Planta Ensamblaje', value: vehicleData.plant, icon: Factory, color: 'text-purple-400' },
        { label: 'Carrocería', value: vehicleData.body, icon: Settings, color: 'text-emerald-400' },
        { label: 'Tracción', value: vehicleData.drive_type, icon: Zap, color: 'text-orange-400' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-6 pb-20"
        >
            {/* Main Identity Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Fingerprint size={120} />
                </div>
                
                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                    ID Verificado
                                </span>
                                <span className="text-zinc-500 text-xs font-mono tracking-widest">{vehicleData.vin}</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                                {vehicleData.make} <span className="text-blue-500">{vehicleData.model}</span>
                            </h1>
                            <p className="text-xl text-zinc-400 font-medium mt-2">{vehicleData.year} • {vehicleData.engine.displacement} {vehicleData.engine.configuration}</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                                <Share2 size={20} className="text-zinc-300" />
                            </button>
                            <button 
                                onClick={onDownloadReport}
                                className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20"
                            >
                                <Download size={20} />
                                <span className="text-sm">DESCARGAR PASAPORTE</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {specs.map((spec, i) => (
                            <div key={i} className="p-5 bg-black/40 rounded-3xl border border-white/5">
                                <spec.icon className={`${spec.color} mb-3`} size={20} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{spec.label}</p>
                                <p className="text-sm font-bold text-white truncate">{spec.value || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Engine Details */}
                <div className="rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-white mb-6">
                        <div className="p-2 bg-orange-500/20 rounded-xl text-orange-500">
                            <Settings size={20} />
                        </div>
                        Tren Motriz
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-zinc-400">Desplazamiento</span>
                            <span className="text-sm font-bold text-white">{vehicleData.engine.displacement}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-zinc-400">Cilindros</span>
                            <span className="text-sm font-bold text-white">{vehicleData.engine.cylinders}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-zinc-400">Combustible</span>
                            <span className="text-sm font-bold text-white">{vehicleData.engine.fuel}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-zinc-400">Transmisión</span>
                            <span className="text-sm font-bold text-white">{vehicleData.transmission}</span>
                        </div>
                    </div>
                </div>

                {/* Common Issues (AI Insight) */}
                <div className="rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-white mb-6">
                        <div className="p-2 bg-red-500/20 rounded-xl text-red-500">
                            <AlertTriangle size={20} />
                        </div>
                        Alertas Preventivas (IA)
                    </h3>
                    
                    <div className="space-y-3">
                        {vehicleData.common_issues && vehicleData.common_issues.length > 0 ? (
                            vehicleData.common_issues.map((issue, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{issue}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-zinc-500 italic">No se encontraron problemas comunes reportados.</p>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-3">
                        <Info className="text-blue-400 shrink-0" size={16} />
                        <p className="text-[10px] text-blue-300/80 leading-relaxed italic">
                            Información generada por el motor predictivo AutoTech AI basada en patrones históricos de este VIN.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VehiclePassport;
