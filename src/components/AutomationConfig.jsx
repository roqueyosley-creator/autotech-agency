import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Save, X, Terminal, Send, Bell, Cloud, Shield } from 'lucide-react';

/**
 * Componente de Configuración de Automatización e IA
 * Gestiona webhooks, notificaciones y persistencia de reportes.
 */
const AutomationConfig = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        webhookUrl: '',
        telegramToken: '',
        telegramChatId: '',
        autoReport: true,
        autoSave: true,
        aiEngine: 'gemini-1.5-pro',
        notificationPriority: 'high'
    });

    useEffect(() => {
        const saved = localStorage.getItem('at_automation_config');
        if (saved) {
            try {
                setConfig(prev => ({ ...prev, ...JSON.parse(saved) }));
            } catch (e) {
                console.error("Error loading automation config:", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('at_automation_config', JSON.stringify(config));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-xl text-blue-500">
                            <Bot size={20} />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">AutoTech <span className="text-blue-500 text-sm">AGENT CONFIG</span></h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Webhook Configuration */}
                    <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Cloud size={14} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Webhooks (n8n / Zapier)</span>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-2 px-1">Endpoint URL</label>
                            <input 
                                type="text" 
                                value={config.webhookUrl} 
                                onChange={e => setConfig({...config, webhookUrl: e.target.value})}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-blue-400 focus:border-blue-500/50 outline-none transition-all font-mono"
                                placeholder="https://api.vuestro-server.com/hook"
                            />
                        </div>
                    </div>

                    {/* AI Engine Selection */}
                    <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Motor de Análisis</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['gemini-1.5-pro', 'gpt-4o'].map(model => (
                                <button 
                                    key={model}
                                    onClick={() => setConfig({...config, aiEngine: model})}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${config.aiEngine === model ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                                >
                                    {model}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Automation Toggles */}
                    <div className="space-y-3">
                        {[
                            { id: 'autoReport', label: 'Reporte Automático', icon: <Send size={14} />, desc: 'Genera PDF al terminar el scan' },
                            { id: 'autoSave', label: 'Persistencia en Cloud', icon: <Shield size={14} />, desc: 'Guarda histórico en Supabase' }
                        ].map(item => (
                            <div key={item.id} className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${config[item.id] ? 'bg-blue-600/10 text-blue-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{item.label}</p>
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{item.desc}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setConfig({...config, [item.id]: !config[item.id]})}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config[item.id] ? 'bg-blue-600' : 'bg-zinc-800'}`}
                                >
                                    <motion.div 
                                        animate={{ x: config[item.id] ? 24 : 0 }}
                                        className="w-4 h-4 bg-white rounded-full shadow-md"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={handleSave} 
                        className="flex-1 bg-white text-black py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={16} /> Guardar Cambios
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AutomationConfig;