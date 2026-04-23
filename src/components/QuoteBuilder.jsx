import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, FileText, Send, Share2, DollarSign, Clock, Wrench, Settings } from 'lucide-react';
import { calculateQuoteSummary } from '../utils/quoteCalculator';

const QuoteBuilder = ({ vehicleData, dtcs, onGenerateReport, onOpenConfig }) => {
    const [items, setItems] = useState([]);
    const [taxRate, setTaxRate] = useState(16);
    const [discount, setDiscount] = useState(0);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [notes, setNotes] = useState('');
    const [workshop, setWorkshop] = useState({});

    useEffect(() => {
        const savedWorkshop = localStorage.getItem('workshop_config');
        if (savedWorkshop) {
            const parsed = JSON.parse(savedWorkshop);
            setWorkshop(parsed);
            setTaxRate(parsed.default_tax || 16);
        }

        // Auto-poblar desde DTCs
        if (dtcs && dtcs.length > 0 && items.length === 0) {
            const initialItems = dtcs.map(dtc => ({
                id: Math.random().toString(36).substr(2, 9),
                description: `Corrección de falla: ${dtc.code} - ${dtc.description_es || dtc.description}`,
                labor: 50,
                parts: 0,
                included: true
            }));
            setItems(initialItems);
        }
    }, [dtcs]);

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            description: '',
            labor: 0,
            parts: 0,
            included: true
        }]);
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const summary = calculateQuoteSummary(items, taxRate, discount, workshop);

    const quickActions = [
        { label: 'Diagnóstico Gral.', labor: 50 },
        { label: 'Mano de Obra Hr', labor: 35 },
        { label: 'Escáner Pro', labor: 25 },
        { label: 'Limpieza Iny.', labor: 80 }
    ];

    return (
        <div className="flex flex-col gap-8 pb-32 max-w-4xl mx-auto p-4">
            {/* Header / Workshop Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic">
                        {workshop.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{workshop.name || 'AutoTech PRO'}</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{workshop.address || 'Configura la dirección de tu taller'}</p>
                    </div>
                </div>
                <button 
                    onClick={onOpenConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <Settings size={14} /> Configurar Taller
                </button>
            </div>

            {/* Customer Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Cliente</span>
                    <input 
                        type="text" placeholder="Nombre completo" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                        className="w-full bg-transparent border-b border-zinc-800 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">WhatsApp</span>
                    <input 
                        type="text" placeholder="+52 ..." value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                        className="w-full bg-transparent border-b border-zinc-800 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Email</span>
                    <input 
                        type="email" placeholder="cliente@correo.com" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}
                        className="w-full bg-transparent border-b border-zinc-800 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Quote Items */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/80">
                    <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Conceptos de Reparación</h3>
                    <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Plus size={14} /> Agregar
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col md:flex-row items-center gap-4 p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl group"
                            >
                                <div className="flex-1 w-full">
                                    <input 
                                        type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                                        placeholder="Descripción del trabajo o refacción..."
                                        className="w-full bg-transparent text-white text-xs font-bold placeholder-zinc-700 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="relative">
                                        <Wrench size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input 
                                            type="number" value={item.labor} onChange={e => updateItem(item.id, 'labor', e.target.value)}
                                            className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Labor"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Settings size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input 
                                            type="number" value={item.parts} onChange={e => updateItem(item.id, 'parts', e.target.value)}
                                            className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Partes"
                                        />
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-4">
                        {quickActions.map((action, i) => (
                            <button 
                                key={i}
                                onClick={() => setItems([...items, { id: Math.random().toString(36).substr(2,9), description: action.label, labor: action.labor, parts: 0, included: true }])}
                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 transition-all uppercase tracking-widest"
                            >
                                + {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Table */}
                <div className="p-8 bg-zinc-950/80 border-t border-white/5">
                    <div className="max-w-xs ml-auto space-y-3">
                        <div className="flex justify-between text-xs font-bold text-zinc-500">
                            <span>SUBTOTAL</span>
                            <span className="text-white font-mono">${summary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                            <span>IVA ({taxRate}%)</span>
                            <span className="text-white font-mono">${summary.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-emerald-500">
                            <span>DESCUENTO</span>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" value={discount} onChange={e => setDiscount(e.target.value)}
                                    className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-right focus:outline-none"
                                />
                                <span className="font-mono">-${summary.discount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm font-black text-white italic uppercase tracking-widest">Total Final</span>
                            <span className="text-2xl font-black text-blue-500 font-mono tracking-tighter">
                                ${summary.total.toFixed(2)} <span className="text-[10px]">{summary.currency}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem]">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Observaciones del Técnico</h3>
                <textarea 
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Ej: Se recomienda revisión de frenos en el próximo servicio..."
                    className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 text-white text-xs min-h-[100px] focus:outline-none focus:border-blue-500/50"
                />
            </div>

            {/* Final Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                    onClick={() => onGenerateReport({ customer, items, taxRate, discount, notes })}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl transition-all shadow-xl shadow-blue-900/20"
                >
                    <FileText size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Generar PDF</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl transition-all">
                    <Share2 size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-3xl transition-all">
                    <Send size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-3xl transition-all">
                    <DollarSign size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Guardar</span>
                </button>
            </div>
        </div>
    );
};

export default QuoteBuilder;
