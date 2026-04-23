import React, { useState } from 'react';
import { Search, BookOpen, AlertCircle, ChevronRight, X } from 'lucide-react';
import { dtcService } from '../services/dtcService';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Buscador de Códigos de Falla (DTC)
 */
const DtcLibrary = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query) return;

        setLoading(true);
        const data = await dtcService.searchCodes(query);
        setResults(data);
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative group">
                <form onSubmit={handleSearch}>
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text"
                        placeholder="Buscar P0101, Mezcla, ABS..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                    />
                </form>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                <AnimatePresence mode='popLayout'>
                    {results.map((dtc, index) => (
                        <motion.div
                            key={dtc.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedCode(dtc)}
                            className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black font-mono">
                                    {dtc.code.substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold font-mono">{dtc.code}</h4>
                                    <p className="text-zinc-500 text-xs line-clamp-1">{dtc.description}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {results.length === 0 && !loading && query && (
                    <div className="py-12 text-center">
                        <AlertCircle className="mx-auto text-zinc-700 mb-4" size={40} />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No se encontraron resultados</p>
                    </div>
                )}
            </div>

            {/* Code Detail Modal */}
            <AnimatePresence>
                {selectedCode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-zinc-950 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-zinc-800 p-8 relative max-h-[90vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setSelectedCode(null)}
                                className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-red-500/10 rounded-2xl text-red-500">
                                    <BookOpen size={32} />
                                </div>
                                <div>
                                    <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">{selectedCode.category || 'Motor'}</span>
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">{selectedCode.code}</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h5 className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest">Descripción</h5>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{selectedCode.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                                        <h5 className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest">Posibles Causas</h5>
                                        <p className="text-zinc-400 text-xs leading-snug">{selectedCode.possible_causes}</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                                        <h5 className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest">Síntomas</h5>
                                        <p className="text-zinc-400 text-xs leading-snug">{selectedCode.symptoms}</p>
                                    </div>
                                </div>

                                {selectedCode.fix_steps_json && (
                                    <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl">
                                        <h5 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest">Pasos de Reparación Pro</h5>
                                        <div className="space-y-3">
                                            {selectedCode.fix_steps_json.steps?.map((step, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-zinc-300">
                                                    <span className="text-blue-500 font-black">{i+1}.</span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DtcLibrary;
