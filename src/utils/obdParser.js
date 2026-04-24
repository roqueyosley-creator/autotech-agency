import { pidDatabase } from './pidDatabase';

/**
 * OBD-II Parser Utility - Procesa respuestas HEX de adaptadores ELM327.
 * Ahora integrado con la base de datos dinámica para soporte Híbrido (Auto/Moto).
 */

export const obdParser = {
    /**
     * Convierte una cadena HEX en valores legibles usando la base de datos de PIDs.
     * @param {string} hexResponse - Cadena hexadecimal recibida (ej: "41 0C 1A F8").
     * @param {string} vehicleType - 'car' o 'moto' para seleccionar la DB correcta.
     * @returns {Object} Datos procesados.
     */
    parseResponse: (hexResponse, vehicleType = 'car') => {
        // Limpiar respuesta (ELM327 a veces devuelve eco o espacios extra)
        const cleanHex = hexResponse.replace(/\s+/g, '').replace(/>/g, '');
        const bytes = cleanHex.match(/.{1,2}/g);
        
        if (!bytes || bytes.length < 2) return { error: "Data too short" };

        const mode = bytes[0];
        const pidHex = bytes[1].toUpperCase();
        
        // El modo de respuesta es Modo Solicitado + 0x40 (ej: 01 -> 41)
        if (mode !== '41') return { info: "Not a real-time data response", mode, pidHex };

        const db = pidDatabase[vehicleType] || pidDatabase.car;
        const pidConfig = db.pids[pidHex] || db.pids[`01${pidHex}`]; // Algunos adaptadores omiten el prefijo 01

        if (!pidConfig) {
            return { name: `Unknown PID ${pidHex}`, value: bytes.slice(2).join(''), unit: 'hex' };
        }

        // Convertir bytes de datos a decimales para la fórmula (A, B, C, D...)
        const dataBytes = bytes.slice(2).map(b => parseInt(b, 16));
        const A = dataBytes[0] || 0;
        const B = dataBytes[1] || 0;
        const C = dataBytes[2] || 0;
        const D = dataBytes[3] || 0;

        try {
            // Evaluación segura de la fórmula (usamos Function constructor como parser simple de expresiones)
            // Ejemplo: "(A*256+B)/4"
            const evaluator = new Function('A', 'B', 'C', 'D', `return ${pidConfig.formula}`);
            const result = evaluator(A, B, C, D);

            return {
                name: pidConfig.name,
                value: typeof result === 'number' ? parseFloat(result.toFixed(2)) : result,
                unit: pidConfig.unit,
                pid: pidHex
            };
        } catch (e) {
            console.error(`Error parsing formula for PID ${pidHex}:`, e);
            return { name: pidConfig.name, error: "Formula error", raw: dataBytes };
        }
    },

    /**
     * Interpreta Voltaje de Batería (ELM327 comando AT RV)
     * @param {string} response Ej: "12.4V"
     */
    parseBatteryVoltage: (response) => {
        const voltage = parseFloat(response.replace(/[^\d.]/g, ''));
        return isNaN(voltage) ? 0 : voltage;
    },

    /**
     * Parsea códigos DTC (Modo 03)
     * @param {string} hexResponse - Ej: "43 01 33 00 00 00 00" -> P0133
     */
    parseDTCs: (hexResponse) => {
        const cleanHex = hexResponse.replace(/\s+/g, '').replace(/>/g, '');
        if (cleanHex.startsWith('43') || cleanHex.startsWith('47')) { // Soporte para Modo 03 y 07
            const dtcs = [];
            // Empezar después del byte de modo (43)
            for (let i = 2; i < cleanHex.length; i += 4) {
                const chunk = cleanHex.substring(i, i + 4);
                if (chunk === '0000' || chunk.length < 4) continue;
                
                // Primer nibble indica el tipo de código (P, C, B, U)
                const firstDigit = parseInt(chunk[0], 16);
                let prefix = 'P';
                if (firstDigit >= 4 && firstDigit <= 7) prefix = 'C';
                if (firstDigit >= 8 && firstDigit <= 11) prefix = 'B';
                if (firstDigit >= 12) prefix = 'U';
                
                const code = prefix + (firstDigit % 4) + chunk.substring(1);
                dtcs.push({
                    id: code,
                    status: cleanHex.startsWith('47') ? 'pending' : 'active',
                    timestamp: new Date().toISOString()
                });
            }
            return dtcs;
        }
        return [];
    }
};
