/**
 * AutoTech PRO - Global Event Bus
 * Patrón Pub/Sub centralizado para comunicación entre agentes y UI.
 */

class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * Suscribe un callback a un evento específico
     * @param {string} event - Nombre del evento
     * @param {function} callback - Función a ejecutar
     * @returns {function} Función para desuscribirse
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    /**
     * Emite un evento con datos asociados
     * @param {string} event - Nombre del evento
     * @param {any} data - Carga útil
     */
    emit(event, data) {
        // Emitir al evento específico
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en listener de evento ${event}:`, error);
                }
            });
        }

        // Emitir al wildcard '*'
        if (this.listeners['*']) {
            this.listeners['*'].forEach(callback => {
                try {
                    callback(data, event);
                } catch (error) {
                    console.error(`Error en wildcard listener:`, error);
                }
            });
        }
    }
}

export const eventBus = new EventBus();

// Diccionario de Eventos Estándar
export const AGENT_EVENTS = {
    SCANNER_CONNECTED: 'scanner:connected',
    SCANNER_DISCONNECTED: 'scanner:disconnected',
    DATA_RECEIVED: 'data:received',
    DTC_DETECTED: 'dtc:detected',
    ANALYSIS_COMPLETED: 'analysis:completed',
    INSIGHT_GENERATED: 'insight:generated',
    AI_INSIGHT_GENERATED: 'insight:ai_generated',
    REPORT_GENERATED: 'report:generated',
    REPORT_SENT: 'report:sent',
    UI_ALERT: 'ui:alert',
    TOPOLOGY_UPDATED: 'topology:updated'
};
