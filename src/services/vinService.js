/**
 * VIN Decoding Service for NovaDrive Pro
 * Integrates with NHTSA vPIC API for free car/moto decoding.
 */

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin';

export const vinService = {
    /**
     * Decodifica un VIN completo usando la API de NHTSA
     * @param {string} vin 17 digits VIN
     * @returns {Promise<Object>} Data del vehículo normalizada
     */
    decode: async (vin) => {
        if (!vin || vin.length < 11) {
            throw new Error("VIN inválido o incompleto");
        }

        try {
            const response = await fetch(`${NHTSA_API_BASE}/${vin}?format=json`);
            const data = await response.json();

            if (!data.Results) return null;

            // Mapear los resultados de NHTSA a nuestro modelo interno
            const result = {};
            data.Results.forEach(item => {
                if (item.Variable === "Make") result.make = item.Value;
                if (item.Variable === "Model") result.model = item.Value;
                if (item.Variable === "Model Year") result.year = item.Value;
                if (item.Variable === "Vehicle Type") result.type = item.Value;
                if (item.Variable === "Engine Number of Cylinders") result.cylinders = item.Value;
                if (item.Variable === "Fuel Type - Primary") result.fuel = item.Value;
            });

            // Normalización de tipo (Car vs Moto)
            const typeLower = (result.type || '').toLowerCase();
            if (typeLower.includes('motorcycle') || typeLower.includes('moto')) {
                result.category = 'moto';
            } else {
                result.category = 'car';
            }

            return {
                vin,
                make: result.make || 'Desconocido',
                model: result.model || 'Desconocido',
                year: result.year || '',
                type: result.category,
                details: {
                    fuel: result.fuel,
                    cylinders: result.cylinders
                }
            };
        } catch (error) {
            console.error("Error decodificando VIN:", error);
            // Retornar objeto básico si la API falla para no bloquear el flujo
            return { vin, make: 'Error API', model: 'Reintente', type: 'car' };
        }
    }
};
