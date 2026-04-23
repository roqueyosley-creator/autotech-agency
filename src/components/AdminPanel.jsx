import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, LogOut, Users, Gauge, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OBDDashboard from './OBDDashboard';
import { useOBDScanner } from '../utils/useOBDScanner';

import { diagnosticService } from '../services/diagnosticService';

const AdminPanel = () => {
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
          <p className="text-blue-500 animate-pulse tracking-[0.2em] text-xs mt-4 uppercase">
            Sincronizando Sistemas AutoTech...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/5 via-transparent to-purple-900/5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Activity className="text-blue-500 w-8 h-8" />
            </div>
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter">
                AUTO<span className="text-blue-500">TECH</span> <span className="text-zinc-600 font-light">OS</span>
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Consola de Administración v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 text-xs font-bold uppercase tracking-wider"
            >
                <LogOut size={14} />
                Salir
            </button>
          </div>
        </header>

        {/* Navegación por Pestañas */}
        <nav className="flex gap-2 mb-8 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 w-fit backdrop-blur-md">
            <button 
                onClick={() => setActiveTab('contactos')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'contactos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Users size={14} />
                Contactos
            </button>
            <button 
                onClick={() => setActiveTab('obd')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'obd' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Gauge size={14} />
                Escáner OBD-II
            </button>
        </nav>

        {/* Contenido Dinámico */}
        <AnimatePresence mode="wait">
            {activeTab === 'contactos' ? (
                <motion.div 
                    key="contactos"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
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
                </motion.div>
            ) : (
                <motion.div 
                    key="obd"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <div className="flex flex-col gap-8">
                        <OBDDashboard 
                            data={obdData} 
                            onSaveReport={handleSaveReport}
                            saving={savingReport}
                        />
                        
                        {/* Historial de Diagnósticos */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="text-blue-500 w-5 h-5" />
                                <h2 className="text-xl font-bold uppercase tracking-widest">Historial de Reportes ({selectedVin})</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.length > 0 ? (
                                    history.map((report) => (
                                        <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                                    {new Date(report.fecha).toLocaleString()}
                                                </span>
                                                {report.errores_dtc?.length > 0 && (
                                                    <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                                        DTC Detectado
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-zinc-300 mb-2">{report.resumen}</p>
                                            <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
                                                <div className="text-center">
                                                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">Batería</p>
                                                    <p className="text-xs font-bold text-blue-400">{report.voltaje_bateria}V</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">Carga</p>
                                                    <p className="text-xs font-bold text-emerald-400">{report.carga_motor}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                                        <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">No hay reportes previos para este vehículo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Footer info */}
        <footer className="mt-12 flex justify-between items-center px-6">
          <div className="flex items-center gap-6">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
                SYS_STATUS: ONLINE
              </p>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
                RECORDS: {clientes.length}
              </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em] font-bold italic">AutoTech Security Core</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;
