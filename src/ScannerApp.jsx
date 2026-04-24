import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Brain, X, Bot, Info } from 'lucide-react';

import { bluetoothService } from './services/bluetoothService';
import { connectionManager } from './services/connectionManager';
import { diagnosticService } from './services/diagnosticService';
import { reportService } from './services/reportService';
import { mainAgent } from './agents/mainAgent';
import { AGENT_EVENTS } from './services/eventBus';

import OBDDashboard from './components/OBDDashboard';
import ServiceMenu from './components/ServiceMenu';
import BottomNav from './components/BottomNav';
import VehicleTypeSelector from './components/VehicleTypeSelector';
import AdvancedTelemetry from './components/AdvancedTelemetry';
import DtcLibrary from './components/DtcLibrary';
import AIDiagnostic from './components/AIDiagnostic';
import BidirectionalControl from './components/BidirectionalControl';
import TopologyView from './components/TopologyView';
import VehiclePassport from './components/VehiclePassport';
import ServiceWizard from './components/ServiceWizard';
import QuoteBuilder from './components/QuoteBuilder';
import ReportHistory from './components/ReportHistory';
import WorkshopConfig from './components/WorkshopConfig';
import AutomationConfig from './components/AutomationConfig';
import ProgrammingWorkspace from './components/ProgrammingWorkspace';

import { useWindowSize } from './hooks/useWindowSize';

const BRANDS = {
    car: ["Toyota", "Ford", "BMW", "Audi", "Hyundai", "Honda", "Tesla", "Universal"],
    moto: ["Honda", "Yamaha", "KTM", "BMW", "Kawasaki", "Ducati", "Suzuki", "Euro 5 Standard"]
};

const DEFAULT_VIN = 'VIN-MOBILE-001';

