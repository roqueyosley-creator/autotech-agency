import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Flame, Wind, CircleStop, 
    Snowflake, Settings2, ShieldAlert,
    AlertCircle, Search, Info
} from 'lucide-react';
import { ACTUATION_COMMANDS } from '../utils/actuationCommands';
import ActuationCard from './ActuationCard';
import SafetyModal from './SafetyModal';
import ActuationMonitor from './ActuationMonitor';

const BidirectionalControl = ({ connected, brand, vehicleType }) => {
    const [activeCategory, setActiveCategory] = useState('ENGINE');
    const [activeActuation, setActiveActuation] = useState(null);
    const [showSafety, setShowSafety] = useState(false);
    const [pendingActuation, setPendingActuation] = useState(null);
    const [logs, setLogs] = useState([]);
    const [filterBrand, setFilterBrand] = useState(true);

    const categories = Object.keys(ACTUATION_COMMANDS).map(key => ({
        id: key,
        ...ACTUATION_COMMANDS[key]
    }));

    const handleRequestExecute = (actuation) => {
        setPendingActuation(actuation);
        setShowSafety(true);
    };

    const handleConfirmSafety = () => {
        const actuation = pendingActuation;
        setShowSafety(false);
        setActiveActuation(actuation);
        
        // Simular ejecución (En producción llamaría a bluetoothService.sendPID)
        const logEntry = {
            timestamp: new Date().toLocaleTimeString(),
            actuation_name: actuation.name,
            command: `ATSH ${actuation.commands.universal?.header || '7E0'}\r${actuation.commands.universal?.service}${actuation.commands.universal?.did}`,
            response: actuation.expected_response || "6F 10 01",
            success: true
        };
        
        setLogs(prev => [...prev, logEntry]);
    };

    const handleStopActuation = (actuation) => {
        setActiveActuation(null);
        setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            actuation_name: `${actuation.name} (DETENIDO)`,
            command: `STOP: ${actuation.stop_command?.service || '2F'}`,
            response: "OK - Control Liberado",
            success: true
        }]);
    };

    const handleGlobalStop = () => {
        if (activeActuation) handleStopActuation(activeActuation);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c]">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-[1.25rem] border border-blue-500/30">
                        <Settings2 className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Control Bidireccional</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {connected ? `CONECTADO • ${brand || 'UNIVERSAL'}` : 'DESCONECTADO'}
                            </span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleGlobalStop}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 flex items-center gap-2 border border-red-400/20"
                >
                    <CircleStop size={14} fill="currentColor" /> STOP GLOBAL
                </button>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
                {categories.map((cat) => {
                    const Icon = { Zap, Flame, Wind, CircleStop, Snowflake, Settings2 }[cat.icon] || Zap;
                    const isActive = activeCategory === cat.id;
                    
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all whitespace-nowrap border ${
                                isActive 
                                ? `bg-[${cat.color}]/10 border-[${cat.color}]/30 text-white shadow-lg` 
                                : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                            }`}
                            style={isActive ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}40`, color: cat.color } : {}}
                        >
                            <Icon size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
                            <span className="text-[10px] opacity-40 font-bold ml-2 bg-black/40 px-2 rounded-full">
                                {cat.actuations.length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Info size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Se recomienda motor en ralentí y vehículo estacionado.</p>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">Filtrar por marca</span>
                        <div 
                            onClick={() => setFilterBrand(!filterBrand)}
                            className={`w-10 h-5 rounded-full transition-all relative ${filterBrand ? 'bg-blue-600' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${filterBrand ? 'left-6' : 'left-1'}`} />
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACTUATION_COMMANDS[activeCategory].actuations.map((act) => (
                        <ActuationCard 
                            key={act.id}
                            actuation={act}
                            brand={brand}
                            connected={connected}
                            onExecute={handleRequestExecute}
                            onStop={handleStopActuation}
                            activeActuation={activeActuation}
                        />
                    ))}
                </div>
            </div>

            {/* Terminal Monitor */}
            <ActuationMonitor logs={logs} onClear={() => setLogs([])} />

            {/* Modals */}
            {pendingActuation && (
                <SafetyModal 
                    actuation={pendingActuation}
                    isOpen={showSafety}
                    onConfirm={handleConfirmSafety}
                    onCancel={() => setShowSafety(false)}
                />
            )}
        </div>
    );
};

export default BidirectionalControl;
