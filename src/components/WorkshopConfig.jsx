import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Store, MapPin, Phone, Mail, Globe, DollarSign, Image as ImageIcon } from 'lucide-react';

const WorkshopConfig = ({ isOpen, onClose, onSave }) => {
    const [config, setConfig] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        currency: 'USD',
        default_tax: 16,
        logo: null,
        tagline: 'Diagnóstico Automotriz Profesional',
        report_start_num: 1001
    });

    useEffect(() => {
        const saved = localStorage.getItem('workshop_config');
        if (saved) setConfig(JSON.parse(saved));
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('workshop_config', JSON.stringify(config));
        onSave(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
                                <Store size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Configuración del Taller</h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Identidad de Marca y Reportes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Nombre del Taller</span>
                                    <input 
                                        type="text" name="name" value={config.name} onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Ej: AutoTech Performance"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Slogan / Tagline</span>
                                    <input 
                                        type="text" name="tagline" value={config.tagline} onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </label>
                            </div>
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Teléfono de Negocio</span>
                                    <input 
                                        type="text" name="phone" value={config.phone} onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Email</span>
                                    <input 
                                        type="email" name="email" value={config.email} onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </label>
                            </div>
                        </div>

                        <label className="block">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Dirección Física</span>
                            <textarea 
                                name="address" value={config.address} onChange={handleChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
                                placeholder="Calle, Número, Colonia, Ciudad..."
                            />
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <label className="block">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Moneda</span>
                                <select 
                                    name="currency" value={config.currency} onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="MXN">MXN ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="COP">COP ($)</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">IVA (%)</span>
                                <input 
                                    type="number" name="default_tax" value={config.default_tax} onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Folio Inicial</span>
                                <input 
                                    type="number" name="report_start_num" value={config.report_start_num} onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-zinc-900/50">
                        <button 
                            onClick={handleSave}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
                        >
                            <Save size={18} /> Guardar Configuración
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WorkshopConfig;
