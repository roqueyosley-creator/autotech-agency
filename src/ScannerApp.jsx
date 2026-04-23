import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Brain, X, Bot, Info } from 'lucide-react';

import { bluetoothService } from './services/bluetoothService';
import { connectionManager } from './services/connectionManager';
import { diagnosticService } from './services/diagnosticService';
import { vinService } from './services/vinService';
import { reportService } from './services/reportService';
import { mainAgent } from './agents/mainAgent';
import { AGENT_EVENTS } from './services/eventBus';
import { pidDatabase } from './utils/pidDatabase';

import OBDDashboard from './components/OBDDashboard';
import ServiceMenu from './components/ServiceMenu';
import BottomNav from './components/BottomNav';
import VehicleTypeSelector from './components/VehicleTypeSelector';
import AdvancedTelemetry from './components/AdvancedTelemetry';
import DtcLibrary from './components/DtcLibrary';
import AIDiagnostic from './components/AIDiagnostic';
import BidirectionalControl from './components/BidirectionalControl';
import TopologyView from './components/Topology/TopologyView';
import VehiclePassport from './components/VehiclePassport';
import ServiceWizard from './components/ServiceWizard';
import QuoteBuilder from './components/QuoteBuilder';
import ReportHistory from './components/ReportHistory';
import WorkshopConfig from './components/WorkshopConfig';
import AutomationConfig from './components/AutomationConfig';
import ProgrammingWorkspace from './components/ProgrammingWorkspace';

const BRANDS = {
    car: ["Toyota", "Ford", "BMW", "Audi", "Hyundai", "Honda", "Tesla", "Universal"],
    moto: ["Honda", "Yamaha", "KTM", "BMW", "Kawasaki", "Ducati", "Suzuki", "Euro 5 Standard"]
};

const DEFAULT_VIN = 'VIN-MOBILE-001';

