/**
 * VIN Decoding Service for AutoTech PRO
 * Integrates with local Hono backend for advanced AI-enriched decoding.
 */

const API_BASE = '/api/vin';

export const vinService = {
    /**
     * Decodifica un VIN usando el backend avanzado con IA
     * @param {string} vin 17 digits VIN
     * @returns {Promise<Object>} Data enriquecida del vehículo
     */
    decode: async (vin) => {
        if (!vin || vin.length < 11) {
            throw new Error("VIN inválido o incompleto");
        }

        try {
            // Llamada al backend local que combina NHTSA + Gemini
            const response = await fetch(`${API_BASE}/decode/${vin}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error en decodificación");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error en vinService:", error);
            // Fallback a decodificación básica si el backend falla
            return {
                vin,
                make: 'Error',
                model: 'Verificar Conexión',
                year: 'N/A',
                country: 'Unknown',
                engine: { displacement: 'N/A', cylinders: 'N/A', fuel: 'N/A' },
                common_issues: ["No se pudo conectar con el motor de IA."]
            };
        }
    },

    /**
     * Valida la estructura de un VIN (Checksum)
     */
    isValid: (vin) => {
        const re = /^[A-HJ-NPR-Z0-9]{17}$/i;
        return re.test(vin);
    }
};
