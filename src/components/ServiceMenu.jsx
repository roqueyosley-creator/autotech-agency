import React, { useState } from 'react';
import { Search, Filter, Fuel, Car, Settings2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICE_COMMANDS } from '../utils/serviceCommands';
import ServiceCard from './ServiceCard';

/**
 * Panel de Servicios de Mantenimiento Profesional
 */
const ServiceMenu = ({ brand, vehicleType, fuelType, onSelectService, connected }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const categories = [
        { id: 'all', name: 'Todos' },
        { id: 'engine', name: 'Motor' },
        { id: 'emission', name: 'Emisión' },
        { id: 'brakes', name: 'Frenos' },
        { id: 'chassis', name: 'Chasis' },
        { id: 'electrical', name: 'Eléctrico' }
    ];

    const services = Object.values(SERVICE_COMMANDS).filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || service.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-8 pb-24 p-6">
            {/* Header / Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Servicios de Reset</h2>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <Car size={12} className="text-blue-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{brand}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <Fuel size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{fuelType}</span>
                        </div>
                    </div>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar servicio (aceite, dpf, frenos...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-xs"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveFilter(cat.id)}
                        className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === cat.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {services.map((service, idx) => (
                        <ServiceCard 
                            key={service.id}
                            service={service}
                            brand={brand}
                            vehicleType={vehicleType}
                            fuelType={fuelType}
                            onSelect={onSelectService}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {services.length === 0 && (
                <div className="py-20 text-center opacity-20">
                    <Settings2 className="mx-auto mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No se encontraron servicios compatibles</p>
                </div>
            )}
        </div>
    );
};

export default ServiceMenu;
