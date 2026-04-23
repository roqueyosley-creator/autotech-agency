import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, FileText, Download, Share2, Calendar, User, Car, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ReportHistory = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('report_history') || '[]');
        setReports(saved);
    }, []);

    const filteredReports = reports.filter(r => {
        const matchesSearch = 
            r.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.vehicle?.vin?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'critical' && r.severity === 'critical') ||
            (filter === 'warning' && r.severity === 'warning') ||
            (filter === 'ok' && r.severity === 'ok');

        return matchesSearch && matchesFilter;
    });

    const severityColors = {
        critical: 'bg-red-500/10 text-red-500 border-red-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        ok: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };

    return (
        <div className="flex flex-col gap-6 p-6 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Historial de Reportes</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2">Archivo de Diagnósticos y Cotizaciones</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type="text" placeholder="Buscar por VIN, Cliente o Marca..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Total Reportes</span>
                    <span className="text-2xl font-black text-white italic tracking-tighter">{reports.length}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Críticos</span>
                    <span className="text-2xl font-black text-red-500 italic tracking-tighter">{reports.filter(r => r.severity === 'critical').length}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Cotizado Total</span>
                    <span className="text-2xl font-black text-emerald-500 italic tracking-tighter">
                        ${reports.reduce((acc, r) => acc + (r.quote_summary?.total || 0), 0).toLocaleString()}
                    </span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Eficiencia IA</span>
                    <span className="text-2xl font-black text-blue-500 italic tracking-tighter">98%</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {['all', 'critical', 'warning', 'ok'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${filter === f ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'}`}
                    >
                        {f === 'all' ? 'Ver Todos' : f === 'critical' ? 'Críticos' : f === 'warning' ? 'Advertencias' : 'Buen Estado'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredReports.map((report, idx) => (
                        <motion.div
                            key={report.report_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 transition-all group relative overflow-hidden"
                        >
                            {/* Background glow based on severity */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-5 rounded-full ${report.severity === 'critical' ? 'bg-red-500' : 'bg-emerald-500'}`} />

                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${severityColors[report.severity || 'info']}`}>
                                        {report.severity === 'critical' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-black uppercase italic tracking-tighter text-sm">
                                                {report.vehicle?.make} {report.vehicle?.model}
                                            </h3>
                                            <span className="text-[10px] font-mono text-zinc-500">#{report.report_number}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><User size={10} /> {report.customer?.name || 'Cliente Gral.'}</span>
                                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <div className="text-right">
                                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Total Cotizado</span>
                                        <span className="text-lg font-black text-white font-mono tracking-tighter">
                                            ${report.quote_summary?.total?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-zinc-800 hover:bg-blue-600 hover:text-white text-zinc-400 rounded-xl transition-all">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-3 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-400 rounded-xl transition-all">
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredReports.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <FileText className="mx-auto mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">No hay reportes en el historial</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportHistory;
