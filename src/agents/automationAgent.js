/**
 * AutoTech PRO - Automation & Orchestration Agent
 * Responsabilidad: Automatización post-diagnóstico, envíos a webhooks y persistencia silenciosa.
 */
import { reportService } from '../services/reportService';
import { diagnosticService } from '../services/diagnosticService';
import { dtcService } from '../services/dtcService';

class AutomationAgent {
    constructor() {
        this.queue = JSON.parse(localStorage.getItem('automation_queue') || '[]');
        this.isProcessing = false;
        this.config = {
            webhookUrl: localStorage.getItem('agent_webhook_url') || '',
            telegramToken: localStorage.getItem('agent_telegram_token') || '',
            telegramChatId: localStorage.getItem('agent_telegram_chat_id') || '',
            autoReport: true,
            autoSave: true
        };

        // Iniciar procesador de cola para reintentos / modo offline
        if (this.queue.length > 0) {
            this.processQueue();
        }
    }

    /**
     * Punto de entrada principal al terminar un escaneo
     */
    async onScanComplete(obdData, vehicleData) {
        console.log("AutomationAgent: Scan complete received. Starting workflow...");
        
        try {
            // 1. Análisis de patrones repetidos
            const patterns = await this.detectPatterns(obdData, vehicleData.vin);
            
            // 2. Persistencia automática (Silenciosa)
            let sessionResult = null;
            if (this.config.autoSave) {
                sessionResult = await diagnosticService.saveReport(vehicleData, obdData);
            }

            // 3. Generación de Reporte Automático
            let reportResult = null;
            if (this.config.autoReport) {
                const reportInputs = {
                    vehicleData,
                    dtcs: obdData.dtcs || [],
                    telemetry: obdData.liveData || {},
                    notes: patterns.found ? `Detectado patrón recurrente: ${patterns.description}` : 'Escaneo automático completado.'
                };
                reportResult = await reportService.generate(reportInputs);
            }

            // 4. Envío a Webhooks / Telegram
            if (reportResult) {
                this.enqueueDelivery({
                    type: 'WEBHOOK_DELIVERY',
                    payload: {
                        report_url: reportResult.url,
                        vehicle: `${vehicleData.make} ${vehicleData.model}`,
                        vin: vehicleData.vin,
                        dtcs: obdData.dtcs || [],
                        timestamp: new Date().toISOString()
                    }
                });
            }

            return { success: true, report: reportResult, session: sessionResult };
        } catch (error) {
            console.error("AutomationAgent: Error in workflow:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Detecta si una falla se ha repetido en sesiones anteriores
     */
    async detectPatterns(obdData, vin) {
        try {
            const { data: history } = await diagnosticService.getHistory(vin);
            if (!history || history.length === 0) return { found: false };

            const currentDtcs = (obdData.dtcs || []).map(d => d.id || d.code);
            const pastDtcs = history.flatMap(session => (session.fault_logs || []).map(log => log.dtc_code));

            const recurring = currentDtcs.filter(dtc => pastDtcs.includes(dtc));

            if (recurring.length > 0) {
                return {
                    found: true,
                    description: `Los códigos ${recurring.join(', ')} han aparecido en sesiones previas.`
                };
            }
        } catch (e) {
            console.warn("AutomationAgent: Could not analyze patterns due to history access error.");
        }
        return { found: false };
    }

    /**
     * Encola tareas genéricas (Punto de entrada compatible con otros agentes)
     */
    queueTask(type, payload) {
        this.enqueueDelivery({
            type: type === 'SEND_WEBHOOK' ? 'WEBHOOK_DELIVERY' : type,
            payload
        });
    }

    /**
     * Encola tareas para envío (Soporte Offline + Reintentos)
     */
    enqueueDelivery(task) {
        this.queue.push({
            ...task,
            id: `task_${Date.now()}`,
            retries: 0,
            status: 'pending'
        });
        this.persistQueue();
        this.processQueue();
    }

    persistQueue() {
        localStorage.setItem('automation_queue', JSON.stringify(this.queue));
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        const task = this.queue[0];
        
        try {
            switch (task.type) {
                case 'WEBHOOK_DELIVERY':
                    await this.sendToWebhook(task.payload);
                    break;
                case 'GENERATE_PDF':
                    await reportService.generate(task.payload);
                    break;
                case 'SAVE_REPORT':
                    await diagnosticService.saveReport(task.payload.vehicle, task.payload.data);
                    break;
                default:
                    console.warn(`AutomationAgent: Unknown task type ${task.type}`);
            }
            
            // Si tiene éxito, eliminar de la cola
            this.queue.shift();
            console.log(`AutomationAgent: Task ${task.id} (${task.type}) processed successfully.`);
        } catch (error) {
            task.retries++;
            console.warn(`AutomationAgent: Task ${task.id} failed. Retry #${task.retries}`);
            
            if (task.retries > 5) {
                this.queue.shift(); // Descartar tras 5 intentos
            } else {
                // Mover al final para reintentar luego
                this.queue.push(this.queue.shift());
                // Esperar un poco antes de reintentar la cola
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        this.persistQueue();
        this.isProcessing = false;
        
        // Continuar con la siguiente tarea si hay
        if (this.queue.length > 0) this.processQueue();
    }

    async sendToWebhook(data) {
        // Enviar a Webhook Genérico (n8n/Make)
        if (this.config.webhookUrl) {
            const res = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Webhook Error");
        }

        // Enviar a Telegram Bot si está configurado
        if (this.config.telegramToken && this.config.telegramChatId) {
            const message = `🚀 *AutoTech PRO Automation*\n\n` +
                          `📦 *Vehículo:* ${data.vehicle}\n` +
                          `🆔 *VIN:* ${data.vin}\n` +
                          `⚠️ *Fallas:* ${data.dtcs.length}\n` +
                          `📄 *Reporte:* [Ver PDF](${data.report_url})`;
            
            const telegramUrl = `https://api.telegram.org/bot${this.config.telegramToken}/sendMessage`;
            const res = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.config.telegramChatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            if (!res.ok) throw new Error("Telegram Error");
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        Object.entries(newConfig).forEach(([key, val]) => {
            localStorage.setItem(`agent_${key}`, val);
        });
    }
}

export const automationAgent = new AutomationAgent();
