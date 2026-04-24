import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Sparkles, AlertTriangle, ShieldCheck, 
    Thermometer, Zap, Activity, Brain, 
    ChevronDown, BookOpen, MessageSquare, ListTree
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import ProbabilityCard from './ProbabilityCard';
import DiagnosticTree from './DiagnosticTree';

const AIDiagnostic = ({ vehicleData, obdData, dtcs }) => {
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
        // Escuchar si el agente analítico ya generó un diagnóstico
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
        <div className="flex flex-col h-full bg-[#0a0a0c] text-white">
            {/* Header / Stats Bar */}
            <div className="p-4 border-b border-white/5 bg-white/2 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <Brain className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black tracking-tighter uppercase italic">AutoTech AI Engine</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Monitoring</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['summary', 'tree', 'chat'].map(t => (
                        <button
                            key={t}
                            onClick={() => setView(t)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                ${view === t ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}
                            `}
                        >
                            {t === 'summary' ? 'Overview' : t === 'tree' ? 'Logic Tree' : 'Expert Chat'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {view === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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
                                    <p className="text-sm text-blue-400 font-bold animate-pulse">SINCRO DE DATOS Y ANÁLISIS GEMINI 1.5 PRO...</p>
                                </div>
                            ) : diagnosis ? (
                                <>
                                    {/* Diagnosis Card */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                                                <ShieldCheck className="text-green-400" size={14} />
                                                <span className="text-[10px] font-bold">CONFIDENCIA: {diagnosis.confidence_score}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-blue-400 mb-2 font-black italic text-xs tracking-widest">
                                            <Sparkles size={14} /> DIAGNÓSTICO MAESTRO
                                        </div>
                                        <p className="text-xl font-bold leading-tight mb-4">
                                            {diagnosis.diagnosis_summary}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                                                diagnosis.urgency === 'immediate' ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'
                                            }`}>
                                                <AlertTriangle className={diagnosis.urgency === 'immediate' ? 'text-red-400' : 'text-orange-400'} />
                                                <div>
                                                    <div className="text-[10px] font-bold opacity-40 uppercase">Prioridad</div>
                                                    <div className="text-sm font-black uppercase">{diagnosis.urgency}</div>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl border bg-white/5 border-white/10 flex items-center gap-3">
                                                <Zap className="text-yellow-400" />
                                                <div>
                                                    <div className="text-[10px] font-bold opacity-40 uppercase">Costo Estimado</div>
                                                    <div className="text-sm font-black uppercase">{diagnosis.estimated_cost.min}-{diagnosis.estimated_cost.max} USD</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Probable Causes */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-1">Causas Probables y Pruebas</h3>
                                        {diagnosis.probable_causes.map((cause, idx) => (
                                            <ProbabilityCard key={idx} cause={cause} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Brain className="mx-auto text-white/10 mb-4" size={48} />
                                    <h3 className="text-lg font-bold text-white/60">No hay diagnóstico activo</h3>
                                    <button onClick={runDiagnosis} className="mt-4 px-6 py-2 bg-blue-600 rounded-full font-bold text-sm">
                                        Iniciar Análisis de IA
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {view === 'tree' && (
                        <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                            className="flex flex-col h-[500px]"
                        >
                            <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-12 text-white/20">
                                        <MessageSquare className="mx-auto mb-2" size={32} />
                                        <p>Soy AutoTech AI, tu experto de confianza.<br/>¿En qué puedo ayudarte hoy?</p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Pregunta sobre fallas, torques, diagramas..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isStreaming}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
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
