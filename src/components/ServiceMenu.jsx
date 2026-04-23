import React from 'react';
import { motion } from 'framer-motion';
import { 
    Droplet, 
    Lock, 
    Battery, 
    Compass, 
    Wind, 
    Key, 
    RotateCcw,
    Zap
} from 'lucide-react';

/**
 * Menú de Funciones Especiales (Servicio y Mantenimiento)
 * Inspirado en Launch X431 Pro
 */
const ServiceMenu = ({ onFunctionClick }) => {
    const services = [
        { id: 'oil', name: 'Oil Reset', icon: Droplet, color: 'text-amber-500', desc: 'Reseteo vida aceite' },
        { id: 'epb', name: 'EPB Reset', icon: Lock, color: 'text-red-500', desc: 'Servicio frenos elect.' },
        { id: 'bms', name: 'Battery', icon: Battery, color: 'text-emerald-500', desc: 'Registro batería' },
        { id: 'sas', name: 'SAS Match', icon: Compass, color: 'text-blue-500', desc: 'Ángulo de dirección' },
        { id: 'dpf', name: 'DPF Regen', icon: Wind, color: 'text-zinc-400', desc: 'Regen. Partículas' },
        { id: 'key', name: 'IMMO', icon: Key, color: 'text-purple-500', desc: 'Prog. de Llaves' },
        { id: 'tpms', name: 'TPMS', icon: Zap, color: 'text-yellow-500', desc: 'Sensores de llantas' },
        { id: 'abs', name: 'ABS Bleed', icon: RotateCcw, color: 'text-blue-400', desc: 'Purga de frenos' },
    ];

    return (
        <div className="p-6">
            <header className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Funciones Especiales</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Mantenimiento & Reseteos Profesionales</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <motion.button
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onFunctionClick?.(service.id)}
                            className="group flex flex-col p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-left transition-all hover:bg-blue-600/10 hover:border-blue-500/50 active:scale-95"
                        >
                            <div className={`p-3 bg-zinc-800 rounded-2xl w-fit mb-4 group-hover:rotate-12 transition-transform ${service.color}`}>
                                <Icon size={20} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">{service.name}</h4>
                            <p className="text-[10px] text-zinc-600 font-medium">{service.desc}</p>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default ServiceMenu;
