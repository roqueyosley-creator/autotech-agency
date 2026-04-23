import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Info } from 'lucide-react';

import { bluetoothService } from './services/bluetoothService';
import { connectionManager } from './services/connectionManager';
import { diagnosticService } from './services/diagnosticService';
import { useOBDScanner } from './utils/useOBDScanner';
import { smartHandshake } from './utils/smartHandshake';

import OBDDashboard from './components/OBDDashboard';
import ComparisonDashboard from './components/ComparisonDashboard';
import ProgrammingWorkspace from './components/ProgrammingWorkspace';
import TopologyView from './components/TopologyView';
import ServiceMenu from './components/ServiceMenu';
import BottomNav from './components/BottomNav';
import VehicleTypeSelector from './components/VehicleTypeSelector';
import AdvancedTelemetry from './components/AdvancedTelemetry';
import DtcLibrary from './components/DtcLibrary';
import { vinService } from './services/vinService';
import { dtcService } from './services/dtcService';
import { generateDiagnosticReport } from './components/DiagnosticReport';
import { pidDatabase } from './utils/pidDatabase';

const ScannerApp = () => {
    const [activeTab, setActiveTab] = useState('scanner');
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedVin] = useState('VIN-MOBILE-001');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [vehicleType, setVehicleType] = useState(null); // 'car' | 'moto'
    const [vehicleData, setVehicleData] = useState(null); // Decoded VIN Info

    // Universal Connection State
    const [connected, setConnected] = useState(false);
    const [connectionType, setConnectionType] = useState(null); // 'bt' | 'wifi' | 'usb'
    const [devices, setDevices] = useState([]);
    const [showDevicePicker, setShowDevicePicker] = useState(false);
    const [btLoading, setBtLoading] = useState(false);

    const brands = {
        car: ["Toyota", "Ford", "BMW", "Audi", "Hyundai", "Honda", "Tesla", "Universal"],
        moto: ["Honda", "Yamaha", "KTM", "BMW", "Kawasaki", "Ducati", "Suzuki", "Euro 5 Standard"]
    };

    // Scanner Hook
    const obdData = useOBDScanner(
        (activeTab === 'scanner' || activeTab === 'topology' || activeTab === 'analysis'),
        connected,
        vehicleType
    );

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        const { data } = await diagnosticService.getHistory(selectedVin);
        if (data) setHistory(data);
    };

    const runSmartHandshake = async () => {
        // Ejecutar Detección Automática de Vehículo
        const handshakeResult = await smartHandshake.run();
        
        if (handshakeResult.vehicle_type !== 'unknown') {
            setVehicleType(handshakeResult.vehicle_type);
        }

        // Decodificación Automática de VIN (Referencia: Foros OpenGarages / J2534)
        if (handshakeResult.vin && handshakeResult.vin !== 'UNKNOWN') {
            const decoded = await vinService.decode(handshakeResult.vin);
            if (decoded) setVehicleData(decoded);
        }

        setBtLoading(false);
    };

    const handleConnectWiFi = async () => {
        setBtLoading(true);
        const result = await connectionManager.connectWiFi();
        if (result.success) {
            setConnected(true);
            setConnectionType('wifi');
            setShowDevicePicker(false);
            await runSmartHandshake();
        } else {
            alert("Error WiFi: " + result.error);
            setBtLoading(false);
        }
    };

    const handleConnectBT = async (address) => {
        setBtLoading(true);
        const result = await connectionManager.connectBluetooth(address);
        if (result.success) {
            setConnected(true);
            setConnectionType('bt');
            setShowDevicePicker(false);
            await runSmartHandshake();
        } else {
            alert("Error Bluetooth.");
            setBtLoading(false);
        }
    };

    const scanDevices = async () => {
        setBtLoading(true);
        try {
            const list = await bluetoothService.listPairedDevices();
            setDevices(list);
            setShowDevicePicker(true);
        } catch (e) {
            // Si falla listPaired (como en web), igual permitimos ver el selector para simular WiFi
            setDevices([]);
            setShowDevicePicker(true);
        } finally {
            setBtLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setSaving(true);
        try {
            const reportData = {
                vehicleData: vehicleData || { vin: selectedVin, make: 'Genérico', model: 'Universal', year: '2024', type: vehicleType },
                dtcs: obdData.dtcs || [],
                telemetry: {
                    rpm: obdData.rpm,
                    load: obdData.load,
                    temp: obdData.temp,
                    voltage: obdData.voltage
                },
                workshopInfo: {
                    name: "AutoTech Agency - Premium Workshop",
                    address: "Av. Principal 123, Ciudad de México",
                    contact: "+52 55 1234 5678"
                }
            };

            const result = await generateDiagnosticReport(reportData);
            
            // Descarga Local
            const link = document.createElement('a');
            link.href = result.url;
            link.download = `Reporte_${reportData.vehicleData.vin}.pdf`;
            link.click();

            // Preparación para Webhook (n8n/Telegram)
            console.log("Payload Base64 listo para Webhook:", result.base64.substring(0, 100) + "...");
            
            alert("Reporte generado con éxito. Listo para envío a Telegram.");
        } catch (error) {
            console.error("Error al generar reporte:", error);
            alert("Error al generar el reporte PDF.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveReport = async () => {
        setSaving(true);
        const vehicleData = {
            vin: selectedVin,
            make: selectedBrand,
            type: vehicleType,
            model: 'Desconocido', // TODO: Obtener del decodificador VIN
            year: new Date().getFullYear()
        };
        const result = await diagnosticService.saveReport(vehicleData, obdData);
        if (result.success) {
            fetchHistory();
        }
        setSaving(false);
    };

    /**
     * Ejecuta un servicio especial del menú (reset de aceite, calibración, etc.)
     * @param {string} serviceId - Identificador del servicio a ejecutar.
     */
    const handleExecuteService = async (serviceId) => {
        console.log(`[ServiceMenu] Ejecutando servicio: ${serviceId}`);
        // Mapa de comandos AT extendidos por servicio
        const serviceCommands = {
            'oil_reset': ['0400', '04'],        // Reset Modo 04
            'dpf_regen': ['ATSH 7E0', '2C3D01'], // DPF Forzado (ejemplo)
            'throttle_cal': ['ATSH 7E0', '0403'],
        };
        const cmds = serviceCommands[serviceId];
        if (cmds && connected) {
            for (const cmd of cmds) {
                await bluetoothService.sendPID(cmd);
            }
        } else {
            alert(`Servicio "${serviceId}" listo. Conecta un adaptador para ejecutarlo en el vehículo.`);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white pb-24 selection:bg-blue-500/30">
            {/* App Header Bar */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-lg border-b border-white/5">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tighter uppercase italic">AutoTech <span className="text-blue-500">PRO</span></span>
                    </div>
                    {selectedBrand && <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">Vehicle: {selectedBrand} | Mode: {connectionType?.toUpperCase()}</span>}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={connected ? () => connectionManager.disconnect().then(() => setConnected(false)) : scanDevices}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all duration-300 ${connected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                            }`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                        {connected ? 'En Línea' : 'Conectar'}
                    </button>
                    {obdData.dtcs > 0 && (
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
                        {brands[vehicleType].map(brand => (
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
                {showDevicePicker && (
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
                                <button onClick={() => setShowDevicePicker(false)} className="text-zinc-600 font-bold uppercase text-xs">Cerrar</button>
                            </div>

                            <div className="space-y-4">
                                {/* WiFi Option */}
                                <button
                                    onClick={handleConnectWiFi}
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
                                        onClick={() => handleConnectBT(dev.address)}
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

                            {btLoading && (
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
                        <OBDDashboard data={obdData} onSaveReport={handleSaveReport} saving={saving} />
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
                            <DtcLibrary />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'topology' && (
                    <motion.div
                        key="topology"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4"
                    >
                        <TopologyView />
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

                {activeTab === 'service' && (
                    <motion.div
                        key="service"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                    >
                        <ServiceMenu onFunctionClick={handleExecuteService} />
                    </motion.div>
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
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                >
                                    <Activity size={12} className={saving ? 'animate-spin' : ''} />
                                    {saving ? 'PROCESANDO...' : 'GENERAR REPORTE'}
                                </button>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                                <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight">Vehículo Actual:</p>
                                <p className="text-xs font-black text-white mt-0.5">{vehicleData?.make || 'Genérico'} {vehicleData?.model || 'Universal'} <span className="text-zinc-600 ml-1">({selectedVin})</span></p>
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
            </AnimatePresence>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default ScannerApp;
