import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import { automationAgent } from './automationAgent';
import { reportService } from '../services/reportService';
import { diagnosticService } from '../services/diagnosticService';

/**
 * Agente Reporter: Gestiona la documentación y entrega de resultados.
 */
class AgentReporter {
    constructor() {
        this.setupListeners();
        this.currentSessionData = null;
    }

    setupListeners() {
        // Acumular datos para el reporte final
        eventBus.on(AGENT_EVENTS.DATA_RECEIVED, (data) => {
            this.currentSessionData = data;
        });

        // Al terminar el escaneo (desconexión), generar reporte
        eventBus.on(AGENT_EVENTS.SCANNER_DISCONNECTED, () => {
            this.generateFinalReport();
        });

        // También puede dispararse por un análisis crítico completado
        eventBus.on(AGENT_EVENTS.ANALYSIS_COMPLETED, (analysis) => {
            if (analysis.isUrgent) {
                this.generateFinalReport(analysis);
            }
        });
    }

    async generateFinalReport(extraInfo = {}) {
        if (!this.currentSessionData) return;

        eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Generando Reporte Automático...", priority: 'low' });

        try {
            // 1. Guardar en Base de Datos (Supabase)
            const vehicleInfo = {
                vin: this.currentSessionData.vin || 'VIN-AUTO-GEN',
                make: this.currentSessionData.make || 'Universal',
                model: this.currentSessionData.model || 'OBD-II'
            };

            const saved = await diagnosticService.saveReport(vehicleInfo, {
                ...this.currentSessionData,
                ...extraInfo
            });

            // 2. Generar PDF (vía AutomationAgent que ya tiene la lógica de cola/reintentos)
            automationAgent.queueTask('GENERATE_PDF', {
                data: this.currentSessionData,
                reportId: saved.id
            });

            // 3. Enviar Notificaciones
            automationAgent.queueTask('SEND_WEBHOOK', {
                type: 'scan_complete',
                summary: "Diagnóstico finalizado por Agente de Reportería."
            });

            eventBus.emit(AGENT_EVENTS.REPORT_GENERATED, { id: saved.id });
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Reporte y Notificaciones en Cola", priority: 'low' });

        } catch (error) {
            console.error("AgentReporter Error:", error);
            eventBus.emit(AGENT_EVENTS.UI_ALERT, { msg: "Error en Reportería Autónoma", priority: 'high' });
        }
    }
}

export const agentReporter = new AgentReporter();
