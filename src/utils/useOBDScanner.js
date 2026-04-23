import { useState, useEffect } from 'react';
import { obdParser } from './obdParser';
import { bluetoothService } from '../services/bluetoothService';
import { pidDatabase } from './pidDatabase';

/**
 * Hook personalizado para escanear datos OBD-II (Simulado o Real)
 * Ahora con soporte Híbrido (Auto/Moto) y Parser dinámico.
 */
export const useOBDScanner = (isActive, isReal = false, vehicleType = 'car') => {
    const [data, setData] = useState({
        battery: 12.6,
        engineLoad: 0,
        temp: 0,
        rpm: 0,
        speed: 0,
        emissions: "Checking...",
        dtcs: 0,
        codes: [],
        freezeFrames: {},
        protocol: isReal ? "Negotiating..." : "Emulator Mode",
        summary: "Iniciando...",
        vehicleType // Guardar el tipo actual
    });

    useEffect(() => {
        if (!isActive) return;

        const pollData = async () => {
            if (isReal) {
                // --- LÓGICA DE ESCANEO REAL ---
                try {
                    const db = pidDatabase[vehicleType] || pidDatabase.car;
                    const pidsToPoll = Object.keys(db.pids); // Obtener PIDs definidos para este vehículo
                    
                    let newData = { ...data, vehicleType };

                    // 1. Obtener Voltaje de Batería (Comando AT)
                    const voltRaw = await bluetoothService.sendPID("AT RV");
                    newData.battery = obdParser.parseBatteryVoltage(voltRaw);

                    // 2. Poll de PIDs en Tiempo Real
                    for (const pid of pidsToPoll) {
                        const rawHex = await bluetoothService.sendPID(pid);
                        const parsed = obdParser.parseResponse(rawHex, vehicleType);
                        
                        if (!parsed.error) {
                            // Mapear dinámicamente a las keys del estado
                            if (parsed.name === "RPM") newData.rpm = parsed.value;
                            if (parsed.name.includes("Temp")) newData.temp = parsed.value;
                            if (parsed.name === "Velocidad") newData.speed = parsed.value;
                            if (parsed.name.includes("Carga")) newData.engineLoad = parsed.value;
                        }
                    }

                    // 3. Revisar DTCs (Modo 03) ocasionalmente
                    if (Math.random() > 0.9) {
                        const dtcRaw = await bluetoothService.sendPID("03");
                        const codes = obdParser.parseDTCs(dtcRaw);
                        newData.dtcs = codes.length;
                        newData.codes = codes.map(c => ({ id: c, description: "Código detectado via OBD", status: "activo" }));
                    }

                    setData(newData);
                } catch (e) {
                    console.error("Error en comunicación OBD real:", e);
                    setData(prev => ({ ...prev, summary: "Error de Conexión" }));
                }
            } else {
                // --- LÓGICA DE SIMULACIÓN HÍBRIDA ---
                setData(prev => {
                    const isMoto = vehicleType === 'moto';
                    const hasNewError = Math.random() > 0.98 && prev.codes.length === 0;
                    
                    const newCodes = hasNewError ? [{
                        id: isMoto ? "P0300" : "P0171",
                        description: isMoto ? "Fallo encendido múltiple" : "Mezcla pobre (Banco 1)",
                        status: "activo",
                        priority: "alta"
                    }] : prev.codes;

                    return {
                        ...prev,
                        battery: parseFloat((13.2 + Math.random() * 0.4).toFixed(1)),
                        // Motos suben más de RPM que los autos
                        rpm: isMoto 
                            ? Math.floor(Math.random() * 2000 + 3000) 
                            : Math.floor(Math.random() * 500 + 750),
                        temp: (isMoto ? 95 : 85) + Math.floor(Math.random() * 5),
                        engineLoad: 15 + Math.floor(Math.random() * 10),
                        speed: Math.floor(Math.random() * 120),
                        dtcs: newCodes.length,
                        codes: newCodes,
                        protocol: isMoto ? "ISO 19689 (Euro 5)" : "ISO 15765-4 (CAN)",
                        summary: newCodes.length > 0 ? "Alerta de Sistema" : "Funcionamiento Óptimo",
                        vehicleType
                    };
                });
            }
        };

        const interval = setInterval(pollData, isReal ? 500 : 1500);
        return () => clearInterval(interval);
    }, [isActive, isReal, vehicleType]);

    return data;
};
