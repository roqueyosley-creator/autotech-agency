/**
 * AutoTech PRO - Agent Orchestrator
 * El "Cerebro" que inicializa y coordina la red de agentes autónomos.
 */
import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import { agentScanner } from './agentScanner';
import { agentAnalyzer } from './agentAnalyzer';
import { agentReporter } from './agentReporter';

class AgentOrchestrator {
    constructor() {
        this.agents = {
            scanner: agentScanner,
            analyzer: agentAnalyzer,
            reporter: agentReporter
        };
        this.isInitialized = false;
        this.vehicleContext = null;
    }

    /**
     * Inicializa la red de agentes y el sistema de eventos global
     */
    init() {
        if (this.isInitialized) return;
        
        console.log("🚀 Orquestador de Agentes Iniciado...");
        
        // El Analyzer y Reporter ya se auto-suscriben al bus en su constructor
        // solo necesitamos asegurar que sus instancias existan
        this.isInitialized = true;

        // Listener global para depuración de la red
        eventBus.on('*', (data, event) => {
            console.log(`[NETWORK EVENT] ${event}:`, data);
        });
    }

    /**
     * Comando central para iniciar el ciclo autónomo
     */
    async startMission(config) {
        this.init();
        return await this.agents.scanner.start(config);
    }

    setVehicleContext(vehicle) {
        this.vehicleContext = vehicle;
        this.agents.analyzer.setVehicle(vehicle);
    }

    stopMission() {
        this.agents.scanner.stop();
    }

    // Proxy para suscribirse a eventos desde la UI
    subscribe(event, callback) {
        return eventBus.on(event, callback);
    }

    // Emitir eventos desde la UI (ej: cambios de config)
    emit(event, data) {
        eventBus.emit(event, data);
    }
}

export const mainAgent = new AgentOrchestrator();
