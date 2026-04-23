/**
 * NRC_TABLE: Negative Response Codes for UDS (ISO 14229)
 */
export const NRC_TABLE: Record<string, string> = {
  '10': 'generalReject - Error general de ejecución',
  '11': 'serviceNotSupported - El ECU no soporta este servicio',
  '12': 'subFunctionNotSupported - Subfunción no válida',
  '13': 'incorrectMessageLengthOrFormat - Formato de mensaje incorrecto',
  '21': 'busyRepeatRequest - El ECU está ocupado, reintente en 100ms',
  '22': 'conditionsNotCorrect - Condiciones de seguridad no cumplidas (ej. motor encendido)',
  '24': 'requestSequenceError - Error en la secuencia de comandos',
  '31': 'requestOutOfRange - DID o parámetros fuera de rango',
  '33': 'securityAccessDenied - Se requiere desbloqueo de seguridad (Seed/Key)',
  '7E': 'subFunctionNotSupportedInActiveSession',
  '7F': 'serviceNotSupportedInActiveSession'
};

/**
 * buildUDSFrame: Construye la trama AT para el adaptador ELM327/STN
 */
export function buildUDSFrame(
  header: string,
  service: string, 
  did: string,
  data: string | null = null
): string {
  // ATSH: Set Header (ej. 7E0 para Engine)
  // El comando final se compone del Header, Servicio UDS y Data Identifier (DID)
  return `ATSH ${header}\r${service}${did}${data || ''}`;
}

/**
 * parseUDSResponse: Analiza la respuesta hexadecimal del vehículo
 */
export function parseUDSResponse(hexResponse: string, expectedService: string) {
  const cleanHex = hexResponse.replace(/\s/g, '').toUpperCase();
  
  // 1. Verificar Respuesta Negativa (Format: 7F XX NRC)
  if (cleanHex.startsWith('7F')) {
    const serviceInResponse = cleanHex.substring(2, 4);
    const nrcCode = cleanHex.substring(4, 6);
    
    return {
      success: false,
      is_positive: false,
      service: serviceInResponse,
      nrc: nrcCode,
      description: NRC_TABLE[nrcCode] || 'Error desconocido'
    };
  }

  // 2. Verificar Respuesta Positiva (Format: Service + 0x40)
  const positiveService = (parseInt(expectedService, 16) + 0x40).toString(16).toUpperCase();
  
  if (cleanHex.startsWith(positiveService)) {
    return {
      success: true,
      is_positive: true,
      data: cleanHex.substring(2)
    };
  }

  return {
    success: false,
    is_positive: false,
    error: 'Respuesta no válida o fuera de protocolo'
  };
}
