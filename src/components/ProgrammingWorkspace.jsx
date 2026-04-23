import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Save, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

/**
 * Área de Programación y Codificación de ECUs
 * Diseño experto para ajustes avanzados.
 */
const ProgrammingWorkspace = () => {
    const [isProgramming, setIsProgramming] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState([
        "> Sistema listo para codificación.",
        "> Driver de bus CAN inicializado (500kbps).",
        "> Esperando comando de escritura..."
    ]);

    const adaptations = [
        { id: '1', name: 'Velocidad Máxima', current: '210 km/h', new: '250 km/h' },
        { id: '2', name: 'Lucit de Cruce Diurna', current: 'OFF', new: 'ON' },
        { id: '3', name: 'Start/Stop Memory', current: 'OFF', new: 'ON' },
        { id: '4', name: 'Comfort Windows', current: 'Normal', new: 'Extended' }
    ];

    const handleWrite = () => {
        setShowWarning(false);
        setIsProgramming(true);
        setConsoleOutput(prev => [...prev, "> Iniciando sesión de diagnóstico 0x03...", "> Enviando trama de seguridad 0x27..."]);
        
        // Simulación de programación
        setTimeout(() => {
            setConsoleOutput(prev => [...prev, "> Verificando checksum...", "> Datos grabados exitosamente en EEPROM.", "> Sesión cerrada."]);
            setIsProgramming(false);
        }, 3000);
    };

    return (
        <div className="p-6">
            <header className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Programación de Datos</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Expert ECU Coding & Adaptation</p>
            </header>

            <div className="space-y-4 mb-8">
                {adaptations.map(item => (
                    <div key={item.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-colors">
                        <div>
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mb-1">{item.name}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-zinc-600 line-through">{item.current}</span>
                                <ChevronRight size={10} className="text-blue-500" />
                                <span className="text-xs font-black text-blue-400 uppercase">{item.new}</span>
                            </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                ))}
            </div>

            {/* Terminal Console */}
            <div className="bg-black border border-zinc-900 rounded-xl p-4 font-mono mb-8 h-40 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 border-b border-zinc-900 pb-2">
                    <Terminal size={12} className="text-zinc-600" />
                    <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest">Live Console Output</span>
                </div>
                {consoleOutput.map((line, i) => (
                    <p key={i} className="text-[10px] text-zinc-500 mb-1 leading-relaxed">{line}</p>
                ))}
                {isProgramming && <p className="text-[10px] text-blue-500 animate-pulse">{'>>> ESCRIBIENDO BLOQUES DE DATOS...'}</p>}
            </div>

            <button 
                onClick={() => setShowWarning(true)}
                disabled={isProgramming}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save size={16} />
                Ejecutar Programación (Write)
            </button>

            {/* Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-950 border border-red-500/30 p-8 rounded-[2.5rem] max-w-sm text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-500 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">¿Estás Seguro?</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-8">
                                Estás a punto de escribir datos en la EEPROM de la ECU. Una desconexión accidental durante este proceso puede inhabilitar el módulo permanentemente.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleWrite}
                                    className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                                >
                                    Confirmar Escritura
                                </button>
                                <button 
                                    onClick={() => setShowWarning(false)}
                                    className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-2xl active:scale-95 transition-all border border-zinc-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProgrammingWorkspace;
