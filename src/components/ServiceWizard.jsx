import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Info, CheckSquare, Square, Play, ShieldAlert, Cpu } from 'lucide-react';
import ServiceProgress from './ServiceProgress';
import ServiceResult from './ServiceResult';

const ServiceWizard = ({ visible, service, brand, connected, onSendCommand, onClose }) => {
    const [phase, setPhase] = useState('info'); // info | method | execute | manual | result
    const [confirmedPreconditions, setConfirmedPreconditions] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [executionLogs, setExecutionLogs] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [manualStep, setManualStep] = useState(0);

    const brandData = service?.brands[brand?.toLowerCase()] || service?.brands?.universal;
    const methods = brandData?.methods || [];

    useEffect(() => {
        if (visible) {
            setPhase('info');
            setConfirmedPreconditions([]);
            setSelectedMethod(null);
            setExecutionLogs([]);
            setManualStep(0);
        }
    }, [visible]);

    const togglePrecondition = (idx) => {
        if (confirmedPreconditions.includes(idx)) {
            setConfirmedPreconditions(prev => prev.filter(i => i !== idx));
        } else {
            setConfirmedPreconditions(prev => [...prev, idx]);
        }
    };

    const startOBDExecution = async () => {
        setPhase('execute');
        const commands = selectedMethod.commands;
        const logs = [];

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            // Simulamos delay de bus
            await new Promise(r => setTimeout(r, 800));
            
            try {
                // Si está conectado, enviar comando real. Si no, simular.
                let response = "OK";
                if (connected) {
                    response = await onSendCommand(cmd);
                } else {
                    // Simulación realista basada en el comando
                    if (cmd.startsWith('AT')) response = "OK";
                    else if (cmd === '1003') response = "50 03 00";
                    else response = `6${cmd.substring(1, 2)} ${cmd.substring(2, 4)}`;
                }

                const log = { command: cmd, response: response, success: !response.startsWith('7F') };
                logs.push(log);
                setExecutionLogs([...logs]);

                if (!log.success) {
                    setIsSuccess(false);
                    setPhase('result');
                    return;
                }
            } catch (err) {
                setPhase('result');
                setIsSuccess(false);
                return;
            }
        }
        setIsSuccess(true);
        setPhase('result');
    };

    if (!visible || !service) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                            <Cpu size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg uppercase italic tracking-tighter leading-none">{service.name}</h2>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Asistente de Servicio Pro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* FASE 1: INFORMACIÓN Y PRECONDICIONES */}
                    {phase === 'info' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem]">
                                <h5 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest">Descripción del Trabajo</h5>
                                <p className="text-zinc-300 text-sm leading-relaxed italic">"{service.description}"</p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                    <ShieldAlert size={12} /> Verificaciones de Seguridad
                                </h5>
                                <div className="space-y-3">
                                    {service.preconditions?.map((pre, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => togglePrecondition(idx)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${confirmedPreconditions.includes(idx) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}
                                        >
                                            {confirmedPreconditions.includes(idx) ? <CheckSquare size={18} /> : <Square size={18} />}
                                            <span className="text-xs font-bold">{pre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => methods.length > 1 ? setPhase('method') : (methods[0].commands ? (setSelectedMethod(methods[0]), setPhase('execute'), startOBDExecution()) : setPhase('manual'))}
                                disabled={confirmedPreconditions.length < (service.preconditions?.length || 0)}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20"
                            >
                                Continuar al Servicio
                            </button>
                        </motion.div>
                    )}

                    {/* FASE 2: SELECCIÓN DE MÉTODO */}
                    {phase === 'method' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-white font-black text-xl italic tracking-tighter uppercase mb-6 text-center">Selecciona el Procedimiento</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {methods.map((m, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => {
                                            setSelectedMethod(m);
                                            if (m.commands) {
                                                setPhase('execute');
                                                startOBDExecution();
                                            } else {
                                                setPhase('manual');
                                            }
                                        }}
                                        className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-blue-500/50 cursor-pointer group transition-all"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-white font-bold">{m.name}</h4>
                                            {m.commands ? (
                                                <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase">OBD II</span>
                                            ) : (
                                                <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full uppercase">Manual</span>
                                            )}
                                        </div>
                                        <p className="text-zinc-500 text-[10px]">{m.commands ? 'El equipo se comunicará directamente con la ECU.' : 'Sigue los pasos físicos en el vehículo.'}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* FASE 3A: EJECUCIÓN OBD */}
                    {phase === 'execute' && (
                        <ServiceProgress 
                            logs={executionLogs} 
                            currentCmdIndex={executionLogs.length} 
                            totalCmds={selectedMethod?.commands?.length || 0} 
                        />
                    )}

                    {/* FASE 3B: PROCEDIMIENTO MANUAL */}
                    {phase === 'manual' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-black text-xl italic tracking-tighter uppercase">Pasos Manuales</h3>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Paso {manualStep + 1} de {selectedMethod.manual_procedure.length}</span>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] min-h-[200px] flex items-center justify-center text-center">
                                <motion.p 
                                    key={manualStep}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-xl font-bold text-white leading-tight italic"
                                >
                                    "{selectedMethod.manual_procedure[manualStep]}"
                                </motion.p>
                            </div>

                            <div className="flex gap-4">
                                {manualStep > 0 && (
                                    <button 
                                        onClick={() => setManualStep(s => s - 1)}
                                        className="flex-1 py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-zinc-800"
                                    >
                                        Anterior
                                    </button>
                                )}
                                <button 
                                    onClick={() => manualStep < selectedMethod.manual_procedure.length - 1 ? setManualStep(s => s + 1) : (setIsSuccess(true), setPhase('result'))}
                                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20"
                                >
                                    {manualStep < selectedMethod.manual_procedure.length - 1 ? 'Paso Completado' : 'Finalizar Procedimiento'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* FASE 4: RESULTADO */}
                    {phase === 'result' && (
                        <ServiceResult 
                            success={isSuccess} 
                            serviceName={service.name} 
                            onRetry={() => startOBDExecution()}
                            onManual={() => setPhase('manual')}
                            onClose={onClose}
                        />
                    )}
                </div>

                {!connected && phase !== 'result' && (
                    <div className="bg-amber-500/10 border-t border-amber-500/20 p-3 text-center">
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <ShieldAlert size={10} /> MODO SIMULACIÓN ACTIVO
                        </span>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ServiceWizard;
