import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import { obdParser } from '../utils/obdParser';
import { connectionManager } from '../services/connectionManager';

/**
 * Agente Scanner: Responsable de la conexión y extracción de datos.
 * Funciona de forma autónoma una vez activado.
 */
class AgentScanner {
    constructor() {
        this.isActive = false;
        this.timeout = null;
        this.vehicleType = 'car';
        this.isReal = false;
        this.connectionType = 'bluetooth';
    }

    async start(config = { isReal: false, vehicleType: 'car', type: 'bluetooth' }) {
        if (this.isActive) return { success: true };
        
        this.isReal = config.isReal;
        this.vehicleType = config.vehicleType;
        this.connectionType = config.type || 'bluetooth';

        try {
            if (this.isReal) {
                eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: `Iniciando conexión ${this.connectionType.toUpperCase()}...`, priority: 'low' });
                
                let result;
                if (this.connectionType === 'wifi') {
                    result = await connectionManager.connectWiFi();
                } else if (this.connectionType === 'usb') {
                    result = await connectionManager.connectUSB();
                } else {
                    // Por defecto Bluetooth
                    // Intentar listar dispositivos primero si fuera necesario (omitido por brevedad)
                    result = await connectionManager.connectBluetooth(config.address || 'auto');
                }

                if (!result.success) {
                    throw new Error(result.error || `No se pudo conectar vía ${this.connectionType}`);
                }
            }

            this.isActive = true;
            eventBus.emit(AGENT_EVENTS.SCANNER_CONNECTED);
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Scanner Listo y Sincronizado", priority: 'low' });

            this.runPollingLoop();
            return { success: true };

        } catch (error) {
            this.isActive = false;
            console.error("AgentScanner Start Error:", error);
            return { success: false, error: error.message };
        }
    }

    async runPollingLoop() {
        if (!this.isActive) return;
        
        await this.poll();
        
        const delay = this.isReal ? 500 : 2000;
        this.timeout = setTimeout(() => this.runPollingLoop(), delay);
    }

    stop() {
        this.isActive = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        connectionManager.disconnect();
        eventBus.emit(AGENT_EVENTS.SCANNER_DISCONNECTED);
    }

    async poll() {
        if (!this.isActive) return;

        try {
            let data = {};
            if (this.isReal) {
                // Usar connectionManager para pollear
                const voltResp = await connectionManager.sendPID("AT RV");
                data.battery = obdParser.parseBatteryVoltage(voltResp.raw);
                
                const rpmResp = await connectionManager.sendPID("010C");
                const rpmData = obdParser.parseResponse(rpmResp.raw, this.vehicleType);
                data.rpm = rpmData.value || 0;

                if (!this.pollCount || this.pollCount % 10 === 0) {
                    const dtcResp = await connectionManager.sendPID("03");
                    data.codes = obdParser.parseDTCs(dtcResp.raw);
                }
                this.pollCount = (this.pollCount || 0) + 1;

            } else {
                // Simulación Autónoma
                const hasError = Math.random() > 0.98;
                data = {
                    battery: parseFloat((13.2 + Math.random() * 0.4).toFixed(1)),
                    rpm: Math.floor(Math.random() * 500 + 800),
                    temp: 85 + Math.floor(Math.random() * 5),
                    engineLoad: 15 + Math.floor(Math.random() * 10),
                    speed: Math.floor(Math.random() * 40),
                    codes: hasError ? [{ id: "P0171", status: "active", timestamp: new Date().toISOString() }] : [],
                    timestamp: new Date().getTime()
                };
            }

            eventBus.emit(AGENT_EVENTS.DATA_RECEIVED, data);
            
            if (Math.random() > 0.8) {
                const modules = [
                    { id: 'pos', name: 'PCM/ECU', status: 'ok', type: 'Powertrain' },
                    { id: 'abs', name: 'ABS/ESC', status: data.rpm > 3000 ? 'warning' : 'ok', type: 'Chassis' },
                    { id: 'srs', name: 'Airbag', status: 'ok', type: 'Safety' },
                    { id: 'tcm', name: 'Gearbox', status: 'ok', type: 'Transmission' },
                    { id: 'bcm', name: 'Body', status: 'ok', type: 'Comfort' },
                    { id: 'tpms', name: 'Tires', status: 'warning', type: 'Safety' },
                ];
                eventBus.emit(AGENT_EVENTS.TOPOLOGY_UPDATED, modules);
            }

            if (data.codes && data.codes.length > 0) {
                eventBus.emit(AGENT_EVENTS.DTC_DETECTED, data.codes);
            }
        } catch (error) {
            console.error("AgentScanner Poll Error:", error);
        }
    }
}

export const agentScanner = new AgentScanner();
