import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bike, ShieldCheck, Zap } from 'lucide-react';
import AutoTechIcon from './AutoTechIcon';

const VehicleTypeSelector = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <AutoTechIcon size={120} className="mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          AutoTech <span className="text-blue-500">PRO</span>
        </h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
          Universal Diagnostic Intelligence
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        {/* Car Selection */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('car')}
          className="group relative p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all"
        >
          <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-100 transition-opacity">
            <Zap className="text-blue-500" size={20} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/50 transition-all">
              <Car size={40} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-2">Automóvil</h3>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">OBD-II / CAN-BUS / Hybrid</p>
          </div>
        </motion.button>

        {/* Motorcycle Selection */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('moto')}
          className="group relative p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all"
        >
          <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-100 transition-opacity">
            <Zap className="text-blue-500" size={20} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/50 transition-all">
              <Bike size={40} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-2">Motocicleta</h3>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Euro 4 & 5 / K-Line / UDS</p>
          </div>
        </motion.button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
        <ShieldCheck size={12} className="text-blue-500/50" />
        Sistemas de Seguridad y Datos Cifrados
      </div>
    </div>
  );
};

export default VehicleTypeSelector;
