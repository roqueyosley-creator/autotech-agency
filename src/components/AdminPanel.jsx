import React, { useState, useEffect } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { supabase } from '../supabaseClient';
import { Trash2, LogOut, Users, Gauge, Activity, Calendar as CalendarIcon, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OBDDashboard from './OBDDashboard';
import { useOBDScanner } from '../utils/useOBDScanner';
import { diagnosticService } from '../services/diagnosticService';

const AdminPanel = () => {
  const { isMobile, isTablet } = useWindowSize();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('contactos'); // 'contactos' | 'obd'
  const [savingReport, setSavingReport] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedVin, setSelectedVin] = useState('VIN789456123'); // VIN de demo por defecto
  
  // Hook de escaneo OBD activo solo cuando estamos en esa pestaña
  const obdData = useOBDScanner(activeTab === 'obd');

  useEffect(() => {
    fetchClientes();
    if (activeTab === 'obd') {
        fetchHistory();
    }
  }, [activeTab]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contactos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const fetchHistory = async () => {
      const { data, error } = await diagnosticService.getHistory(selectedVin);
      if (!error) setHistory(data || []);
  };

  const handleSaveReport = async () => {
      setSavingReport(true);
      const result = await diagnosticService.saveReport(selectedVin, obdData);
      
      if (result.success) {
          alert('Reporte guardado exitosamente en la nube AutoTech');
          fetchHistory();
      } else {
          alert('Error al guardar reporte: ' + result.error);
      }
      setSavingReport(false);
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('contactos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (error) {
      console.error('Error deleting cliente:', error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-500 animate-pulse tracking-[0.2em] text-[10px] sm:text-xs mt-4 uppercase font-black">
            Sincronizando Sistemas AutoTech...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30 pb-safe">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 pt-safe">
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Activity className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
                <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase">
                AUTO<span className="text-blue-500">TECH</span> <span className="text-zinc-600 font-light">OS</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black italic">Consola de Administración v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button 
                onClick={handleLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 text-[10px] font-black uppercase tracking-widest italic"
            >
                <LogOut size={14} />
                Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Navegación por Pestañas */}
        <nav className="flex gap-2 mb-10 bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 w-full sm:w-fit backdrop-blur-md">
            <button 
                onClick={() => setActiveTab('contactos')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'contactos' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Users size={14} />
                {isMobile ? 'Msgs' : 'Contactos'}
            </button>
            <button 
                onClick={() => setActiveTab('obd')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'obd' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Gauge size={14} />
                {isMobile ? 'OBD' : 'Escáner OBD-II'}
            </button>
        </nav>

        {/* Contenido Dinámico */}
        <AnimatePresence mode="wait">
            {activeTab === 'contactos' ? (
                <motion.div 
                    key="contactos"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                >
                    {isMobile ? (
                        /* Mobile View: Cards */
                        <div className="grid grid-cols-1 gap-4">
                            {clientes.length > 0 ? (
                                clientes.map((cliente) => (
                                    <div key={cliente.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-sm font-black italic text-white uppercase tracking-tighter leading-none mb-1">{cliente.nombre}</h3>
                                                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">
                                                    {new Date(cliente.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => eliminarCliente(cliente.id)}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold">
                                                <Mail size={12} className="text-blue-500" />
                                                <span className="lowercase font-mono truncate">{cliente.email}</span>
                                            </div>
                                            <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl">
                                                <div className="flex gap-2 mb-2">
                                                    <MessageSquare size={10} className="text-zinc-600" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Mensaje</span>
                                                </div>
                                                <p className="text-[11px] text-zinc-300 leading-relaxed uppercase italic font-bold">
                                                    {cliente.mensaje}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem]">
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">No se detectan registros</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Desktop View: Table */
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02]">
                                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">Fecha</th>
                                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">Nombre</th>
                                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">Email</th>
                                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">Mensaje</th>
                                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-blue-400 text-right">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                    {clientes.length > 0 ? (
                                        clientes.map((cliente) => (
                                        <tr key={cliente.id} className="group hover:bg-white/[0.03] transition-colors duration-200 uppercase">
                                            <td className="p-6 text-[10px] text-zinc-500 font-mono tracking-tighter">
                                                {new Date(cliente.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-6 text-xs font-bold text-white tracking-widest">
                                                {cliente.nombre}
                                            </td>
                                            <td className="p-6 text-xs text-zinc-400 italic font-mono lowercase">
                                                {cliente.email}
                                            </td>
                                            <td className="p-6 text-xs text-zinc-600 max-w-xs truncate tracking-tight">
                                                {cliente.mensaje}
                                            </td>
                                            <td className="p-6 text-right">
                                                <button 
                                                    onClick={() => eliminarCliente(cliente.id)}
                                                    disabled={deletingId === cliente.id}
                                                    className="p-3 rounded-xl bg-zinc-800 text-zinc-500 hover:bg-red-500/20 hover:text-red-500 transition-all duration-300 disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                        <td colSpan="5" className="p-24 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em] italic">
                                            // No se encontraron registros encriptados
                                        </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div 
                    key="obd"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="flex flex-col gap-10">
                        <div className="bg-zinc-900/30 p-4 sm:p-8 rounded-[2.5rem] border border-zinc-800/50">
                            <OBDDashboard 
                                data={obdData} 
                                onSaveReport={handleSaveReport}
                                saving={savingReport}
                            />
                        </div>
                        
                        {/* Historial de Diagnósticos */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <Activity className="text-blue-500 w-5 h-5" />
                                <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Historial de Reportes ({selectedVin})</h2>
                                <div className="h-[1px] flex-1 bg-zinc-800 ml-4 hidden sm:block" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.length > 0 ? (
                                    history.map((report) => (
                                        <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] backdrop-blur-xl hover:border-blue-500/30 transition-all group cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon size={12} className="text-zinc-500" />
                                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                                                        {new Date(report.fecha).toLocaleString()}
                                                    </span>
                                                </div>
                                                {report.errores_dtc?.length > 0 && (
                                                    <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                                        DTC Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-zinc-200 mb-4 uppercase italic tracking-tight line-clamp-2">"{report.resumen}"</p>
                                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800">
                                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50">
                                                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Voltaje</p>
                                                    <p className="text-xs font-black text-blue-400 tracking-tighter">{report.voltaje_bateria}V</p>
                                                </div>
                                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50">
                                                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Carga</p>
                                                    <p className="text-xs font-black text-emerald-400 tracking-tighter">{report.carga_motor}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
                                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] italic">No se detectan reportes previos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Footer info */}
        <footer className="mt-16 flex flex-col sm:flex-row justify-between items-center px-4 gap-6 opacity-50">
          <div className="flex flex-wrap justify-center items-center gap-6">
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em] font-black">
                SYS_STATUS: <span className="text-emerald-500">ACTIVE</span>
              </p>
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em] font-black">
                RECORDS_DB: {clientes.length}
              </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] italic">AutoTech Security Core v2</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;
