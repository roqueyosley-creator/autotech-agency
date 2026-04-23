import React, { useState } from 'react';
import { Battery, Activity, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DtcDetailCard from './DtcDetailCard';

/**
 * Tarjeta de Estado Individual
 */
const StatusCard = ({ title, value, unit, icon: Icon, color, trend }) => {
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
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity blur-3xl -mr-16 -mt-16 
        ${color === 'blue' ? 'bg-blue-500' : 
          color === 'amber' ? 'bg-amber-500' : 
          color === 'emerald' ? 'bg-emerald-500' : 
          color === 'purple' ? 'bg-purple-500' : 'bg-red-500'}`} 
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-zinc-800 border border-zinc-700`}>
          <Icon className={`w-6 h-6 ${colorStyles[color].split(' ')[0]}`} />
        </div>
        {trend && (
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${colorStyles[color]}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-widest">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{value}</span>
          <span className="text-zinc-600 text-sm font-bold uppercase">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

const OBDDashboard = ({ data, onSaveReport, saving }) => {
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
        <div className="flex flex-col min-h-screen bg-black text-zinc-100 p-4 font-sans selection:bg-blue-500/30">
            {/* Ambient Background Grid - Reduced for mobile density */}
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

            <div className="max-w-md mx-auto relative z-10 w-full">
                <header className="mb-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)]" />
                            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Scanner</h1>
                            <span className="text-blue-500 font-light italic text-xl tracking-widest uppercase">Live</span>
                        </div>
                        <div className="bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-bold text-zinc-400 uppercase">Pro Link</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onSaveReport}
                        disabled={saving}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3
                            ${saving ? 'bg-zinc-900 text-zinc-600' : 'bg-white text-black active:scale-95 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.1)]'}
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
                    
                    <p className="text-zinc-600 text-[8px] uppercase tracking-widest font-black text-center italic">Hardware HAL: {statusData.protocol}</p>
                </header>

                <main className="grid grid-cols-2 gap-4">
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

                {/* Listado Pro de Errores */}
                {statusData.codes.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Módulos con Errores ({statusData.codes.length})</h3>
                            <div className="h-[1px] flex-1 bg-zinc-800 ml-4" />
                        </div>
                        
                        <div className="space-y-3">
                            {statusData.codes.map(code => (
                                <button 
                                    key={code.id}
                                    onClick={() => setSelectedDtc(code)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black italic">
                                            !
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-black italic tracking-tighter text-white">{code.id}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase truncate max-w-[180px]">{code.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {statusData.codes.length === 0 && (
                  <div className="mt-8 p-6 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center">
                    <p className="text-zinc-600 text-sm font-medium tracking-widest uppercase italic">Diagnostic Scan: All systems clear</p>
                  </div>
                )}
            </div>

            {/* Modal de Detalle DTC */}
            <AnimatePresence>
                {selectedDtc && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md relative"
                        >
                            <button 
                                onClick={() => setSelectedDtc(null)}
                                className="absolute -top-12 right-0 text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                            >
                                [ Cerrar ]
                            </button>
                            <DtcDetailCard 
                                dtc={selectedDtc} 
                                freezeFrame={statusData.freezeFrames[selectedDtc.id]} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OBDDashboard;
