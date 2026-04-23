import React from 'react';
import { motion } from 'framer-motion';
import { Info, Tool, CheckCircle2 } from 'lucide-react';

const ProbabilityCard = ({ cause }) => {
    const { component, probability, explanation, test_to_confirm, expected_value, tool_needed } = cause;

    const getProbabilityColor = (prob) => {
        if (prob >= 80) return 'text-red-400 border-red-500/30 bg-red-500/10';
        if (prob >= 50) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    };

    const colorClasses = getProbabilityColor(probability);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${colorClasses} mb-4 backdrop-blur-md`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg uppercase tracking-wider">{component}</h4>
                <div className="text-2xl font-black">{probability}%</div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 opacity-90 leading-relaxed">
                {explanation}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold">
                        <Tool size={14} /> PRUEBA RECOMENDADA
                    </div>
                    <div className="text-xs text-white/80">{test_to_confirm}</div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-green-400 mb-1 font-bold">
                        <CheckCircle2 size={14} /> VALOR ESPERADO
                    </div>
                    <div className="text-xs text-white/80">{expected_value}</div>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold tracking-widest">
                <Info size={12} /> Requiere: {tool_needed}
            </div>
        </motion.div>
    );
};

export default ProbabilityCard;
