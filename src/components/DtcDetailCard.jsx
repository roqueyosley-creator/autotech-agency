import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Thermometer, Gauge, Zap } from 'lucide-react';

const DtcDetailCard = ({ dtc, freezeFrame }) => {
    if (!dtc) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] -z-10" />
            
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {dtc.status || 'Activo'}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Prioridad: {dtc.priority}</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-white leading-none">
                        {dtc.id}
                    </h2>
                </div>
                <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                    <AlertTriangle size={24} />
                </div>
            </div>

            <p className="text-sm text-zinc-300 font-medium leading-relaxed mb-8 border-l-2 border-red-500/30 pl-4 italic">
                {dtc.description}
            </p>

            {/* Freeze Frame Section */}
            {freezeFrame && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={14} className="text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Freeze Frame Data (Modo 02)</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                <Gauge size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">RPM Motor</span>
                            </div>
                            <span className="text-xl font-black text-white italic">{freezeFrame.RPM} <small className="text-[10px] opacity-50 not-italic">RPM</small></span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                <Zap size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Carga</span>
                            </div>
                            <span className="text-xl font-black text-white italic">{freezeFrame.EngineLoad}%</span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                <Thermometer size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Coolant</span>
                            </div>
                            <span className="text-xl font-black text-white italic">{freezeFrame.CoolantTemp}°C</span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                <Activity size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Velocidad</span>
                            </div>
                            <span className="text-xl font-black text-white italic">{freezeFrame.Speed} <small className="text-[10px] opacity-50 not-italic">km/h</small></span>
                        </div>
                    </div>
                </div>
            )}

            {!freezeFrame && (
                <div className="p-6 border border-dashed border-white/10 rounded-3xl text-center opacity-30">
                    <p className="text-[9px] font-bold uppercase tracking-widest">No hay datos de congelamiento disponibles</p>
                </div>
            )}
        </motion.div>
    );
};

export default DtcDetailCard;
