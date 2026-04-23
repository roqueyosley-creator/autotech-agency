import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Info, Brain, X, Bot } from 'lucide-react';

import { bluetoothService } from './services/bluetoothService';
import { connectionManager } from './services/connectionManager';
import { diagnosticService } from './services/diagnosticService';
import { useOBDScanner } from './utils/useOBDScanner';
import { smartHandshake } from './utils/smartHandshake';

import OBDDashboard from './components/OBDDashboard';
import ComparisonDashboard from './components/ComparisonDashboard';
import ProgrammingWorkspace from './components/ProgrammingWorkspace';
import ServiceMenu from './components/ServiceMenu';
import BottomNav from './components/BottomNav';
import VehicleTypeSelector from './components/VehicleTypeSelector';
import AdvancedTelemetry from './components/AdvancedTelemetry';
import DtcLibrary from './components/DtcLibrary';
import AIDiagnostic from './components/AIDiagnostic';
import BidirectionalControl from './components/BidirectionalControl';
import { vinService } from './services/vinService';
import { dtcService } from './services/dtcService';
import { generateDiagnosticReport } from './components/DiagnosticReport';
import { pidDatabase } from './utils/pidDatabase';
import TopologyView from './components/Topology/TopologyView';
import VehiclePassport from './components/VehiclePassport';
import ServiceWizard from './components/ServiceWizard';
import QuoteBuilder from './components/QuoteBuilder';
import ReportHistory from './components/ReportHistory';
import WorkshopConfig from './components/WorkshopConfig';
import { reportService } from './services/reportService';
import { mainAgent } from './agents/mainAgent';
import { AGENT_EVENTS } from './services/eventBus';
import AutomationConfig from './components/AutomationConfig';

const BRANDS = {
    car: ["Toyota", "Ford", "BMW", "Audi", "Hyundai", "Honda", "Tesla", "Universal"],
    moto: ["Honda", "Yamaha", "KTM", "BMW", "Kawasaki", "Ducati", "Suzuki", "Euro 5 Standard"]
};

const DEFAULT_VIN = 'VIN-MOBILE-001';

