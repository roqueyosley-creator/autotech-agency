import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react';

const ExpertInsightCard = ({ insight, onConsultAI }) => {
    if (!insight) return null;

    const severityColors = {
        critical: 'border-red-500/50 bg-red-500/5 text-red-500',
        high: 'border-amber-500/50 bg-amber-500/5 text-amber-500',
        medium: 'border-blue-500/50 bg-blue-500/5 text-blue-500',
        info: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500'
    };

    const iconColors = {
        critical: 'bg-red-500/10 text-red-500',
        high: 'bg-amber-500/10 text-amber-500',
        medium: 'bg-blue-500/10 text-blue-500',
        info: 'bg-emerald-500/10 text-emerald-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 border rounded-[2rem] p-6 backdrop-blur-xl ${severityColors[insight.severity]} shadow-2xl relative overflow-hidden`}
        >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-20 ${iconColors[insight.severity]}`} />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${iconColors[insight.severity]}`}>
                        <Brain size={20} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">Diagnóstico Experto</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase italic tracking-tighter text-white">Sensor Fusion Engine</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${severityColors[insight.severity]}`}>
                                {insight.severity}
                            </span>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-black text-white italic tracking-tighter leading-tight mb-2">
                    {insight.diagnosis}
                </h3>
                
                <p className="text-zinc-300 text-xs font-medium leading-relaxed mb-6 opacity-80">
                    {insight.description}
                </p>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-amber-400">
                            <Lightbulb size={14} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Recomendación Técnica</p>
                            <p className="text-xs text-zinc-200 font-bold">{insight.recommendation}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => onConsultAI(insight)}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
                    >
                        <Zap size={14} className="text-blue-400 group-hover:scale-125 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Consultar IA</span>
                    </button>
                    <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors">
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ExpertInsightCard;
