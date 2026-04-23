import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Save, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

import { codingService } from '../services/codingService';

/**
 * Área de Programación y Codificación de ECUs
 * Diseño experto para ajustes avanzados.
 */
const ProgrammingWorkspace = () => {
    const [isProgramming, setIsProgramming] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consoleOutput, setConsoleOutput] = useState([
        "> Sistema NovaDrive Pro listo para codificación.",
        "> Protocolo UDS Detectado (ISO 14229).",
        "> Esperando selección de parámetro..."
    ]);

    const adaptations = [
        { id: 'VMAX', name: 'Velocidad Máxima', current: '210 km/h', new: '250 km/h', did: 'F190', value: 'FA' },
        { id: 'DRL', name: 'Luces Diurnas (DRL)', current: 'Inactivo', new: 'Activo', did: '2001', value: '01' },
        { id: 'START_STOP', name: 'Memoria Start/Stop', current: 'OFF', new: 'ON', did: '300A', value: '01' },
        { id: 'COMFORT', name: 'Comfort Windows', current: 'Standard', new: 'Premium', did: '4402', value: 'FF' }
    ];

    const handleWrite = async () => {
        if (!selectedItem) return;

        setShowWarning(false);
        setIsProgramming(true);
        
        const log = (msg) => setConsoleOutput(prev => [...prev, `> ${msg}`]);

        try {
            log(`Iniciando escritura de ${selectedItem.name}...`);
            
            // Step 1: Diagnostic Session
            log("Cambiando a Sesión Extendida (10 03)...");
            await codingService.startDiagnosticSession('03');
            
            // Step 2: Security Access
            log("Negociando Acceso de Seguridad (27 01)...");
            await codingService.requestSecurityAccess('01');
            
            // Step 3: Write DID
            log(`Escribiendo Valor ${selectedItem.value} en DID ${selectedItem.did}...`);
            const writeResult = await codingService.writeDID(selectedItem.did, selectedItem.value);
            
            if (writeResult.success) {
                log("¡Escritura exitosa! Verificando Checksum...");
                
                // Step 4: Reset (Optional but recommended)
                log("Reiniciando Módulo para aplicar cambios (11 01)...");
                await codingService.resetModule('01');
                
                log("PROCESO COMPLETADO EXITOSAMENTE.");
            } else {
                log("ERROR: Fallo en la verificación de escritura.");
            }
        } catch (error) {
            log(`ERROR CRÍTICO: ${error.message}`);
        } finally {
            setIsProgramming(false);
            setSelectedItem(null);
        }
    };

    return (
        <div className="p-6">
            <header className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Programación de Datos</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Expert ECU Coding & Adaptation</p>
            </header>

            <div className="space-y-4 mb-8">
                {adaptations.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        disabled={isProgramming}
                        className={`w-full p-4 border rounded-2xl flex items-center justify-between group transition-all ${
                            selectedItem?.id === item.id 
                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                        <div className="text-left">
                            <h4 className={`text-xs font-bold uppercase tracking-tighter mb-1 ${
                                selectedItem?.id === item.id ? 'text-blue-400' : 'text-zinc-400'
                            }`}>{item.name}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-zinc-600 line-through">{item.current}</span>
                                <ChevronRight size={10} className="text-blue-500" />
                                <span className="text-xs font-black text-blue-400 uppercase">{item.new}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">DID: {item.did}</p>
                            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">VAL: {item.value}</p>
                        </div>
                    </button>
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
                disabled={isProgramming || !selectedItem}
                className={`w-full py-4 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    isProgramming || !selectedItem 
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none' 
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
            >
                <Save size={16} />
                {selectedItem ? `Escribir ${selectedItem.name}` : 'Selecciona un Parámetro'}
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
