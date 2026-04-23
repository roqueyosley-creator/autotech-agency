import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Cpu, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomECUNode = ({ data }) => {
  const { name, status, dtc_count, type, address } = data;
  
  const isGateway = type === 'gateway';
  const hasDtc = dtc_count > 0;
  
  const statusColors = {
    online: 'border-emerald-500/50 shadow-emerald-500/10',
    warning: 'border-amber-500/50 shadow-amber-500/10',
    critical: 'border-red-500/50 shadow-red-500/10',
    offline: 'border-zinc-700/50 grayscale'
  };

  const currentStatus = hasDtc ? 'critical' : status || 'online';

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-3 rounded-2xl bg-zinc-900/80 backdrop-blur-md border-2 ${statusColors[currentStatus]} min-w-[160px] shadow-2xl relative overflow-hidden group`}
    >
      {/* Background Pulse for Active Nodes */}
      {currentStatus !== 'offline' && (
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${hasDtc ? 'from-red-500' : 'from-blue-500'}`} />
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 rounded-xl ${isGateway ? 'bg-blue-600/20 text-blue-500' : hasDtc ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
          {isGateway ? <Zap size={18} /> : <Cpu size={18} />}
        </div>
        
        <div className="flex-1">
          <h3 className="text-[10px] font-black text-white uppercase tracking-tighter leading-none mb-1">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-zinc-500">{address}</span>
            {hasDtc && (
              <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">
                {dtc_count} DTC
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {hasDtc ? (
            <AlertTriangle size={12} className="text-red-500 animate-pulse" />
          ) : (
            <CheckCircle2 size={12} className="text-emerald-500" />
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-zinc-700 !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-700 !border-none !w-2 !h-2" />
    </motion.div>
  );
};

export default memo(CustomECUNode);