const ScannerApp = () => {
    const { isMobile, isTablet, isDesktop } = useWindowSize();
    const alertTimeoutRef = useRef(null);
    const agentInitialized = useRef(false);

    const [activeTab, setActiveTab] = useState('scanner');
    const [activeService, setActiveService] = useState(null);
    const [showServiceWizard, setShowServiceWizard] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [vehicleType, setVehicleType] = useState(null);
    const [vehicleData, setVehicleData] = useState(null);
    const [subTab, setSubTab] = useState('builder');
    
    const [customerData, setCustomerData] = useState({ name: '', phone: '', email: '', car: '' });
    const [expertInsight, setExpertInsight] = useState(null);
    const [lastAiDiagnosis, setLastAiDiagnosis] = useState(null);

    const [uiStatus, setUiStatus] = useState({
        saving: false,
        loading: false,
        connecting: false,
        generatingReport: false,
        showDevicePicker: false,
        showWorkshopConfig: false,
        showAutomationConfig: false
    });

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
    const [topologyModules, setTopologyModules] = useState([]);

    const memoizedVehicleData = useMemo(() =>
        vehicleData || { make: 'Universal', model: 'OBD-II Vehicle', vin: DEFAULT_VIN },
        [vehicleData]);

    const triggerAlert = useCallback((alert) => {
        if (!alert?.msg) return;
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        setAgentAlert(alert);
        if (alert.priority !== 'critical') {
            alertTimeoutRef.current = setTimeout(() => setAgentAlert(null), 8000);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await diagnosticService.getHistory(DEFAULT_VIN);
            if (data) setHistory(data);
        } catch (error) {}
    }, []);

    const handleConnect = useCallback(async (type = 'sim') => {
        setUiStatus(prev => ({ ...prev, connecting: true }));
        
        const connectionPromise = mainAgent.startMission({
            type,
            isReal: type !== 'sim',
            vehicleType: vehicleType || 'car'
        });

        try {
            const result = await connectionPromise;
            if (!result || result.success !== true) {
                setConnected(false);
                triggerAlert({ msg: result?.error || "Falla de enlace", priority: 'high' });
            }
        } catch (e) {
            setConnected(false);
            triggerAlert({ msg: "Error crítico de conexión", priority: 'high' });
        } finally {
            setUiStatus(prev => ({ ...prev, connecting: false }));
        }
    }, [vehicleType, triggerAlert]);

    useEffect(() => {
        if (!agentInitialized.current) {
            mainAgent.init();
            agentInitialized.current = true;
        }

        const subs = [
            mainAgent.subscribe(AGENT_EVENTS.DATA_RECEIVED, (data) => {
                if (!data) return;
                setObdData(prev => ({ 
                    ...prev, 
                    ...data,
                    codes: data.codes || prev.codes,
                    dtcCount: (data.codes || []).length 
                }));
            }),
            mainAgent.subscribe(AGENT_EVENTS.SCANNER_CONNECTED, () => {
                setConnected(true);
                setUiStatus(prev => ({ ...prev, connecting: false, showDevicePicker: false }));
            }),
            mainAgent.subscribe(AGENT_EVENTS.SCANNER_DISCONNECTED, () => {
                setConnected(false);
                triggerAlert({ msg: "Scanner Desconectado", priority: 'low' });
            }),
            mainAgent.subscribe(AGENT_EVENTS.INSIGHT_GENERATED, (insight) => {
                setExpertInsight(insight);
                setLastAiDiagnosis(insight);
            }),
            mainAgent.subscribe(AGENT_EVENTS.AI_INSIGHT_GENERATED, (insight) => {
                setExpertInsight(insight);
                setLastAiDiagnosis(insight);
            }),
            mainAgent.subscribe(AGENT_EVENTS.VIN_DECODED, (data) => {
                if (data) setVehicleData(data);
            }),
            mainAgent.subscribe(AGENT_EVENTS.UI_ALERT, (alert) => triggerAlert(alert)),
            mainAgent.subscribe(AGENT_EVENTS.TOPOLOGY_UPDATED, (modules) => setTopologyModules(modules))
        ];

        return () => subs.forEach(unsub => unsub());
    }, [fetchHistory, triggerAlert]);

    const scanDevices = useCallback(async () => {
        setUiStatus(prev => ({ ...prev, loading: true }));
        try {
            const list = await bluetoothService.listPairedDevices();
            setDevices(Array.isArray(list) ? list : []);
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } catch (e) {
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } finally {
            setUiStatus(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const handleProfessionalReport = useCallback(async (reportInputs) => {
        setUiStatus(prev => ({ ...prev, generatingReport: true }));
        try {
            const result = await reportService.generate({
                ...reportInputs,
                vehicleData: memoizedVehicleData,
                dtcs: obdData.codes,
                aiDiagnosis: expertInsight
            });
            if (result?.url) window.open(result.url, '_blank');
        } catch (error) {
            triggerAlert({ msg: "Falla al renderizar reporte", priority: 'high' });
        } finally {
            setUiStatus(prev => ({ ...prev, generatingReport: false }));
        }
    }, [memoizedVehicleData, obdData, expertInsight, triggerAlert]);

    return (
        <div className="bg-black min-h-screen text-white pb-safe pt-safe overflow-x-hidden flex flex-col">
            {/* Header Responsivo */}
            <header className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-lg border-b border-white/5">
                <div className="flex flex-col">
                    <span className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">AutoTech <span className="text-blue-500">PRO</span></span>
                    {selectedBrand && <span className="text-[7px] sm:text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">{selectedBrand} | {connected ? 'Online' : 'Offline'}</span>}
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => setUiStatus(p => ({ ...p, showAutomationConfig: true }))} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-blue-500 transition-colors">
                        <Bot size={isMobile ? 16 : 18} />
                    </button>
                    <button 
                        onClick={connected ? () => mainAgent.stopMission() : scanDevices} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] sm:text-[10px] font-bold uppercase transition-all ${connected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                        {connected ? 'En Línea' : 'Conectar'}
                    </button>
                </div>
            </header>

            {/* Contenedor Principal con Max-Width */}
            <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 overflow-y-auto custom-scrollbar">
                {!vehicleType && <VehicleTypeSelector onSelect={setVehicleType} />}

                <AnimatePresence mode="wait">
                    {activeTab === 'scanner' && (
                        <motion.div 
                            key="scanner" 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <OBDDashboard 
                                data={{ ...obdData, dtcs: obdData.codes }} 
                                onSaveReport={() => {}} 
                                saving={uiStatus.saving} 
                                expertInsight={expertInsight} 
                            />
                        </motion.div>
                    )}
                    {activeTab === 'reports' && (
                        <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <QuoteBuilder 
                                vehicleData={memoizedVehicleData} 
                                dtcs={obdData.codes.length} 
                                customerData={customerData} 
                                setCustomerData={setCustomerData} 
                                onGenerateReport={handleProfessionalReport} 
                            />
                        </motion.div>
                    )}
                    {activeTab === 'id' && (
                        <motion.div key="id" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <VehiclePassport vehicleData={vehicleData} onDownloadReport={() => {}} />
                        </motion.div>
                    )}
                    {activeTab === 'ai' && (
                        <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <AIDiagnostic vehicleData={vehicleData} obdData={obdData} dtcs={obdData.codes} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Device Picker - Responsivo */}
            <AnimatePresence>
                {uiStatus.showDevicePicker && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }} 
                            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }} 
                            exit={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }} 
                            className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Hardware</h3>
                                <button onClick={() => setUiStatus(p => ({ ...p, showDevicePicker: false }))} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <button onClick={() => handleConnect('wifi')} className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-blue-600/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-zinc-800 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all"><Activity size={16} /></div>
                                        <p className="text-sm font-bold text-white">Interface Wi-Fi</p>
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase">ELM327</span>
                                </button>
                                {devices.map((dev) => (
                                    <button key={dev.address} onClick={() => handleConnect('bluetooth')} className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-emerald-600/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-zinc-800 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Activity size={16} /></div>
                                            <p className="text-sm font-bold text-white">{dev.name || 'BT Adapter'}</p>
                                        </div>
                                        <span className="text-[8px] font-black text-zinc-600 uppercase">Bluetooth</span>
                                    </button>
                                ))}
                                <button onClick={() => handleConnect('sim')} className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-all">
                                    <p className="text-xs font-bold text-zinc-500">Modo Simulación</p>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            
            <AutomationConfig isOpen={uiStatus.showAutomationConfig} onClose={() => setUiStatus(p => ({ ...p, showAutomationConfig: false }))} />
        </div>
    );
};

export default ScannerApp;
