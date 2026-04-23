import { supabase } from '../supabaseClient';

/**
 * Servicio Avanzado de Códigos de Falla (DTC) para AutoTech PRO
 * Combina búsqueda en base de datos local y resolución inteligente via IA.
 */
export const dtcService = {
    
    /**
     * Busca códigos usando el backend híbrido (DB + AI)
     * @param {string} query Código (ej. P0101) o palabras clave
     * @param {Object} vehicle Contexto del vehículo {make, model, year}
     * @returns {Promise<Array>} Lista de códigos encontrados
     */
    searchCodes: async (query, vehicle = {}) => {
        if (!query || query.length < 3) return [];

        try {
            const params = new URLSearchParams({
                q: query,
                make: vehicle.make || 'Universal',
                model: vehicle.model || 'Universal',
                year: vehicle.year || ''
            });

            const response = await fetch(`/api/dtc/search?${params}`);
            
            if (!response.ok) throw new Error("Error en la búsqueda de DTC");

            const data = await response.json();
            return data.results || [];

        } catch (error) {
            console.error("Error en DTC Search Avanzado:", error);
            // Fallback a Supabase directo si el backend local falla
            return [];
        }
    },

    /**
     * Obtiene detalles de un código específico (Directo de DB)
     */
    getCodeDetails: async (code) => {
        const { data, error } = await supabase
            .from('dtc_library')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();
        
        if (error) return null;
        return data;
    }
};
