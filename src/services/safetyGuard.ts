export interface LiveData {
    rpm: number;
    speed: number;
    temp: number;
    voltage: number;
    gear?: string;
}

export interface ValidationResult {
    approved: boolean;
    warnings: string[];
    blockers: string[];
}

/**
 * safetyGuard: Valida condiciones críticas antes de permitir la ejecución física
 */
export async function validatePreConditions(
    actuationId: string,
    liveData: LiveData
): Promise<ValidationResult> {
    const result: ValidationResult = {
        approved: true,
        warnings: [],
        blockers: []
    };

    // 1. Reglas Globales de Temperatura
    if (liveData.temp > 115) {
        result.blockers.push("Temperatura crítica del motor (>115°C). Actuación bloqueada por seguridad térmica.");
        result.approved = false;
    }

    // 2. Reglas de Batería
    if (liveData.voltage < 11.5) {
        result.warnings.push("Voltaje de batería bajo (<11.5V). Riesgo de reinicio de ECU durante la prueba.");
    }

    // 3. Reglas Específicas por Tipo de Actuación
    if (actuationId.includes('epb')) {
        if (liveData.speed > 0) {
            result.blockers.push("El vehículo debe estar COMPLETAMENTE detenido para operar el EPB.");
            result.approved = false;
        }
        if (liveData.rpm > 1200) {
            result.warnings.push("RPM altas detectadas. Se recomienda ralentí estable para EPB.");
        }
    }

    if (actuationId.includes('transmission')) {
        if (liveData.speed > 5) {
            result.blockers.push("No se pueden realizar pruebas de transmisión en movimiento.");
            result.approved = false;
        }
    }

    if (actuationId.includes('coil') || actuationId.includes('injector')) {
        if (liveData.rpm === 0) {
            result.warnings.push("El motor no está en marcha. Algunas pruebas de actuadores no tendrán efecto audible.");
        }
    }

    return result;
}
