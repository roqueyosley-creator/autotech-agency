import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Send, Bell, Shield, Terminal, Save, CheckCircle2 } from 'lucide-react';
import { automationAgent } from '../agents/automationAgent';

const AutomationConfig = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        webhookUrl: '',
        telegramToken: '',
        telegramChatId: '',
        autoReport: true,
        autoSave: true
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfig({
                webhookUrl: localStorage.getItem('agent_webhook_url') || '',
                telegramToken: localStorage.getItem('agent_telegram_token') || '',
                telegramChatId: localStorage.getItem('agent_telegram_chat_id') || '',
                autoReport: localStorage.getItem('agent_autoReport') !== 'false',
                autoSave: localStorage.getItem('agent_autoSave') !== 'false'
            });
        }
    }, [isOpen]);

    const handleSave = () => {
        automationAgent.updateConfig(config);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Agente de Automatización</h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Configuración de Flujos Inteligentes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Switches de Comportamiento */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Terminal size={12} /> Comportamiento Automático
                            </h3>
                            
                            <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Bell size={14} /></div>
                                    <span className="text-xs font-bold text-zinc-200">Generar Reporte PDF</span>
                                </div>
                                <button 
                                    onClick={() => setConfig(prev => ({ ...prev, autoReport: !prev.autoReport }))}
                                    className={`w-10 h-5 rounded-full transition-all duration-300 relative ${config.autoReport ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoReport ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Shield size={14} /></div>
                                    <span className="text-xs font-bold text-zinc-200">Guardado Silencioso en Nube</span>
                                </div>
                                <button 
                                    onClick={() => setConfig(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                                    className={`w-10 h-5 rounded-full transition-all duration-300 relative ${config.autoSave ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoSave ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Configuración de Webhooks */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Send size={12} /> Canales de Notificación
                            </h3>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Webhook URL (n8n / Make / Custom)</span>
                                    <input 
                                        type="text" 
                                        value={config.webhookUrl}
                                        onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-700"
                                        placeholder="https://n8n.tu-instancia.com/webhook/..."
                                    />
                                </label>

                                <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Send size={10} /> Configuración Telegram Bot
                                    </p>
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            value={config.telegramToken}
                                            onChange={(e) => setConfig(prev => ({ ...prev, telegramToken: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-[10px] focus:outline-none focus:border-blue-500"
                                            placeholder="Bot API Token (de BotFather)"
                                        />
                                        <input 
                                            type="text" 
                                            value={config.telegramChatId}
                                            onChange={(e) => setConfig(prev => ({ ...prev, telegramChatId: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-[10px] focus:outline-none focus:border-blue-500"
                                            placeholder="Chat ID / Group ID"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-zinc-900/50">
                        <button 
                            onClick={handleSave}
                            disabled={showSuccess}
                            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                                showSuccess 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                            }`}
                        >
                            {showSuccess ? (
                                <><CheckCircle2 size={18} /> Configuración Guardada</>
                            ) : (
                                <><Save size={18} /> Aplicar Automatización</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AutomationConfig;
