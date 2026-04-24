import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ListTree, Activity, MessageSquare, Send, Sparkles, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
import { aiService } from '../services/aiService';
import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import ProbabilityCard from './ProbabilityCard';
import DiagnosticTree from './DiagnosticTree';

const AIDiagnostic = ({ vehicleData, obdData, dtcs }) => {
    const { isMobile } = useWindowSize();
    const [view, setView] = useState('summary'); // summary | tree | chat | manual
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const chatEndRef = useRef(null);

    const runDiagnosis = async () => {
        setLoading(true);
        try {
            const result = await aiService.diagnose({
                symptoms: "Análisis automático de parámetros y errores",
                dtcs: dtcs.map(d => d.code),
                live_data: obdData,
                vehicle: vehicleData
            });
            setDiagnosis(result);
            setView('summary');
        } catch (err) {
            console.error("Diagnosis failed:", err);
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Falla en motor de IA. Reintenta en breve.", priority: 'high' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isStreaming) return;
        if (input.length > 500) {
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Consulta demasiado larga. Máximo 500 caracteres.", priority: 'low' });
            return;
        }
        
        const userMsg = { role: 'user', text: input };
        setChatHistory(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsStreaming(true);

        const aiMsg = { role: 'model', text: '' };
        setChatHistory(prev => [...prev, aiMsg]);

        try {
            const streamer = aiService.streamChat(currentInput, chatHistory, { vehicleData, obdData, dtcs });
            for await (const chunk of streamer) {
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text += chunk;
                    return newHistory;
                });
            }
        } catch (err) {
            console.error("Chat failed:", err);
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Error de conexión con el Asistente Experto", priority: 'high' });
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].text = "Error: No se pudo completar la respuesta.";
                return newHistory;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        const unsubscribe = eventBus.on(AGENT_EVENTS.AI_INSIGHT_GENERATED, (data) => {
            setDiagnosis(data);
            setView('summary');
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className="flex flex-col min-h-[60vh] lg:min-h-0 lg:h-full bg-[#0a0a0c] text-white rounded-[2rem] overflow-hidden border border-white/5">
            {/* Header Responsivo */}
            <div className="p-4 sm:p-6 border-b border-white/5 bg-white/2 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                        <Brain className="text-blue-400" size={isMobile ? 18 : 22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black tracking-tighter uppercase italic">AutoTech AI Engine</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-none">Active Monitoring</span>
                        </div>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                    {[
                        { id: 'summary', label: isMobile ? 'Sum' : 'Overview', icon: ListTree },
                        { id: 'tree', label: isMobile ? 'Tree' : 'Logic Tree', icon: Activity },
                        { id: 'chat', label: isMobile ? 'Chat' : 'Expert Chat', icon: MessageSquare }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                ${view === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}
                            `}
                        >
                            {isMobile && <t.icon size={12} />}
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {view === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                                        />
                                        <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
                                    </div>
                                    <p className="text-xs text-blue-400 font-black tracking-widest animate-pulse uppercase">Análisis Neural en Progreso...</p>
                                </div>
                            ) : diagnosis ? (
                                <>
                                    {/* Diagnosis Card */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 shadow-2xl relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2 text-blue-400 font-black italic text-[10px] tracking-widest uppercase">
                                                <Sparkles size={14} /> Diagnóstico Maestro
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                                                <ShieldCheck className="text-green-400" size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">{diagnosis.confidence_score}% Confianza</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xl sm:text-2xl font-bold leading-tight mb-6 italic tracking-tight">
                                            "{diagnosis.diagnosis_summary}"
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                                diagnosis.urgency === 'immediate' ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'
                                            }`}>
                                                <AlertTriangle className={diagnosis.urgency === 'immediate' ? 'text-red-400' : 'text-orange-400'} size={20} />
                                                <div>
                                                    <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">Prioridad</div>
                                                    <div className="text-sm font-black uppercase italic">{diagnosis.urgency}</div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl border bg-white/5 border-white/10 flex items-center gap-4">
                                                <Zap className="text-yellow-400" size={20} />
                                                <div>
                                                    <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">Costo Estimado</div>
                                                    <div className="text-sm font-black uppercase italic">{diagnosis.estimated_cost.min}-{diagnosis.estimated_cost.max} USD</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Probable Causes */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 px-1">
                                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Causas y Verificaciones</h3>
                                            <div className="flex-1 h-[1px] bg-white/5" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {diagnosis.probable_causes.map((cause, idx) => (
                                                <ProbabilityCard key={idx} cause={cause} />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 px-6">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                                        <Brain className="text-zinc-700" size={40} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-zinc-500">Sin Datos de Análisis</h3>
                                    <p className="text-xs text-zinc-600 mt-2 max-w-xs mx-auto uppercase tracking-widest font-bold">Inicia un escaneo para procesar parámetros con la IA</p>
                                    <button onClick={runDiagnosis} className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                                        Generar Análisis Neural
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {view === 'tree' && (
                        <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                            <DiagnosticTree 
                                initialTree={diagnosis?.diagnostic_tree || { 
                                    id: 'root', 
                                    question: '¿El vehículo presenta pérdida de potencia perceptible?',
                                    yes: { id: 'q2', question: '¿Hay humo visible por el escape?', yes: { result: 'Posible falla en sistema de inyección o turbo.' }, no: { result: 'Verificar sensores MAF/MAP.' } },
                                    no: { id: 'q3', question: '¿El consumo de combustible ha aumentado?', yes: { result: 'Revisar sensor de oxígeno primario.' }, no: { result: 'Realizar escaneo de parámetros específicos.' } }
                                }} 
                            />
                        </motion.div>
                    )}

                    {view === 'chat' && (
                        <motion.div 
                            key="chat" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full min-h-[400px]"
                        >
                            <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-16 opacity-20">
                                        <MessageSquare className="mx-auto mb-4" size={48} />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">Asistente Experto AutoTech<br/>Listo para tu consulta</p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                                            : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            
                            <div className="relative mt-auto">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Pregunta sobre fallas, torques, diagramas..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-6 pr-16 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isStreaming || !input.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-30 disabled:bg-zinc-800"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIDiagnostic;
