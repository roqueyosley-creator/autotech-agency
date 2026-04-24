import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Battery, ShieldCheck, ChevronRight } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
import DtcDetailCard from './DtcDetailCard';
import ExpertInsightCard from './ExpertInsightCard';

/**
 * Tarjeta de Estado Individual
 */
const StatusCard = ({ title, value, unit, icon: Icon, color, trend }) => {
  const { isMobile } = useWindowSize();
  const colorStyles = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10 group-hover:opacity-20 transition-opacity blur-3xl -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 
        ${color === 'blue' ? 'bg-blue-500' : 
          color === 'amber' ? 'bg-amber-500' : 
          color === 'emerald' ? 'bg-emerald-500' : 
          color === 'purple' ? 'bg-purple-500' : 'bg-red-500'}`} 
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2 sm:p-3 rounded-xl bg-zinc-800 border border-zinc-700`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorStyles[color].split(' ')[0]}`} />
        </div>
        {trend && (
          <span className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${colorStyles[color]}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-zinc-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter tabular-nums">{value}</span>
          <span className="text-zinc-600 text-[10px] sm:text-sm font-bold uppercase">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

const OBDDashboard = ({ data, onSaveReport, saving, expertInsight }) => {
    const { isMobile, isDesktop } = useWindowSize();
    const [selectedDtc, setSelectedDtc] = useState(null);

    const statusData = data || {
        battery: 0,
        engineLoad: 0,
        temp: 0,
        rpm: 0,
        emissions: "Checking...",
        dtcs: 0,
        codes: [],
        freezeFrames: {},
        protocol: "Searching..."
    };

    return (
        <div className="flex flex-col text-zinc-100 font-sans selection:bg-blue-500/30">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">Scanner</h1>
                            <span className="text-blue-500 font-light italic text-xl sm:text-2xl tracking-widest uppercase animate-pulse">Live</span>
                        </div>
                        <p className="text-zinc-600 text-[8px] sm:text-[10px] uppercase tracking-widest font-black italic mt-1">
                            Hardware HAL: {statusData.protocol}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="hidden sm:flex bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl items-center gap-3 h-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Enlace Estable</span>
                    </div>

                    <button 
                        onClick={onSaveReport}
                        disabled={saving}
                        className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3
                            ${saving ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-xl'}
                        `}
                    >
                        {saving ? (
                            <>
                                <div className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
                                Transfiriendo...
                            </>
                        ) : (
                            <>
                                <Activity size={14} />
                                Generar Reporte Nube
                            </>
                        )}
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatusCard 
                    title="RPM Motor" 
                    value={statusData.rpm} 
                    unit="RPM" 
                    icon={Activity} 
                    color="purple"
                    trend="Live"
                />
                <StatusCard 
                    title="Temperatura" 
                    value={statusData.temp} 
                    unit="°C" 
                    icon={Activity} 
                    color="amber"
                    trend="Normal"
                />
                <StatusCard 
                    title="Voltaje" 
                    value={statusData.battery} 
                    unit="V" 
                    icon={Battery} 
                    color="blue"
                    trend="OK"
                />
                <StatusCard 
                    title="Carga Engine" 
                    value={statusData.engineLoad} 
                    unit="%" 
                    icon={Activity} 
                    color="emerald"
                    trend="Vary"
                />
            </main>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                {/* Análisis Experto del Agente */}
                <div className="lg:col-span-7">
                    <ExpertInsightCard 
                        insight={expertInsight} 
                        onConsultAI={(ins) => console.log("Consultar IA para:", ins)} 
                    />
                </div>

                {/* Listado Pro de Errores */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Módulos con Errores ({statusData.codes.length})
                        </h3>
                        <div className="h-[1px] flex-1 bg-zinc-800 ml-4" />
                    </div>
                    
                    {statusData.codes.length > 0 ? (
                        <div className="space-y-3">
                            {statusData.codes.map(code => (
                                <button 
                                    key={code.id}
                                    onClick={() => setSelectedDtc(code)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all hover:bg-zinc-900"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black italic">
                                            !
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-black italic tracking-tighter text-white">{code.id}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase truncate max-w-[150px] sm:max-w-none">
                                                {code.description || 'Falla no definida'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-center">
                            <Activity className="text-emerald-500/20 w-12 h-12 mb-4" />
                            <p className="text-zinc-600 text-[10px] font-black tracking-[0.3em] uppercase italic">
                                Sistemas Íntegros
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle DTC */}
            <AnimatePresence>
                {selectedDtc && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg relative"
                        >
                            <button 
                                onClick={() => setSelectedDtc(null)}
                                className="absolute -top-12 right-0 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                            >
                                [ Cerrar ]
                            </button>
                            <DtcDetailCard 
                                dtc={selectedDtc} 
                                freezeFrame={statusData.freezeFrames ? statusData.freezeFrames[selectedDtc.id] : null} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OBDDashboard;
