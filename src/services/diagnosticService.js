import { supabase } from '../supabaseClient';

/**
 * NovaDrive Pro - Servicio de Persistencia
 * Conecta el ScannerApp y el Hardware con el nuevo esquema en Supabase.
 */
export const diagnosticService = {
    
    /**
     * Obtiene el ID del mecánico actual (Usuario Autenticado)
     */
    getCurrentMechanicId: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("Usuario no autenticado");
        return user.id;
    },

    /**
     * Registra o actualiza un vehículo y crea una nueva sesión de diagnóstico.
     * Guarda los DTCs y Freeze Frames asociados a la sesión.
     */
    saveReport: async (vehicleData, obdData) => {
        if (!vehicleData?.vin) return { success: false, error: "VIN del vehículo requerido" };

        try {
            const mechanicId = await diagnosticService.getCurrentMechanicId();

            // 1. Upsert del Vehículo (Asegurar que exista en el catálogo)
            const { data: vehicle, error: vehicleError } = await supabase
                .from('vehicles')
                .upsert({
                    vin: vehicleData.vin,
                    make: vehicleData.make || 'Desconocido',
                    model: vehicleData.model || 'Desconocido',
                    year: vehicleData.year || new Date().getFullYear(),
                    type: vehicleData.type || 'car',
                    protocol_detected: obdData.protocol || 'Desconocido'
                }, { onConflict: 'vin' })
                .select()
                .single();

            if (vehicleError) throw vehicleError;

            // 2. Crear la Sesión de Diagnóstico (Relación Mecánico <-> Vehículo)
            const { data: session, error: sessionError } = await supabase
                .from('diagnostic_sessions')
                .insert([{
                    mechanic_id: mechanicId,
                    vehicle_id: vehicle.id,
                    summary: obdData.summary || `Escaneo General OBD-II`,
                    location_gps: obdData.location || null
                }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 3. Procesar Fault Logs (DTCs) y Freeze Frames en JSONB
            if (obdData.codes && obdData.codes.length > 0) {
                const logsToInsert = obdData.codes.map(code => {
                    // Buscar si hay freeze frame asociado a este código en específico
                    const freezeFrameData = obdData.freezeFrames ? obdData.freezeFrames[code.id] : null;

                    return {
                        session_id: session.id,
                        dtc_code: code.id,
                        freeze_frame_data: freezeFrameData, // JSONB Nativo
                        status: code.status || 'active'
                    };
                });

                const { error: dtcError } = await supabase
                    .from('fault_logs')
                    .insert(logsToInsert);
                
                if (dtcError) throw dtcError;
            }

            return { success: true, data: session };
        } catch (error) {
            console.error("Error en saveReport (NovaDrive Pro):", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Guarda una ráfaga de datos de telemetría (Time-series).
     * @param {string} sessionId - ID de la sesión activa en diagnostic_sessions.
     * @param {Array} telemetryBatch - Lista de objetos { pid, valor, unidad }.
     */
    saveTelemetryBatch: async (sessionId, telemetryBatch) => {
        if (!sessionId || !telemetryBatch || telemetryBatch.length === 0) return;

        const dataToInsert = telemetryBatch.map(item => ({
            session_id: sessionId,
            pid: item.pid,
            value: item.valor || item.value, // Soporte retroactivo para nombres
            unit: item.unidad || item.unit,
            timestamp: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('telemetry_streams')
            .insert(dataToInsert);

        if (error) console.error("Error guardando telemetría (NovaDrive Pro):", error.message);
    },

    /**
     * Recupera el historial completo de un vehículo, 
     * incluyendo sus sesiones pasadas, fallas y telemetría.
     */
    getHistory: async (vin) => {
        try {
            // Obtener primero el vehículo
            const { data: vehicle, error: vError } = await supabase
                .from('vehicles')
                .select('id')
                .eq('vin', vin)
                .single();

            if (vError) throw vError;

            // Consultar las sesiones de ese vehículo con sus fallas y telemetría anidada
            const { data, error } = await supabase
                .from('diagnostic_sessions')
                .select(`
                    *,
                    fault_logs (*),
                    telemetry_streams (*)
                `)
                .eq('vehicle_id', vehicle.id)
                .order('created_at', { ascending: false });

            return { data, error };
        } catch (error) {
             return { data: null, error };
        }
    },

    /**
     * Obtiene la lista de vehículos registrados por el mecánico actual.
     * Gracias a RLS, la vista ya vendrá filtrada.
     */
    getVehicles: async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        return { data, error };
    },

    /**
     * Busca en la librería DTC utilizando Full Text Search
     */
    searchDTCLibrary: async (searchQuery) => {
        if (!searchQuery) return { data: [], error: null };
        
        // Usar textSearch para disparar el índice GIN de fts_tsvector
        const { data, error } = await supabase
            .from('dtc_library')
            .select('*')
            .textSearch('fts_tsvector', searchQuery, { type: 'websearch' })
            .limit(20);

        return { data, error };
    }
};