const ScannerApp = () => {
    // --- NAVEGACIÓN Y CONTEXTO ---
    const [activeTab, setActiveTab] = useState('scanner');
    const [activeService, setActiveService] = useState(null);
    const [showServiceWizard, setShowServiceWizard] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [vehicleType, setVehicleType] = useState(null);
    const [vehicleData, setVehicleData] = useState(null);
    const [subTab, setSubTab] = useState('builder');

    // --- ESTADO UI NORMALIZADO ---
    const [uiStatus, setUiStatus] = useState({
        saving: false,
        loading: false,
        connecting: false,
        generatingReport: false,
        showDevicePicker: false,
        showWorkshopConfig: false,
        showAutomationConfig: false
    });

    // --- DATOS OBD NORMALIZADOS (PRODUCTION READY) ---
    const [obdData, setObdData] = useState({
        battery: 12.6,
        rpm: 0,
        speed: 0,
        temp: 0,
        engineLoad: 0,
        codes: [],
        dtcCount: 0,
        protocol: "Disconnected",
        liveData: {}
    });

    const [connected, setConnected] = useState(false);
    const [devices, setDevices] = useState([]);
    const [agentAlert, setAgentAlert] = useState(null);
    const [expertInsight, setExpertInsight] = useState(null);
    const [topologyModules, setTopologyModules] = useState([]);

    // --- DERIVACIONES ---
    const memoizedVehicleData = useMemo(() =>
        vehicleData || { make: 'Universal', model: 'OBD-II Vehicle', vin: DEFAULT_VIN },
        [vehicleData]);

    const dtcCount = useMemo(() => obdData.codes.length, [obdData.codes]);

    // --- HELPERS SEGUROS ---
    const triggerAlert = useCallback((alert) => {
        setAgentAlert(alert);
        if (alert.priority !== 'critical') {
            const timeoutId = setTimeout(() => {
                setAgentAlert(current => (current?.msg === alert.msg ? null : current));
            }, 8000);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await diagnosticService.getHistory(DEFAULT_VIN);
            if (data) setHistory(data);
        } catch (error) {
            console.error("Error al obtener historial:", error);
        }
    }, []);

    // --- MANEJADORES DE COMANDOS ---
    const handleSendCommand = useCallback(async (cmd) => {
        try {
            if (!connected) throw new Error("Hardware no conectado");
            await bluetoothService.sendPID(cmd);
        } catch (error) {
            console.error("Command execution failed:", error);
            triggerAlert({ msg: "Falla en ejecución de comando OBD", priority: 'high' });
        }
    }, [connected, triggerAlert]);

    const handleCloseServiceWizard = useCallback(() => {
        setShowServiceWizard(false);
        setActiveService(null);
    }, []);

    // --- ARQUITECTURA EVENT-DRIVEN (AGENT SUBSCRIPTIONS) ---
    useEffect(() => {
        mainAgent.init();

        const subs = [
            mainAgent.subscribe(AGENT_EVENTS.DATA_RECEIVED, (data) => {
                setObdData(prev => {
                    const next = { ...prev, ...data };
                    return { ...next, dtcCount: (next.codes || []).length };
                });
            }),
            mainAgent.subscribe(AGENT_EVENTS.SCANNER_CONNECTED, () => {
                setConnected(true);
                setUiStatus(prev => ({ ...prev, connecting: false, showDevicePicker: false }));
            }),
            mainAgent.subscribe(AGENT_EVENTS.SCANNER_DISCONNECTED, () => {
                setConnected(false);
                triggerAlert({ msg: "Scanner Desconectado. Agentes en espera.", priority: 'low' });
            }),
            mainAgent.subscribe(AGENT_EVENTS.INSIGHT_GENERATED, (insight) => {
                setExpertInsight(insight);
            }),
            mainAgent.subscribe(AGENT_EVENTS.UI_ALERT, (alert) => {
                triggerAlert(alert);
            }),
            mainAgent.subscribe(AGENT_EVENTS.REPORT_GENERATED, (report) => {
                triggerAlert({ msg: `Reporte ${report.id} listo en la nube`, priority: 'low' });
                fetchHistory();
            }),
            mainAgent.subscribe(AGENT_EVENTS.TOPOLOGY_UPDATED, (modules) => {
                setTopologyModules(modules);
            })
        ];

        return () => subs.forEach(unsub => unsub());
    }, [fetchHistory, triggerAlert]);

    // --- VEHICLE CONTEXT SYNC ---
    useEffect(() => {
        if (selectedBrand || vehicleData) {
            mainAgent.setVehicleContext({
                make: selectedBrand || 'Universal',
                model: vehicleData?.model || 'Desconocido',
                year: vehicleData?.year || 'N/A',
                vin: memoizedVehicleData.vin
            });
        }
    }, [selectedBrand, vehicleData, memoizedVehicleData.vin]);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab, fetchHistory]);

    // --- ACCIONES PRINCIPALES ---
    const handleConnect = useCallback(async (type = 'sim') => {
        setUiStatus(prev => ({ ...prev, connecting: true }));
        try {
            const result = await mainAgent.startMission({
                isReal: type !== 'sim',
                vehicleType: vehicleType || 'car'
            });

            if (!result?.success) {
                setConnected(false);
                triggerAlert({ msg: result?.error || "Error de conexión con el adaptador", priority: 'high' });
            }
        } catch (e) {
            console.error("Connection Mission Failed:", e);
            setConnected(false);
            triggerAlert({ msg: "Falla crítica en la misión del agente", priority: 'high' });
        } finally {
            setUiStatus(prev => ({ ...prev, connecting: false }));
        }
    }, [vehicleType, triggerAlert]);

    const handleDisconnect = useCallback(() => {
        mainAgent.stopMission();
        setConnected(false);
    }, []);

    const scanDevices = useCallback(async () => {
        setUiStatus(prev => ({ ...prev, loading: true }));
        try {
            const list = await bluetoothService.listPairedDevices();
            setDevices(list || []);
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } catch (e) {
            console.error("BT Scan Error:", e);
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } finally {
            setUiStatus(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const handleProfessionalReport = useCallback(async (reportInputs) => {
        setUiStatus(prev => ({ ...prev, generatingReport: true }));
        try {
            const reportData = {
                ...reportInputs,
                vehicleData: memoizedVehicleData,
                dtcs: obdData.codes,
                telemetry: obdData.liveData,
                aiDiagnosis: expertInsight
            };

            const result = await reportService.generate(reportData);
            if (result?.url) window.open(result.url, '_blank');
        } catch (error) {
            console.error("Error al generar reporte:", error);
            triggerAlert({ msg: "Falla al renderizar reporte PDF", priority: 'high' });
        } finally {
            setUiStatus(prev => ({ ...prev, generatingReport: false }));
        }
    }, [memoizedVehicleData, obdData, expertInsight, triggerAlert]);

    const handleSaveReport = useCallback(async () => {
        setUiStatus(prev => ({ ...prev, saving: true }));
        try {
            const reportVehicleData = {
                vin: memoizedVehicleData.vin,
                make: selectedBrand,
                type: vehicleType,
                model: vehicleData?.model || 'Universal',
                year: vehicleData?.year || new Date().getFullYear()
            };
            const result = await diagnosticService.saveReport(reportVehicleData, { ...obdData, dtcCount });
            if (result?.success) {
                triggerAlert({ msg: "Informe guardado exitosamente", priority: 'low' });
                fetchHistory();
            }
        } catch (error) {
            console.error("Save Report Error:", error);
        } finally {
            setUiStatus(prev => ({ ...prev, saving: false }));
        }
    }, [selectedBrand, vehicleType, vehicleData, obdData, dtcCount, fetchHistory, memoizedVehicleData.vin, triggerAlert]);

    const handleServiceSelect = useCallback((service) => {
        setActiveService(service);
        setShowServiceWizard(true);
    }, []);

    // --- RENDER ---
    return (
        <div className="bg-black min-h-screen text-white pb-24 selection:bg-blue-500/30">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-lg border-b border-white/5">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tighter uppercase italic">AutoTech <span className="text-blue-500">PRO</span></span>
                    </div>
                    {selectedBrand && (
                        <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">
                            {selectedBrand} | {connected ? 'Online' : 'Offline'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setUiStatus(p => ({ ...p, showAutomationConfig: true }))}
                        className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-blue-500 transition-colors"
                    >
                        <Bot size={18} />
                    </button>
                    <button
                        onClick={connected ? handleDisconnect : scanDevices}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all duration-300 ${connected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                            }`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                        {connected ? 'En Línea' : 'Conectar'}
                    </button>
                    {dtcCount > 0 && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                            <ShieldAlert className="text-red-500 w-5 h-5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Selectores Iniciales */}
            {!vehicleType && <VehicleTypeSelector onSelect={setVehicleType} />}

            {vehicleType && !selectedBrand && (
                <div className="fixed inset-0 z-[60] bg-black p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Selecciona Marca</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold italic">Base: {pidDatabase[vehicleType].name}</p>
                        </div>
                        <button onClick={() => setVehicleType(null)} className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest hover:text-white">Cambiar Tipo</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {BRANDS[vehicleType].map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSelectedBrand(brand)}
                                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-xs font-black uppercase tracking-widest text-zinc-300"
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Device Picker */}
            <AnimatePresence>
                {uiStatus.showDevicePicker && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end"
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="w-full bg-zinc-950 border-t border-zinc-800 p-8 rounded-t-[2.5rem]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Enlace de Datos</h3>
                                <button onClick={() => setUiStatus(p => ({ ...p, showDevicePicker: false }))} className="text-zinc-600 font-bold uppercase text-xs">Cerrar</button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleConnect('real')}
                                    disabled={!connectionManager.getCapabilities().wifi.supported}
                                    className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-blue-600/10 transition-all text-left"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">Interface Wi-Fi</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">TCP: 192.168.0.10 (Standard)</p>
                                    </div>
                                    <div className="p-2 bg-zinc-800 rounded-lg text-blue-500"><Activity size={12} /></div>
                                </button>

                                {devices.map((dev) => (
                                    <button
                                        key={dev.address}
                                        onClick={() => handleConnect('real')}
                                        className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-emerald-600/10 transition-all text-left"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">{dev.name || 'Bluetooth Adapter'}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono italic">{dev.address}</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Activity size={12} /></div>
                                    </button>
                                ))}

                                <button
                                    onClick={() => handleConnect('sim')}
                                    className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-left"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">Modo Simulación</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">Para propósitos de prueba y UI</p>
                                    </div>
                                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-500"><Activity size={12} /></div>
                                </button>
                            </div>

                            {uiStatus.connecting && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-white rounded-full animate-spin" />
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Negociando Protocolo...</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <OBDDashboard data={{ ...obdData, dtcs: dtcCount }} onSaveReport={handleSaveReport} saving={uiStatus.saving} expertInsight={expertInsight} />
                    </motion.div>
                )}

                {activeTab === 'analysis' && (
                    <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24">
                        <AdvancedTelemetry liveData={obdData} />
                        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                            <h3 className="text-white font-black text-xl italic uppercase mb-6">DTC Library</h3>
                            <DtcLibrary vehicleData={vehicleData} />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'topology' && (
                    <motion.div key="topology" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <TopologyView modules={topologyModules} />
                    </motion.div>
                )}

                {activeTab === 'program' && (
                    <motion.div key="program" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                        <ProgrammingWorkspace />
                    </motion.div>
                )}

                {activeTab === 'actuations' && (
                    <motion.div key="actuations" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-[calc(100vh-80px)]">
                        <BidirectionalControl connected={connected} brand={selectedBrand} vehicleType={vehicleType} />
                    </motion.div>
                )}

                {(activeTab === 'service' || activeTab === 'resets') && (
                    <motion.div key="service" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="p-4">
                        <ServiceMenu vehicleType={vehicleType} onServiceSelect={handleServiceSelect} />
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <div className="flex flex-col">
                        <div className="flex border-b border-white/5 mb-8 px-4 gap-4">
                            <button onClick={() => setSubTab('builder')} className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${subTab === 'builder' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>Cotizador</button>
                            <button onClick={() => setSubTab('history')} className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${subTab === 'history' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>Historial</button>
                        </div>
                        {subTab === 'builder' ? (
                            <QuoteBuilder vehicleData={memoizedVehicleData} dtcs={dtcCount} onOpenConfig={() => setUiStatus(p => ({ ...p, showWorkshopConfig: true }))} onGenerateReport={handleProfessionalReport} />
                        ) : (
                            <ReportHistory />
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                        <h2 className="text-2xl font-black uppercase italic mb-6 tracking-tighter">Centro de Gestión</h2>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Generar Informe</h3>
                                    <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mt-1">Exportación Corporativa PDF</p>
                                </div>
                                <button
                                    onClick={() => handleProfessionalReport({ customer: { name: 'Reporte Historial' } })}
                                    disabled={uiStatus.saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                >
                                    <Activity size={12} className={uiStatus.saving ? 'animate-spin' : ''} />
                                    {uiStatus.saving ? 'PROCESANDO...' : 'GENERAR REPORTE'}
                                </button>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                                <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight">Vehículo Actual:</p>
                                <p className="text-xs font-black text-white mt-0.5">{memoizedVehicleData.make} {memoizedVehicleData.model} <span className="text-zinc-600 ml-1">({memoizedVehicleData.vin})</span></p>
                            </div>
                        </div>
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Historial de Sesiones</h3>
                        <div className="space-y-4">
                            {history.length > 0 ? history.map((report) => (
                                <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{new Date(report.created_at).toLocaleDateString()}</span>
                                        {report.fault_logs?.length > 0 && <span className="text-[8px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">ALERTA</span>}
                                    </div>
                                    <p className="text-sm font-bold text-zinc-200 mb-2 truncate">{report.summary}</p>
                                </div>
                            )) : (
                                <div className="py-20 text-center opacity-20">
                                    <Info className="mx-auto mb-2" />
                                    <p className="text-[10px] uppercase font-bold tracking-widest">Sincronizando...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="h-[calc(100vh-160px)]">
                        <AIDiagnostic vehicleData={vehicleData} obdData={obdData} dtcs={obdData.codes} />
                    </motion.div>
                )}

                {activeTab === 'id' && (
                    <motion.div key="id" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="p-6 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
                        <VehiclePassport vehicleData={vehicleData} onDownloadReport={() => handleProfessionalReport({ customer: { name: 'Reporte Rápido' } })} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlays & Modals */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            <ServiceWizard
                visible={showServiceWizard}
                service={activeService}
                brand={selectedBrand}
                connected={connected}
                onSendCommand={handleSendCommand}
                onClose={handleCloseServiceWizard}
            />

            <WorkshopConfig
                isOpen={uiStatus.showWorkshopConfig}
                onClose={() => setUiStatus(p => ({ ...p, showWorkshopConfig: false }))}
                onSave={() => triggerAlert({ msg: "Configuración de taller actualizada", priority: 'low' })}
            />

            <AutomationConfig
                isOpen={uiStatus.showAutomationConfig}
                onClose={() => setUiStatus(p => ({ ...p, showAutomationConfig: false }))}
            />

            <AnimatePresence>
                {agentAlert && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-[200] bg-zinc-900/90 border-2 border-blue-500/50 p-4 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-2xl ${agentAlert.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            <Brain size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AutoTech AI Agent</h4>
                            <p className="text-xs text-white font-bold leading-tight">{agentAlert.msg}</p>
                        </div>
                        <button onClick={() => setAgentAlert(null)} className="p-2 text-zinc-500"><X size={20} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {uiStatus.generatingReport && (
                <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-center">
                        <p className="text-white font-black uppercase italic tracking-widest">Generando Reporte Pro</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">IA Engine & PDF Renderer</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerApp;
