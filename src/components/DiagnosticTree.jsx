import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';

const DiagnosticTree = ({ initialTree }) => {
    const [currentNode, setCurrentNode] = useState(initialTree);
    const [history, setHistory] = useState([]);

    const handleAnswer = (answer) => {
        setHistory([...history, currentNode]);
        setCurrentNode(currentNode[answer]);
    };

    const goBack = () => {
        const last = history.pop();
        setHistory([...history]);
        setCurrentNode(last);
    };

    if (!currentNode) return null;

    return (
        <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6">
                {history.length > 0 && (
                    <button 
                        onClick={goBack}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Flujo de Diagnóstico Guiado
                </h3>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNode.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[200px] flex flex-col justify-center"
                >
                    {currentNode.question ? (
                        <>
                            <p className="text-lg text-white/90 mb-8 font-medium">
                                {currentNode.question}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAnswer('yes')}
                                    className="p-4 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    SÍ <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => handleAnswer('no')}
                                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    NO <ChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <CheckCircle className="text-green-400" size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">Conclusión</h4>
                            <p className="text-gray-400 max-w-sm mx-auto">
                                {currentNode.result}
                            </p>
                            <button
                                onClick={() => { setCurrentNode(initialTree); setHistory([]); }}
                                className="mt-8 text-blue-400 font-bold hover:underline"
                            >
                                Reiniciar diagnóstico
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full ${i <= history.length ? 'bg-blue-500' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default DiagnosticTree;
