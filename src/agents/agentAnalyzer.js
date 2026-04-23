import { eventBus, AGENT_EVENTS } from '../services/eventBus';
import { expertAnalysisAgent } from './expertAnalysisAgent';

/**
 * Agente Analizador: Interpreta los datos recibidos.
 * No requiere intervención humana.
 */
class AgentAnalyzer {
    constructor() {
        this.vehicle = null;
        this.setupListeners();
    }

    setVehicle(vehicle) {
        this.vehicle = vehicle;
    }

    setupListeners() {
        eventBus.on(AGENT_EVENTS.DATA_RECEIVED, (data) => {
            this.process(data);
        });

        eventBus.on(AGENT_EVENTS.DTC_DETECTED, (codes) => {
            this.analyzeDTCs(codes);
        });
    }

    async process(data) {
        // Ejecutar heurísticas expertas (locales/rápidas)
        const insight = expertAnalysisAgent.analyze(data);
        
        if (insight) {
            eventBus.emit(AGENT_EVENTS.INSIGHT_GENERATED, insight);
            
            // Si es crítico o grave, y ha pasado tiempo suficiente, consultar a la IA
            const now = Date.now();
            const shouldConsultAI = (insight.severity === 'critical' || insight.severity === 'high') && 
                                   (!this.lastAIAnalysis || now - this.lastAIAnalysis > 30000); // 30s cooldown

            if (shouldConsultAI) {
                this.lastAIAnalysis = now;
                eventBus.emit(AGENT_EVENTS.UI_ALERT, { 
                    msg: "Iniciando consulta profunda con IA Expert...", 
                    priority: 'medium' 
                });

                const aiResult = await expertAnalysisAgent.askAI(data, insight, this.vehicle);
                
                if (aiResult) {
                    eventBus.emit(AGENT_EVENTS.AI_INSIGHT_GENERATED, {
                        ...aiResult,
                        originalInsight: insight,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // Alerta inmediata de UI para el insight local
            if (insight.severity === 'critical') {
                eventBus.emit(AGENT_EVENTS.UI_ALERT, { 
                    msg: `PELIGRO: ${insight.diagnosis}`, 
                    priority: 'high' 
                });
            }
        }
    }

    analyzeDTCs(codes) {
        // Lógica para buscar detalles de códigos de forma autónoma
        eventBus.emit(AGENT_EVENTS.UI_ALERT, { 
            msg: `Analizando ${codes.length} códigos de falla detectados...`, 
            priority: 'medium' 
        });
        
        // Simular terminación de análisis profundo
        setTimeout(() => {
            eventBus.emit(AGENT_EVENTS.ANALYSIS_COMPLETED, {
                summary: "Análisis de fallas completado. Se requiere revisión de mezcla de aire.",
                timestamp: new Date().toISOString()
            });
        }, 1500);
    }
}

export const agentAnalyzer = new AgentAnalyzer();
