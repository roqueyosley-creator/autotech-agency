/**
 * Base de datos de PIDs optimizada para vehículos Híbridos (Autos y Motos)
 */
export const pidDatabase = {
  car: {
    name: "Automóvil",
    protocols: ["ISO 15765-4 (CAN)", "ISO 9141-2", "ISO 14230-4 (KWP2000)"],
    pids: {
      "010C": { name: "RPM", formula: "(A*256+B)/4", unit: "rpm" },
      "010D": { name: "Velocidad", formula: "A", unit: "km/h" },
      "0105": { name: "Temp. Refrigerante", formula: "A-40", unit: "°C" },
      "0104": { name: "Carga Motor", formula: "A*100/255", unit: "%" },
      "0111": { name: "Posición Acelerador", formula: "A*100/255", unit: "%" }
    }
  },
  moto: {
    name: "Motocicleta",
    // Prioridad a protocolos Euro 4/5 y K-Line propietario
    protocols: ["ISO 19689 (Euro 5)", "ISO 14230-4 (KWP2000)", "CAN-BUS (UDS)"],
    pids: {
      "010C": { name: "RPM", formula: "(A*256+B)/4", unit: "rpm" },
      "010D": { name: "Velocidad", formula: "A", unit: "km/h" },
      "0105": { name: "Temp. Motor", formula: "A-40", unit: "°C" }, // En motos es crítico
      "010F": { name: "Temp. Aire Admisión", formula: "A-40", unit: "°C" },
      "015C": { name: "Temperatura Aceite", formula: "A-40", unit: "°C" }, // Muy común en motos Pro
      "0111": { name: "TPS (Throttle Position)", formula: "A*100/255", unit: "%" }
    },
    // Información técnica de adaptadores para el usuario
    adapters: {
      "Honda": "4-pin (Red) to 16-pin OBD-II",
      "Yamaha": "3-pin or 4-pin to 16-pin OBD-II",
      "KTM/BMW": "6-pin (Red ISO 19689) to 16-pin OBD-II",
      "Kawasaki": "6-pin to 16-pin OBD-II"
    }
  }
};
