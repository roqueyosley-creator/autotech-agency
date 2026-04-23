import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const SafetyModal = ({ actuation, isOpen, onConfirm, onCancel }) => {
    const [countdown, setCountdown] = useState(actuation.safety_level === 'high' ? 10 : actuation.safety_level === 'medium' ? 5 : 3);
    const [confirmed, setConfirmed] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [checks, setChecks] = useState([]);

    const requiredText = actuation.safety_level === 'high' ? "EJECUTAR CON PRECAUCIÓN" : "CONFIRMAR";

    useEffect(() => {
        if (!isOpen) return;
        setCountdown(actuation.safety_level === 'high' ? 10 : actuation.safety_level === 'medium' ? 5 : 3);
        setConfirmed(false);
        setConfirmText('');
        setChecks([]);

        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, actuation]);

    const isReady = () => {
        if (countdown > 0) return false;
        if (!confirmed) return false;
        if (actuation.safety_level === 'high' && confirmText !== requiredText) return false;
        if (actuation.safety_level === 'medium' && confirmText !== requiredText) return false;
        return true;
    };

    if (!isOpen) return null;

    const levelStyles = {
        low: "border-green-500/30 bg-green-950/20 text-green-400",
        medium: "border-orange-500/30 bg-orange-950/20 text-orange-400",
        high: "border-red-500/30 bg-red-950/20 text-red-400"
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`w-full max-w-lg rounded-[2.5rem] border p-8 shadow-2xl ${levelStyles[actuation.safety_level]}`}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-2xl ${actuation.safety_level === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                            {actuation.safety_level === 'high' ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Protocolo de Seguridad</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nivel de Riesgo: {actuation.safety_level}</p>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-6 mb-6 border border-white/5">
                        <h3 className="font-bold text-white mb-2">{actuation.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{actuation.description}</p>
                        
                        {actuation.warning && (
                            <div className="flex gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <Info className="shrink-0" size={18} />
                                <p className="text-xs font-bold leading-relaxed">{actuation.warning}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5"
                            />
                            <span className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">
                                Confirmo que el vehículo está en posición segura, motor en las condiciones indicadas y freno de mano accionado.
                            </span>
                        </label>

                        {(actuation.safety_level === 'medium' || actuation.safety_level === 'high') && (
                            <div>
                                <p className="text-[10px] font-black uppercase mb-2 opacity-50">Escribe "{requiredText}" para habilitar:</p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                    placeholder={requiredText}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            CANCELAR
                        </button>
                        <button
                            disabled={!isReady()}
                            onClick={onConfirm}
                            className={`flex-[1.5] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden
                                ${isReady() ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
                            `}
                        >
                            {countdown > 0 ? `ESPERE (${countdown}s)` : 'EJECUTAR ACTUACIÓN'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SafetyModal;
