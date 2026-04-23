/**
 * Máquina de Estados para la inicialización y detección automática de vehículos.
 * 
 * Basado en investigaciones de repositorios J2534 y foros (OpenGarages, EcuConnections):
 * - Los automóviles modernos (>2008) responden predominantemente a ISO 15765-4 CAN (11bit/500kb - Protocolo 6 en ELM327).
 * - Muchas motocicletas (Honda, Yamaha, Suzuki pre-2020) utilizan K-Line bajo ISO 14230-4 KWP (Fast Init o 5 Baud Init - Protocolos 4 y 5).
 * - Los rangos de PIDs difieren: las RPM máximas en motos a menudo superan las 12k, mientras que en autos rara vez superan las 8k.
 */

import { connectionManager } from '../services/connectionManager';

// Estados de la máquina
const STATES = {
    INIT: 'INIT',
    TRY_CAN_BUS: 'TRY_CAN_BUS',
    VERIFY_VIN: 'VERIFY_VIN',
    TRY_KWP2000: 'TRY_KWP2000',
    VERIFY_MOTO_PIDS: 'VERIFY_MOTO_PIDS',
    DONE: 'DONE',
    ERROR: 'ERROR'
};

// Configuración de timeouts por comando (en ms)
const CMD_TIMEOUT = 800; 

class SmartHandshake {
    constructor() {
        this.state = STATES.INIT;
        this.result = {
            vehicle_type: 'unknown',
            protocol_detected: 'none',
            confidence_score: 0
        };
        this.vin = null;
    }

