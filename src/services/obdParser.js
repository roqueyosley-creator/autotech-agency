/**
 * AutoTech PRO - OBD-II Response Parser
 * Decodifica respuestas hexadecimales de ELM327 a valores legibles.
 */

export const obdParser = {
    /**
     * Parsea una respuesta de modo 01 (Datos en tiempo real)
     * @param {string} response - Respuesta hex del ELM327
     * @param {string} pid - PID solicitado
     * @returns {number|string|null} Valor decodificado
     */
    parseMode01: (response, pid) => {
        if (!response || response.includes('NO DATA') || response.includes('ERROR')) {
            return null;
        }

        // Limpiar respuesta (quitar espacios y ecos)
        const clean = response.replace(/\s/g, '').toUpperCase();
        
        // El formato suele ser 41XXYYYY... donde XX es el PID
        const pidMatch = `41${pid.toUpperCase()}`;
        const index = clean.indexOf(pidMatch);
        
        if (index === -1) return null;

        const data = clean.substring(index + pidMatch.length);

        switch (pid.toUpperCase()) {
            case '0C': // RPM
                // (256*A + B) / 4
                const rpmA = parseInt(data.substring(0, 2), 16);
                const rpmB = parseInt(data.substring(2, 4), 16);
                return Math.round((256 * rpmA + rpmB) / 4);

            case '0D': // Speed
                // A
                return parseInt(data.substring(0, 2), 16);

            case '05': // Coolant Temp
                // A - 40
                return parseInt(data.substring(0, 2), 16) - 40;

            case '04': // Engine Load
                // A * 100 / 255
                return Math.round(parseInt(data.substring(0, 2), 16) * 100 / 255);

            case '0B': // Intake Map
                return parseInt(data.substring(0, 2), 16);

            default:
                return data;
        }
    },

    /**
     * Parsea códigos de error (DTCs) del modo 03 o 07
     */
    parseDTCs: (response) => {
        if (!response || response.includes('4300') || response.includes('NO DATA')) {
            return [];
        }

        const clean = response.replace(/\s/g, '').toUpperCase();
        const dtcs = [];

        // Los DTCs vienen en pares de bytes tras el 43
        const data = clean.substring(clean.indexOf('43') + 2);
        
        for (let i = 0; i < data.length; i += 4) {
            const part = data.substring(i, i + 4);
            if (part === '0000') continue;

            const firstChar = part[0];
            let prefix = '';
            
            // Lógica de prefijo OBD-II
            switch (firstChar) {
                case '0': prefix = 'P0'; break;
                case '1': prefix = 'P1'; break;
                case '2': prefix = 'P2'; break;
                case '3': prefix = 'P3'; break;
                case '4': prefix = 'C0'; break;
                case '5': prefix = 'C1'; break;
                case '6': prefix = 'C2'; break;
                case '7': prefix = 'C3'; break;
                case '8': prefix = 'B0'; break;
                case '9': prefix = 'B1'; break;
                case 'A': prefix = 'B2'; break;
                case 'B': prefix = 'B3'; break;
                case 'C': prefix = 'U0'; break;
                case 'D': prefix = 'U1'; break;
                case 'E': prefix = 'U2'; break;
                case 'F': prefix = 'U3'; break;
            }
            
            dtcs.push(prefix + part.substring(1));
        }

        return [...new Set(dtcs)]; // Unificar
    }
};
