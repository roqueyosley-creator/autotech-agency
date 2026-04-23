import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2, ShieldCheck, XCircle } from 'lucide-react';

const ActuationMonitor = ({ logs, onClear }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-[#0c0c0e] border-t border-white/5 p-4 h-64 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400">
                        <Terminal size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">UDS Live Monitor</h3>
                </div>
                <button 
                    onClick={onClear}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-zinc-400 transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 px-2 custom-scrollbar"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-700 italic tracking-wider">
                        Esperando ejecución de comandos...
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i} 
                            className="border-l-2 border-white/5 pl-3 py-1"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-zinc-600">[{log.timestamp}]</span>
                                <span className="text-blue-500 font-bold uppercase">{log.actuation_name}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="text-zinc-400">
                                    <span className="text-emerald-500">❯ SENT:</span> {log.command}
                                </div>
                                <div className={`flex items-center gap-2 ${log.success ? 'text-zinc-300' : 'text-red-400'}`}>
                                    <span className={log.success ? 'text-blue-400' : 'text-red-500'}>❮ RECV:</span> 
                                    {log.response}
                                    {log.success ? (
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <XCircle size={12} />
                                            <span className="text-[8px] font-bold">NRC: {log.nrc || 'TIMEOUT'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActuationMonitor;
