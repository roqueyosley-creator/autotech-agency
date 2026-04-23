import { buildUDSFrame, parseUDSResponse } from './actuationProtocols';
import { validatePreConditions } from './safetyGuard';
import { supabase } from '../supabaseClient';

export interface ActuationRequest {
    vehicle_id: string;
    actuation_id: string;
    brand: string;
    command_data: any;
    safety_confirmed: boolean;
    live_data: any;
}

export async function executeActuation(request: ActuationRequest) {
    // 1. Validar pre-condiciones de seguridad automatizadas
    const safetyCheck = await validatePreConditions(request.actuation_id, request.live_data);
    
    if (!safetyCheck.approved) {
        return {
            success: false,
            error: "BLOQUEO DE SEGURIDAD",
            blockers: safetyCheck.blockers
        };
    }

    // 2. Construir trama UDS
    const { header, service, did, data } = request.command_data;
    const frame = buildUDSFrame(header, service, did, data);

    // 3. Simulación de envío (En producción se envía vía Bluetooth/WiFi/USB)
    console.log(`[UDS Engine] Enviando trama: ${frame}`);
    
    // Simular respuesta positiva
    const simulatedResponse = "6F 10 01"; 
    const parsed = parseUDSResponse(simulatedResponse, service);

    // 4. Registrar en historial (DB)
    await supabase.from('actuation_logs').insert({
        vehicle_id: request.vehicle_id,
        actuation_id: request.actuation_id,
        brand: request.brand,
        command_sent: frame,
        response_received: simulatedResponse,
        success: parsed.success,
        nrc_code: parsed.nrc || null,
        safety_confirmed: request.safety_confirmed
    });

    return {
        success: parsed.success,
        frame,
        response: simulatedResponse,
        details: parsed
    };
}
