import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';

const ServiceProgress = ({ logs, currentCmdIndex, totalCmds }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ejecución de Comandos</span>
                <span className="text-[10px] font-mono text-blue-500">{Math.round((logs.length / totalCmds) * 100)}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-8 border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(logs.length / totalCmds) * 100}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${log.success ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            {log.success ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                            <span className="text-[10px] font-mono text-zinc-400">{log.command}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${log.success ? 'text-emerald-400' : 'text-red-400'}`}>
                            {log.response}
                        </span>
                    </motion.div>
                ))}

                {currentCmdIndex < totalCmds && logs.length < totalCmds && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/10 bg-blue-500/5 animate-pulse">
                        <Loader2 size={14} className="text-blue-500 animate-spin" />
                        <span className="text-[10px] font-mono text-blue-400">Enviando siguiente comando...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceProgress;