    /**
     * Envoltorio para enviar comandos con Timeout para no bloquear el adaptador.
     */
    async _sendWithTimeout(command, timeout = CMD_TIMEOUT) {
        return Promise.race([
            connectionManager.sendRaw(command + '\r').then(() => this._readUntilPrompt(timeout)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeout))
        ]);
    }

    /**
     * Lectura desde el Connection Manager hasta obtener el prompt '>'
     * *Nota: Esta implementación asume que sendPID() o leer del stream resuelve tras recibir '>'
     * Para este handshake simulamos la lectura consumiendo sendPID del manager si existe, 
     * o usando lógica adaptada.
     */
    async _readUntilPrompt(timeout) {
        // En un caso real leemos del buffer del connectionManager.
        // Aquí usamos sendPID como proxy genérico para lectura cruda.
        try {
            const resp = await connectionManager.sendPID(''); 
            return resp.raw || '';
        } catch (e) {
            return '';
        }
    }

    async run() {
        this.state = STATES.INIT;
        const startTime = Date.now();

        try {
            while (this.state !== STATES.DONE && this.state !== STATES.ERROR) {
                // Protección global de tiempo máximo de ejecución (5 segundos)
                if (Date.now() - startTime > 4500) {
                    this.state = STATES.ERROR;
                    break;
                }
                await this._tick();
            }
        } catch (error) {
            console.error("Smart Handshake falló:", error);
            this.state = STATES.ERROR;
        }

        // Si no se detectó nada pero finalizó, devolvemos lo que hay
        if (this.result.vehicle_type === 'unknown' && this.state === STATES.ERROR) {
             this.result.confidence_score = 0;
        }

        return this.result;
    }

    async _tick() {
        switch (this.state) {
            case STATES.INIT:
                // Reseteo del chip OBD a estado inicial
                await this._sendWithTimeout('ATZ', 1000);
                await this._sendWithTimeout('ATE0', 500); // Eco off
                this.state = STATES.TRY_CAN_BUS;
                break;

            case STATES.TRY_CAN_BUS:
                // Intentar Protocolo 6: ISO 15765-4 CAN (11 bit ID, 500 kbaud)
                await this._sendWithTimeout('ATSP6');
                const canResp = await this._sendWithTimeout('0100'); // Solicitar PIDs soportados
                
                if (canResp.includes('41 00') || canResp.replace(/\s/g, '').includes('4100')) {
                    this.result.protocol_detected = 'ISO 15765-4 CAN (11/500)';
                    this.state = STATES.VERIFY_VIN;
                } else {
                    // Si responde NO DATA o BUS INIT ERROR
                    this.state = STATES.TRY_KWP2000;
                }
                break;

            case STATES.VERIFY_VIN:
                // Solicitar VIN (Modo 09 PID 02)
                const vinResp = await this._sendWithTimeout('0902', 1500);
                this.vin = this._parseVIN(vinResp);
                
                if (this.vin) {
                    this.result.vehicle_type = 'car';
                    // Los VIN de autos estándares son muy estructurados. 
                    this.result.confidence_score = 90; 
                    
                    // Verificación extra cruzando WMI (Primeros 3 caracteres)
                    const motoWMIs = ['JH2', 'VG5', 'ZDC', 'LML', 'VTM']; // Ejemplos Honda, Yamaha, Aprilia...
                    if (motoWMIs.some(wmi => this.vin.startsWith(wmi))) {
                        this.result.vehicle_type = 'moto';
                        this.result.confidence_score = 95;
                    }
                } else {
                    // Si no soporta VIN, asumimos auto antiguo o genérico con confianza media
                    this.result.vehicle_type = 'car';
                    this.result.confidence_score = 60;
                }
                
                this.state = STATES.DONE;
                break;

            case STATES.TRY_KWP2000:
                // Intentar Protocolo 5: ISO 14230-4 KWP (fast init, 10.4 kbaud)
                // Usado comúnmente en motos y autos asiáticos pre-2008
                await this._sendWithTimeout('ATSP5');
                const kwpResp = await this._sendWithTimeout('0100', 1500); // KWP Init toma más tiempo
                
                if (kwpResp.includes('41 00') || kwpResp.replace(/\s/g, '').includes('4100')) {
                    this.result.protocol_detected = 'ISO 14230-4 KWP (Fast)';
                    this.state = STATES.VERIFY_MOTO_PIDS;
                } else {
                    // Fallaron ambos (CAN y KWP). Sin conexión real.
                    this.state = STATES.ERROR;
                }
                break;

            case STATES.VERIFY_MOTO_PIDS:
                // Verificación cruzada heurística
                // Solicitar RPM (010C) y Posición del acelerador TPS (0111)
                
                // Muchas motos en idle giran a 1200-1500 RPM (más alto que un auto 600-800 RPM)
                // Además consultamos un PID no estándar si es posible, pero nos basamos en comportamiento de lectura
                const rpmResp = await this._sendWithTimeout('010C');
                const rpm = this._parseRPM(rpmResp);

                if (rpm > 1200) {
                    this.result.vehicle_type = 'moto';
                    this.result.confidence_score = 85;
                } else {
                    this.result.vehicle_type = 'unknown'; // Ambigüedad
                    this.result.confidence_score = 50;
                }
                
                this.state = STATES.DONE;
                break;

            default:
                this.state = STATES.ERROR;
                break;
        }
    }

    _parseVIN(hexString) {
        // En una respuesta ELM327 típica (49 02 01 ...), decodificar HEX a ASCII
        // Ignorando los primeros bytes de encabezado.
        const cleanHex = hexString.replace(/\s|>|\r|\n/g, '');
        if (!cleanHex || cleanHex.length < 34) return null; // Un VIN tiene 17 chars (34 hex)
        
        let vin = '';
        // Extracción simplificada (asume respuesta concatenada sin control de multilinea complejo)
        const dataPart = cleanHex.substring(cleanHex.indexOf('4902') + 6);
        for (let i = 0; i < dataPart.length; i += 2) {
            const charCode = parseInt(dataPart.substr(i, 2), 16);
            if (charCode >= 32 && charCode <= 126) {
                vin += String.fromCharCode(charCode);
            }
        }
        return vin.length >= 17 ? vin.substring(vin.length - 17) : null;
    }

    _parseRPM(hexString) {
        const cleanHex = hexString.replace(/\s|>|\r|\n/g, '');
        const match = cleanHex.match(/410C([0-9A-F]{4})/i);
        if (match && match[1]) {
            const A = parseInt(match[1].substr(0, 2), 16);
            const B = parseInt(match[1].substr(2, 2), 16);
            return ((A * 256) + B) / 4;
        }
        return 0;
    }
}

export const smartHandshake = new SmartHandshake();
