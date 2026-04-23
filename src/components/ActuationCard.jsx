import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Activity, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const ActuationCard = ({ actuation, brand, connected, onExecute, onStop, activeActuation }) => {
    const isActive = activeActuation?.id === actuation.id;
    const [timeLeft, setTimeLeft] = useState(actuation.duration_ms / 1000);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    useEffect(() => {
        let timer;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            onStop(actuation);
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (!isActive) setTimeLeft(actuation.duration_ms / 1000);
    }, [isActive]);

    const isCompatible = () => {
        if (!brand) return true;
        const brandKey = brand.toLowerCase();
        return actuation.commands[brandKey] || actuation.commands.universal;
    };

    const getSafetyColor = (level) => {
        if (level === 'high') return 'text-red-500 bg-red-500/10';
        if (level === 'medium') return 'text-orange-500 bg-orange-500/10';
        return 'text-green-500 bg-green-500/10';
    };

    return (
        <motion.div
            layout
            className={`relative p-5 rounded-3xl border transition-all duration-500 ${
                isActive 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                : isCompatible() ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700' : 'border-zinc-900 bg-zinc-950/50 opacity-40 grayscale'
            }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl bg-white/5 text-zinc-400`}>
                   <Activity size={16} />
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getSafetyColor(actuation.safety_level)}`}>
                    {actuation.safety_level}
                </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-1 leading-tight">{actuation.name}</h4>
            <p className="text-[10px] text-zinc-500 line-clamp-2 mb-4 leading-relaxed">{actuation.description}</p>

            <div className="flex items-center gap-4 mb-6">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Duración: <span className="text-white">~{actuation.duration_ms/1000}s</span></div>
                {actuation.verify_pid && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <Activity size={10} className="text-blue-400" />
                        <span className="text-[8px] font-black text-blue-400 uppercase">Live Feedback</span>
                    </div>
                )}
            </div>

            {!isCompatible() && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-3xl z-10">
                    <Lock className="text-zinc-500 mb-2" size={24} />
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">No compatible con {brand}</p>
                </div>
            )}

            <div className="mt-auto">
                <AnimatePresence mode="wait">
                    {isActive ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: actuation.duration_ms / 1000, ease: "linear" }}
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                            <button
                                onClick={() => onStop(actuation)}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Square size={12} fill="currentColor" /> DETENER ({timeLeft}s)
                            </button>
                        </motion.div>
                    ) : (
                        <button
                            disabled={!connected || !isCompatible()}
                            onClick={() => onExecute(actuation)}
                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                ${connected && isCompatible() 
                                    ? 'bg-zinc-100 text-black hover:bg-white shadow-xl shadow-white/5' 
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                            `}
                        >
                            <Play size={12} fill="currentColor" /> EJECUTAR PRUEBA
                        </button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ActuationCard;
