import { supabase } from '../supabaseClient';

/**
 * Servicio para persistencia de diagnósticos OBD-II en Supabase.
 */
export const diagnosticService = {
    /**
     * Guarda un reporte completo de diagnóstico.
     * @param {string} vin - Identificador del vehículo.
     * @param {Object} obdData - Datos provenientes del escáner.
     */
    saveReport: async (vin, obdData) => {
        if (!vin) return { success: false, error: "VIN del vehículo requerido" };

        try {
            // 1. Crear el registro de diagnóstico principal
            const { data: diagnostic, error: diagError } = await supabase
                .from('diagnosticos')
                .insert([{
                    vin: vin,
                    voltaje_bateria: obdData.battery,
                    carga_motor: obdData.engineLoad,
                    resumen: obdData.summary || `Escaneo General - ${new Date().toLocaleTimeString()}`,
                    estado_emisiones: obdData.emissions || 'Ready',
                    metadata: {
                        protocol: obdData.protocol,
                        adapter: obdData.adapter || 'ELM327',
                        ...obdData.extraPids
                    }
                }])
                .select()
                .single();

            if (diagError) throw diagError;

            // 2. Procesar DTCs dinámicos si existen
            if (obdData.codes && obdData.codes.length > 0) {
                const dtcsToInsert = obdData.codes.map(code => ({
                    diagnostico_id: diagnostic.id,
                    codigo: code.id,
                    descripcion: code.description || "Código de falla detectado",
                    estado_actual: code.status || 'activo',
                    prioridad: code.priority || 'media'
                }));

                const { data: insertedDtcs, error: dtcError } = await supabase
                    .from('errores_dtc')
                    .insert(dtcsToInsert)
                    .select();
                
                if (dtcError) throw dtcError;

                // 3. Guardar Freeze Frames asociados a cada DTC (Modo 02)
                for (const dtc of insertedDtcs) {
                    const freezeData = obdData.freezeFrames?.[dtc.codigo];
                    if (freezeData) {
                        await diagnosticService.saveFreezeFrame(dtc.id, freezeData);
                    }
                }
            }

            return { success: true, data: diagnostic };
        } catch (error) {
            console.error("Error en saveReport:", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Guarda una ráfaga de datos de telemetría (Time-series).
     * @param {string} diagnosticId - ID del diagnóstico activo.
     * @param {Array} telemetryBatch - Lista de objetos { pid, valor, unidad }.
     */
    saveTelemetryBatch: async (diagnosticId, telemetryBatch) => {
        if (!telemetryBatch || telemetryBatch.length === 0) return;

        const dataToInsert = telemetryBatch.map(item => ({
            diagnostico_id: diagnosticId,
            pid: item.pid,
            valor: item.valor,
            unidad: item.unidad,
            timestamp: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('lecturas_telemetria')
            .insert(dataToInsert);

        if (error) console.error("Error guardando telemetría:", error.message);
    },

    /**
     * Guarda el Freeze Frame (Modo 02) asociado a un DTC.
     */
    saveFreezeFrame: async (dtcId, freezeData) => {
        const { error } = await supabase
            .from('freeze_frames')
            .insert([{
                dtc_id: dtcId,
                data: freezeData
            }]);

        if (error) console.error("Error guardando Freeze Frame:", error.message);
    },

    /**
     * Recupera el historial de diagnósticos con telemetría y DTCs.
     */
    getHistory: async (vin) => {
        const { data, error } = await supabase
            .from('diagnosticos')
            .select(`
                *,
                errores_dtc (
                    *,
                    freeze_frames (*)
                ),
                lecturas_telemetria (*)
            `)
            .eq('vin', vin)
            .order('fecha', { ascending: false });

        return { data, error };
    },

    /**
     * Obtiene la lista de vehículos registrados.
     */
    getVehicles: async () => {
        const { data, error } = await supabase
            .from('vehiculos')
            .select('*')
            .order('ultima_conexion', { ascending: false });

        return { data, error };
    }
};
