import { supabase } from '../supabaseClient';

/**
 * Servicio de Librería de Códigos de Falla (DTC)
 * Permite buscar significados de códigos P0xxx, Uxxxx, Bxxxx, Cxxxx.
 */
export const dtcService = {
    
    /**
     * Busca códigos en la base de datos centralizada
     * @param {string} query Código (ej. P0101) o palabras clave
     * @returns {Promise<Array>} Lista de códigos encontrados
     */
    searchCodes: async (query) => {
        if (!query || query.length < 3) return [];

        try {
            // Limpiar query para búsqueda
            const cleanQuery = query.trim().toUpperCase();

            // Intento 1: Búsqueda exacta por código
            const { data: exactMatch } = await supabase
                .from('dtc_library')
                .select('*')
                .eq('code', cleanQuery);

            if (exactMatch && exactMatch.length > 0) return exactMatch;

            // Intento 2: Búsqueda por texto (Full Text Search) en descripción/categoría
            const { data: ftsResults, error } = await supabase
                .from('dtc_library')
                .select('*')
                .textSearch('fts_tsvector', cleanQuery, {
                    config: 'spanish',
                    type: 'websearch'
                })
                .limit(20);

            if (error) throw error;
            return ftsResults || [];

        } catch (error) {
            console.error("Error en DTC Search:", error);
            return [];
        }
    },

    /**
     * Obtiene detalles de un código específico
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
