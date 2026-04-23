import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Share2, FileText, RefreshCcw } from 'lucide-react';

const ServiceResult = ({ success, serviceName, onRetry, onManual, onClose }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
            >
                {success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
            </motion.div>

            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">
                {success ? '¡Éxito Total!' : 'Error de Conexión'}
            </h3>
            <p className="text-zinc-500 text-xs mb-12 max-w-xs leading-relaxed">
                {success 
                    ? `El procedimiento de ${serviceName} se ha completado correctamente en el vehículo.`
                    : `No se pudo completar el reset via OBD. Verifica el adaptador o intenta el modo manual.`}
            </p>

            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                {success ? (
                    <>
                        <button className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            <FileText size={14} /> Guardar en Historial
                        </button>
                        <button onClick={onClose} className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Finalizar
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onRetry} className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            <RefreshCcw size={14} /> Reintentar OBD
                        </button>
                        <button onClick={onManual} className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Ver Modo Manual
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServiceResult;
