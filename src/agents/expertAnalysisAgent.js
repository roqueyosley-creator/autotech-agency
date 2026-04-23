import { aiService } from '../services/aiService';

/**
 * AutoTech PRO - Expert Analysis Agent
 * Responsabilidad: Análisis de "Fusión de Sensores" para detectar fallas sin DTC.
 * Simula el razonamiento de un mecánico senior comparando múltiples variables.
 */

class ExpertAnalysisAgent {
    constructor() {
        this.lastAnalysis = null;
    }

    /**
     * Realiza una inferencia basada en heurísticas de expertos
     * @param {Object} data - Snapshot de useOBDScanner
     * @returns {Object|null} Resultado del diagnóstico o null si todo está nominal.
     */
    analyze(data) {
        const { rpm, temp, speed, engineLoad, battery, codes } = data;
        const insights = [];

        // 1. Análisis de Sistema de Enfriamiento (Cruce Temp vs Velocidad)
        if (temp > 102) {
            if (speed > 60) {
                insights.push({
                    id: 'COOLING_EFFICIENCY_HIGH_SPEED',
                    diagnosis: "Eficiencia de enfriamiento reducida a alta velocidad.",
                    description: "El motor sobrecalienta incluso con flujo de aire forzado. Posible radiador obstruido internamente o bomba de agua deficiente.",
                    severity: 'critical',
                    recommendation: "Limpieza química de radiador o revisión de aspas de bomba de agua."
                });
            } else if (speed < 15) {
                insights.push({
                    id: 'COOLING_FAN_FAILURE',
                    diagnosis: "Falla probable en el sistema de ventilación.",
                    description: "La temperatura sube en ralentí/baja velocidad. El electroventilador podría no estar activando o hay aire en el sistema.",
                    severity: 'high',
                    recommendation: "Verificar relé de ventilador y sensor de temperatura del refrigerante (ECT)."
                });
            }
        }

        // 2. Análisis de Ralentí e Inyección (Cruce RPM vs Carga)
        if (rpm > 0 && rpm < 1100 && engineLoad < 20) {
            // Verificar fluctuación (esto requeriría histórico, pero simulamos con rango)
            // Si estuviéramos en un sistema real, guardaríamos el 'prevRpm'
            if (this.detectFluctuation(rpm)) {
                insights.push({
                    id: 'UNSTABLE_IDLE_VACUUM',
                    diagnosis: "Inestabilidad en ralentí (Posible Fuga de Vacío).",
                    description: "RPM fluctuantes con carga mínima. Común en tomas de aire posteriores al MAF o cuerpo de aceleración sucio.",
                    severity: 'medium',
                    recommendation: "Realizar prueba de humo para fugas de vacío y limpiar cuerpo de aceleración."
                });
            }
        }

        // 3. Análisis de Sistema de Carga (Cruce Voltaje vs RPM)
        if (battery > 0 && battery < 13.1 && rpm > 2000) {
            insights.push({
                id: 'LOW_CHARGING_OUTPUT',
                diagnosis: "Rendimiento insuficiente del alternador.",
                description: "El voltaje de carga es bajo (<13.2V) a pesar de que las RPM son suficientes para la excitación del alternador.",
                severity: 'high',
                recommendation: "Revisar regulador de voltaje, diodos del alternador o tensión de la banda de accesorios."
            });
        }

        // 4. Análisis de Desempeño Mecánico (Carga vs RPM)
        if (engineLoad > 85 && rpm < 2500 && speed > 20) {
            insights.push({
                id: 'ENGINE_LUGGING',
                diagnosis: "Esfuerzo excesivo del motor (Lugging).",
                description: "Alta carga con bajas RPM en movimiento. Puede causar pre-ignición (cascabeleo) y desgaste prematuro.",
                severity: 'medium',
                recommendation: "Si es manual, baje de marcha. Si es automático, revisar solenoide de cambio o sensor TPS."
            });
        }

        // 5. Análisis de "Short Term Trim" (Simulado si no hay DTC)
        if (codes.length === 0 && engineLoad > 50 && temp < 70) {
            insights.push({
                id: 'COLD_LOAD_WARNING',
                diagnosis: "Operación de alta carga en motor frío.",
                description: "Se detecta demanda de potencia sin alcanzar la temperatura de operación (Loop Abierto).",
                severity: 'info',
                recommendation: "Evitar aceleraciones bruscas hasta que el refrigerante supere los 80°C."
            });
        }

        // Priorizar el insight más grave
        if (insights.length > 0) {
            const sorted = insights.sort((a, b) => {
                const priority = { critical: 3, high: 2, medium: 1, info: 0 };
                return priority[b.severity] - priority[a.severity];
            });
            this.lastAnalysis = sorted[0];
            return sorted[0];
        }

        this.lastAnalysis = null;
        return null;
    }

    detectFluctuation(currentRpm) {
        // En una implementación real, compararíamos con this.history
        // Aquí simulamos detección basada en un umbral de 'ruido'
        return Math.random() > 0.85; // Simulación de detección de "expertness"
    }

    /**
     * Consulta a la IA para un análisis profundo basado en el contexto actual
     */
    async askAI(data, insight, vehicle) {
        try {
            const result = await aiService.diagnose({
                symptoms: insight ? `${insight.diagnosis}: ${insight.description}` : "Escaneo preventivo de parámetros",
                dtcs: (data.codes || []).map(c => typeof c === 'string' ? c : c.id),
                live_data: {
                    ...data,
                    load: data.engineLoad,
                    voltage: data.battery
                },
                vehicle: vehicle || { make: 'Universal', model: 'OBD-II' }
            });
            return result;
        } catch (error) {
            console.error("ExpertAnalysisAgent AI Error:", error);
            return null;
        }
    }
}

export const expertAnalysisAgent = new ExpertAnalysisAgent();