const ScannerApp = () => {
    const [activeTab, setActiveTab] = useState('scanner');
    const [activeService, setActiveService] = useState(null);
    const [showServiceWizard, setShowServiceWizard] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [vehicleType, setVehicleType] = useState(null); // 'car' | 'moto'
    const [vehicleData, setVehicleData] = useState(null); // Decoded VIN Info

    // Grouped UI States for better stability
    const [uiStatus, setUiStatus] = useState({
        saving: false,
        loading: false,
        connecting: false,
        generatingReport: false,
        showDevicePicker: false,
        showWorkshopConfig: false,
        showAutomationConfig: false
    });

    // Central Data State (Driven by Agents)
    const [obdData, setObdData] = useState({
        battery: 12.6,
        engineLoad: 0,
        temp: 0,
        rpm: 0,
        speed: 0,
        dtcs: 0,
        codes: [],
        protocol: "Disconnected"
    });

    const [connected, setConnected] = useState(false);
    const [devices, setDevices] = useState([]);
    const [agentAlert, setAgentAlert] = useState(null);
    const [expertInsight, setExpertInsight] = useState(null);
    const [topologyModules, setTopologyModules] = useState([]);
    const [subTab, setSubTab] = useState('builder');

    // El Agente Scanner ahora controla el flujo de datos. 
    // La UI solo reacciona a los eventos del bus.

    const memoizedVehicleData = React.useMemo(() =>
        vehicleData || { make: 'Universal', model: 'OBD-II Vehicle', vin: DEFAULT_VIN },
        [vehicleData]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    // --- ARQUITECTURA DE AGENTES: Suscripción Unificada ---
    useEffect(() => {
        mainAgent.init();

        const subscriptions = [
            mainAgent.subscribe(AGENT_EVENTS.DATA_RECEIVED, (data) => {
                setObdData(prev => ({ ...prev, ...data }));
                if (!connected) setConnected(true);
            }),
            mainAgent.subscribe(AGENT_EVENTS.SCANNER_DISCONNECTED, () => {
                setConnected(false);
                setAgentAlert({ msg: "Scanner Desconectado. Agentes en standby.", priority: 'low' });
            }),
            mainAgent.subscribe(AGENT_EVENTS.INSIGHT_GENERATED, (insight) => {
                setExpertInsight(insight);
            }),
            mainAgent.subscribe(AGENT_EVENTS.UI_ALERT, (alert) => {
                setAgentAlert(alert);
                if (alert.priority === 'high' || alert.priority === 'critical') {
                    // Auto-limpieza de alertas no críticas después de 8s
                    setTimeout(() => setAgentAlert(prev => prev?.msg === alert.msg ? null : prev), 8000);
                }
            }),
            mainAgent.subscribe(AGENT_EVENTS.REPORT_GENERATED, (report) => {
                setAgentAlert({ msg: `Reporte ${report.id} listo en la nube`, priority: 'low' });
                fetchHistory();
            }),
            mainAgent.subscribe(AGENT_EVENTS.TOPOLOGY_UPDATED, (modules) => {
                setTopologyModules(modules);
            })
        ];

        return () => {
            subscriptions.forEach(unsubscribe => unsubscribe());
        };
    }, [connected, fetchHistory]);

    // El procesamiento ya no es manual, lo hacen los agentes internamente al recibir DATA_RECEIVED

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

    const fetchHistory = React.useCallback(async () => {
        const { data } = await diagnosticService.getHistory(DEFAULT_VIN);
        if (data) setHistory(data);
    }, []);

    const runSmartHandshake = React.useCallback(async () => {
        setUiStatus(prev => ({ ...prev, loading: true }));
        try {
            const handshakeResult = await smartHandshake.run();

            if (handshakeResult.vehicle_type !== 'unknown') {
                setVehicleType(handshakeResult.vehicle_type);
            }

            if (handshakeResult.vin && handshakeResult.vin !== 'UNKNOWN') {
                const decoded = await vinService.decode(handshakeResult.vin);
                if (decoded) setVehicleData(decoded);
            }
        } catch (error) {
            console.error("Handshake Failed:", error);
        } finally {
            setUiStatus(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const handleConnect = React.useCallback(async (type = 'sim') => {
        setUiStatus(prev => ({ ...prev, connecting: true }));
        try {
            mainAgent.startMission({
                isReal: type !== 'sim',
                vehicleType: vehicleType || 'car'
            });

            setConnected(true);
            setUiStatus(prev => ({ ...prev, showDevicePicker: false }));
        } catch (e) {
            console.error("Connection Mission Failed:", e);
            setAgentAlert({ msg: "Falla crítica al iniciar misión", priority: 'high' });
        } finally {
            setUiStatus(prev => ({ ...prev, connecting: false }));
        }
    }, [vehicleType]);

    const handleDisconnect = () => {
        mainAgent.stopMission();
        setConnected(false);
    };

    const scanDevices = React.useCallback(async () => {
        setUiStatus(prev => ({ ...prev, loading: true }));
        try {
            const list = await bluetoothService.listPairedDevices();
            setDevices(list);
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } catch (e) {
            console.error("BT Scan Error:", e);
            setDevices([]);
            setUiStatus(prev => ({ ...prev, showDevicePicker: true }));
        } finally {
            setUiStatus(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const handleProfessionalReport = React.useCallback(async (reportInputs) => {
        setUiStatus(prev => ({ ...prev, generatingReport: true }));
        try {
            const reportData = {
                ...reportInputs,
                vehicleData: memoizedVehicleData,
                dtcs: obdData.dtcs,
                telemetry: obdData.liveData,
                aiDiagnosis: null
            };

            const result = await reportService.generate(reportData);
            if (result.url) window.open(result.url, '_blank');
        } catch (error) {
            console.error("Error al generar reporte:", error);
        } finally {
            setUiStatus(prev => ({ ...prev, generatingReport: false }));
        }
    }, [memoizedVehicleData, obdData]);

    const handleGenerateReport = React.useCallback(() => {
        handleProfessionalReport({
            customer: { name: 'Cliente de Historial', phone: '', email: '' },
            notes: 'Generado desde historial de sesiones.'
        });
    }, [handleProfessionalReport]);

    const handleSaveReport = React.useCallback(async () => {
        setUiStatus(prev => ({ ...prev, saving: true }));
        try {
            const reportVehicleData = {
                vin: memoizedVehicleData.vin,
                make: selectedBrand,
                type: vehicleType,
                model: vehicleData?.model || 'Universal',
                year: vehicleData?.year || new Date().getFullYear()
            };
            const result = await diagnosticService.saveReport(reportVehicleData, obdData);
            if (result.success) fetchHistory();
        } catch (error) {
            console.error("Save Report Error:", error);
        } finally {
            setUiStatus(prev => ({ ...prev, saving: false }));
        }
    }, [selectedBrand, vehicleType, vehicleData, obdData, fetchHistory, memoizedVehicleData.vin]);

    const handleExecuteService = React.useCallback(async (serviceId) => {
        const serviceCommands = {
            'oil_reset': ['0400', '04'],
            'dpf_regen': ['ATSH 7E0', '2C3D01'],
            'throttle_cal': ['ATSH 7E0', '0403'],
        };
        const cmds = serviceCommands[serviceId];
        if (cmds && connected) {
            for (const cmd of cmds) {
                await bluetoothService.sendPID(cmd);
            }
            console.warn(`Servicio "${serviceId}" requiere hardware activo.`);
            setAgentAlert({ msg: "Conecta un adaptador para ejecutar servicios bidireccionales", priority: 'medium' });
        }
    }, [connected]);

    const handleServiceSelect = React.useCallback((service) => {
        setActiveService(service);
        setShowServiceWizard(true);
    }, []);

    const handleCloseWorkshopConfig = React.useCallback(() => {
        setUiStatus(prev => ({ ...prev, showWorkshopConfig: false }));
    }, []);

    const handleOpenWorkshopConfig = React.useCallback(() => {
        setUiStatus(prev => ({ ...prev, showWorkshopConfig: true }));
    }, []);

    const handleCloseAutomationConfig = React.useCallback(() => {
        setUiStatus(prev => ({ ...prev, showAutomationConfig: false }));
    }, []);

    const handleOpenAutomationConfig = React.useCallback(() => {
        setUiStatus(prev => ({ ...prev, showAutomationConfig: true }));
    }, []);

    return (
        <div className="bg-black min-h-screen text-white pb-24 selection:bg-blue-500/30">
            {/* App Header Bar */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-lg border-b border-white/5">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tighter uppercase italic">AutoTech <span className="text-blue-500">PRO</span></span>
                    </div>
                    {selectedBrand && <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">Vehicle: {selectedBrand} | Mode: {connected ? 'Connected' : 'Disconnected'}</span>}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleOpenAutomationConfig}
                        className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-blue-500 transition-colors"
                        title="Configurar Agente"
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
                    {obdData.codes.length > 0 && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                            <ShieldAlert className="text-red-500 w-5 h-5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Vehicle Type Selection (First Step) */}
            {!vehicleType && (
                <VehicleTypeSelector onSelect={(type) => setVehicleType(type)} />
            )}

            {/* Brand Selection Overlay (Second Step) */}
            {vehicleType && !selectedBrand && (
                <div className="fixed inset-0 z-[60] bg-black p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Selecciona Marca</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold italic">Configuración de Protocolos: {pidDatabase[vehicleType].name}</p>
                        </div>
                        <button
                            onClick={() => setVehicleType(null)}
                            className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Cambiar Tipo
                        </button>
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

            {/* Universal Device Picker Modal */}
            <AnimatePresence>
                {uiStatus.showDevicePicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="w-full bg-zinc-950 border-t border-zinc-800 p-8 rounded-t-[2.5rem]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Tipo de Enlace</h3>
                                <button onClick={() => setUiStatus(prev => ({ ...prev, showDevicePicker: false }))} className="text-zinc-600 font-bold uppercase text-xs">Cerrar</button>
                            </div>

                            <div className="space-y-4">
                                {/* WiFi Option */}
                                <button
                                    onClick={() => handleConnect('real')}
                                    disabled={!connectionManager.getCapabilities().wifi.supported}
                                    className={`w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all text-left ${connectionManager.getCapabilities().wifi.supported ? 'hover:bg-blue-600/10 hover:border-blue-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">Interface Wi-Fi (Standard)</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">{connectionManager.getCapabilities().wifi.message} | TCP: 192.168.0.10</p>
                                    </div>
                                    <div className="p-2 bg-zinc-800 rounded-lg text-blue-500"><Activity size={12} /></div>
                                </button>

                                {/* Bluetooth Paired Devices o Fallback BLE */}
                                {devices.length > 0 ? devices.map((dev) => (
                                    <button
                                        key={dev.address}
                                        onClick={() => handleConnect('real')}
                                        className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-emerald-600/10 hover:border-emerald-500/50 transition-all text-left"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">{dev.name || 'Bluetooth Adapter'}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono italic">{dev.address}</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Activity size={12} /></div>
                                    </button>
                                )) : (
                                    <button
                                        onClick={() => alert("Iniciando escaneo BLE (Web Bluetooth) / Emparejamiento nativo...")}
                                        disabled={!connectionManager.getCapabilities().bluetooth.supported}
                                        className={`w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all text-left ${connectionManager.getCapabilities().bluetooth.supported ? 'hover:bg-emerald-600/10 hover:border-emerald-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">Bluetooth (BLE / Classic)</p>
                                            <p className="text-[10px] text-zinc-500 font-mono italic">{connectionManager.getCapabilities().bluetooth.message}</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Activity size={12} /></div>
                                    </button>
                                )}

                                {/* USB OTG Option */}
                                <button
                                    onClick={() => alert("Conecta tu cable USB-OTG y da permiso en el sistema.")}
                                    disabled={!connectionManager.getCapabilities().usb.supported}
                                    className={`w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all text-left ${connectionManager.getCapabilities().usb.supported ? 'hover:bg-amber-600/10 hover:border-amber-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">Cable USB / VAG-COM</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">{connectionManager.getCapabilities().usb.message}</p>
                                    </div>
                                    <div className="p-2 bg-zinc-800 rounded-lg text-amber-500"><Activity size={12} /></div>
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

            <AnimatePresence mode="wait">
                {activeTab === 'scanner' && (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                    >
                        <OBDDashboard
                            data={obdData}
                            onSaveReport={handleSaveReport}
                            saving={uiStatus.saving}
                            expertInsight={expertInsight}
                        />
                    </motion.div>
                )}

                {activeTab === 'analysis' && (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pb-24"
                    >
                        {/* Gráficos de Alta Precisión */}
                        <AdvancedTelemetry liveData={obdData} />

                        {/* Buscador de Códigos de Falla */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                            <div className="mb-6">
                                <h3 className="text-white font-black text-xl italic tracking-tighter uppercase">Librería DTC Global</h3>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Base de datos P, U, B, C (Actualizado 2024)</p>
                            </div>
                            <DtcLibrary vehicleData={vehicleData} />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'topology' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <TopologyView modules={topologyModules} />
                    </motion.div>
                )}

                {activeTab === 'program' && (
                    <motion.div
                        key="program"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                    >
                        <ProgrammingWorkspace />
                    </motion.div>
                )}

                {activeTab === 'actuations' && (
                    <motion.div
                        key="actuations"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="h-[calc(100vh-80px)] overflow-hidden"
                    >
                        <BidirectionalControl
                            connected={connected}
                            brand={selectedBrand}
                            vehicleType={vehicleType}
                        />
                    </motion.div>
                )}

                {(activeTab === 'service' || activeTab === 'resets') && (
                    <motion.div
                        key="service"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="p-4"
                    >
                        <ServiceMenu
                            vehicleType={vehicleType}
                            onServiceSelect={handleServiceSelect}
                        />
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <div className="flex flex-col">
                        <div className="flex border-b border-white/5 mb-8 overflow-x-auto px-4 gap-4">
                            <button
                                onClick={() => setSubTab('builder')}
                                className={`py-4 px-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${subTab === 'builder' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}
                            >
                                Cotizador
                            </button>
                            <button
                                onClick={() => setSubTab('history')}
                                className={`py-4 px-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${subTab === 'history' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}
                            >
                                Historial
                            </button>
                        </div>

                        {subTab === 'builder' ? (
                            <QuoteBuilder
                                vehicleData={memoizedVehicleData}
                                dtcs={obdData.dtcs}
                                onOpenConfig={handleOpenWorkshopConfig}
                                onGenerateReport={handleProfessionalReport}
                            />
                        ) : (
                            <ReportHistory />
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6"
                    >
                        <h2 className="text-2xl font-black uppercase italic mb-6 tracking-tighter">Centro de Gestión</h2>

                        {/* Generación de Reporte PDF (Session Actual) */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Generar Informe</h3>
                                    <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mt-1">Exportación Corporativa PDF</p>
                                </div>
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={uiStatus.saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                >
                                    <Activity size={12} className={uiStatus.saving ? 'animate-spin' : ''} />
                                    {uiStatus.saving ? 'PROCESANDO...' : 'GENERAR REPORTE'}
                                </button>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                                <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight">Vehículo Actual:</p>
                                <p className="text-xs font-black text-white mt-0.5">{vehicleData?.make || 'Genérico'} {vehicleData?.model || 'Universal'} <span className="text-zinc-600 ml-1">({memoizedVehicleData.vin})</span></p>
                            </div>
                        </div>

                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Historial de Sesiones</h3>
                        <div className="space-y-4">
                            {history.length > 0 ? (
                                history.map((report) => (
                                    <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase">{new Date(report.created_at).toLocaleDateString()}</span>
                                            {report.fault_logs?.length > 0 && <span className="text-[8px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">ALERTA</span>}
                                        </div>
                                        <p className="text-sm font-bold text-zinc-200 mb-2 truncate">{report.summary}</p>
                                        <div className="flex gap-6 mt-2 opacity-60">
                                            <div className="flex items-center gap-1">
                                                <Activity size={10} className="text-blue-400" />
                                                <span className="text-[10px] font-bold">{report.telemetry_streams?.find(t => t.pid === 'AT RV' || t.pid === 'BATTERY')?.value || 12.6}V</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Activity size={10} className="text-emerald-400" />
                                                <span className="text-[10px] font-bold">{report.telemetry_streams?.find(t => t.pid === '0104' || t.pid === 'ENGINE_LOAD')?.value || 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-20">
                                    <Info className="mx-auto mb-2" />
                                    <p className="text-[10px] uppercase font-bold tracking-widest leading-loose">Sincronizando con la nube...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div
                        key="ai"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="h-[calc(100vh-160px)]"
                    >
                        <AIDiagnostic
                            vehicleData={vehicleData}
                            obdData={obdData}
                            dtcs={[]}
                        />
                    </motion.div>
                )}

                {activeTab === 'id' && (
                    <motion.div
                        key="id"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="p-6 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar"
                    >
                        <VehiclePassport
                            vehicleData={vehicleData}
                            onDownloadReport={handleGenerateReport}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

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
                onClose={handleCloseWorkshopConfig}
                onSave={(config) => console.log("Config updated:", config)}
            />
            <AutomationConfig
                isOpen={uiStatus.showAutomationConfig}
                onClose={handleCloseAutomationConfig}
            />

            {agentAlert && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[200] bg-zinc-900 border-2 border-blue-500/50 p-4 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center gap-4"
                >
                    <div className={`p-3 rounded-2xl ${agentAlert.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        <Brain size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AutoTech AI Agent</h4>
                        <p className="text-xs text-white font-bold leading-tight">{agentAlert.msg}</p>
                    </div>
                    <button onClick={() => setAgentAlert(null)} className="p-2 text-zinc-500">
                        <X size={20} />
                    </button>
                </motion.div>
            )}

            {uiStatus.generatingReport && (
                <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                            <p className="text-white font-black uppercase italic tracking-widest">Generando Reporte Pro</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">IA Engine & PDF Renderer</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerApp;
