import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import { obdParser } from '../utils/obdParser';
import { bluetoothService } from '../services/bluetoothService';
import { pidDatabase } from '../utils/pidDatabase';

/**
 * Agente Scanner: Responsable de la conexión y extracción de datos.
 * Funciona de forma autónoma una vez activado.
 */
class AgentScanner {
    constructor() {
        this.isActive = false;
        this.interval = null;
        this.vehicleType = 'car';
        this.isReal = false;
    }

    start(config = { isReal: false, vehicleType: 'car' }) {
        if (this.isActive) return;
        this.isActive = true;
        this.isReal = config.isReal;
        this.vehicleType = config.vehicleType;

        eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Agente Scanner Iniciado", priority: 'low' });

        this.interval = setInterval(() => this.poll(), this.isReal ? 500 : 2000);
    }

    stop() {
        this.isActive = false;
        if (this.interval) clearInterval(this.interval);
        eventBus.emit(AGENT_EVENTS.SCANNER_DISCONNECTED);
    }

    async poll() {
        if (!this.isActive) return;

        try {
            let data = {};
            if (this.isReal) {
                // Lógica de polling real (simplificada para el ejemplo)
                const voltRaw = await bluetoothService.sendPID("AT RV");
                data.battery = obdParser.parseBatteryVoltage(voltRaw);
                // ... más PIDs
            } else {
                // Simulación Autónoma
                data = {
                    battery: parseFloat((13.2 + Math.random() * 0.4).toFixed(1)),
                    rpm: Math.floor(Math.random() * 500 + 800),
                    temp: 85 + Math.floor(Math.random() * 5),
                    engineLoad: 15 + Math.floor(Math.random() * 10),
                    speed: Math.floor(Math.random() * 40),
                    codes: Math.random() > 0.95 ? [{ id: "P0171", status: "active" }] : [],
                    timestamp: new Date().getTime()
                };
            }

            eventBus.emit(AGENT_EVENTS.DATA_RECEIVED, data);
            
            // Simular detección de red (Topología) periódicamente
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
