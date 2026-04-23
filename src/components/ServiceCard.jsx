import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({ service, brand, vehicleType, fuelType, onSelect }) => {
    const Icon = LucideIcons[service.icon] || LucideIcons.Tool;
    const isCompatible = (!service.fuel_type || service.fuel_type.includes(fuelType)) &&
                         (!service.vehicle_types || service.vehicle_types.includes(vehicleType));

    const brandMethod = service.brands[brand.toLowerCase()] || service.brands.universal;
    const hasOBD = brandMethod?.methods.some(m => m.commands);

    const difficultyColor = {
        easy: 'text-emerald-500 bg-emerald-500/10',
        medium: 'text-amber-500 bg-amber-500/10',
        advanced: 'text-red-500 bg-red-500/10'
    };

    return (
        <motion.div
            whileHover={isCompatible ? { scale: 1.02, y: -5 } : {}}
            whileTap={isCompatible ? { scale: 0.98 } : {}}
            onClick={() => isCompatible && onSelect(service)}
            className={`relative p-6 rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                isCompatible 
                ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' 
                : 'bg-zinc-900/20 border-zinc-900 opacity-40 grayscale cursor-not-allowed'
            }`}
            style={{ 
                borderColor: isCompatible ? `${service.color}33` : undefined,
                boxShadow: isCompatible ? `0 10px 30px -10px ${service.color}15` : undefined
            }}
        >
            {/* Background Glow */}
            {isCompatible && (
                <div 
                    className="absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-20 rounded-full"
                    style={{ backgroundColor: service.color }}
                />
            )}

            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                        <Icon size={24} />
                    </div>
                    {isCompatible && (
                        <div className="flex flex-col items-end gap-1">
                            {hasOBD ? (
                                <span className="text-[7px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">OBD Disponible</span>
                            ) : (
                                <span className="text-[7px] font-black bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Manual</span>
                            )}
                        </div>
                    )}
                </div>

                <h4 className="text-white font-black text-sm uppercase italic tracking-tight mb-2">{service.name}</h4>
                <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-2 mb-6">{service.description}</p>

                <div className="mt-auto flex items-center justify-between">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${difficultyColor[service.difficulty]}`}>
                        {service.difficulty === 'easy' ? 'Fácil' : service.difficulty === 'medium' ? 'Medio' : 'Pro'}
                    </span>
                    <div className="flex items-center gap-1.5 text-zinc-600 text-[9px] font-bold">
                        <LucideIcons.Clock size={10} />
                        {service.estimated_time}
                    </div>
                </div>
            </div>

            {!isCompatible && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <span className="bg-zinc-800 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-xl">
                        {service.fuel_type?.includes('diesel') ? 'Solo Diésel' : 'Incompatible'}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default ServiceCard;
