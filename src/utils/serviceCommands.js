export const SERVICE_COMMANDS = {

  OIL_RESET: {
    id: "oil_reset",
    name: "Reset Luz de Aceite",
    icon: "Droplets",
    color: "#FF8C00",
    category: "engine",
    description: "Reinicia el contador de mantenimiento de aceite y filtro",
    estimated_time: "2-3 min",
    vehicle_types: ["car", "moto", "truck"],
    difficulty: "easy",
    brands: {
      toyota: {
        methods: [
          {
            name: "Método Ignición",
            steps_required: true,
            commands: null,
            manual_procedure: [
              "Apagar el vehículo completamente",
              "Presionar y mantener el botón TRIP/ODO",
              "Girar llave a posición ON (sin arrancar)",
              "Mantener presionado hasta que parpadee",
              "Soltar cuando aparezca '000000'",
              "Apagar y reiniciar para confirmar"
            ]
          },
          {
            name: "Método OBD (2015+)",
            commands: [
              "ATSH 7C0",
              "3E00",
              "1003",
              "2C030100",
              "2C030000"
            ],
            expected_response: "6C 03 00"
          }
        ]
      },
      ford: {
        methods: [
          {
            name: "Método Menú Pantalla",
            manual_procedure: [
              "Presionar OK en el volante",
              "Navegar a 'Vehicle → Oil Life → Reset'",
              "Confirmar con OK por 3 segundos"
            ]
          },
          {
            name: "Método OBD",
            commands: [
              "ATSH 720",
              "3E00",
              "2F180101FF"
            ]
          }
        ]
      },
      bmw: {
        methods: [
          {
            name: "CBS Reset via OBD",
            commands: [
              "ATSH 6F1",
              "1003",
              "2C030100",
              "2FBC0101FF",
              "2FBC0100FF"
            ],
            expected_response: "6F BC 01"
          }
        ]
      },
      universal: {
        methods: [
          {
            name: "Modo 04 - Reset Genérico",
            commands: ["04"],
            warning: "Borra TODOS los DTCs y readiness"
          }
        ]
      }
    }
  },

  DPF_RESET: {
    id: "dpf_reset",
    name: "Regeneración DPF/FAP",
    icon: "Filter",
    color: "#8B5CF6",
    category: "emission",
    description: "Fuerza regeneración del filtro de partículas diésel y resetea contador",
    estimated_time: "20-40 min",
    vehicle_types: ["car", "truck"],
    fuel_type: ["diesel"],
    difficulty: "advanced",
    preconditions: [
      "Motor en temperatura de operación (>80°C)",
      "Nivel de combustible >25%",
      "Vehículo estacionado en zona ventilada",
      "Batería cargada (>12.5V)"
    ],
    brands: {
      universal: {
        methods: [
          {
            name: "Regeneración Forzada UDS",
            commands: [
              "ATSH 7E0",
              "1003",
              "2F2C3D01FF",
              "2F2C3E01FF"
            ],
            monitor_pid: "22DPF1",
            completion_condition: "DPF_LOAD < 20%",
            estimated_duration_min: 25
          }
        ]
      }
    }
  },

  TPMS_RESET: {
    id: "tpms_reset",
    name: "Reset TPMS",
    icon: "CircleDot",
    color: "#00D4FF",
    category: "chassis",
    description: "Resetea sensores de presión de neumáticos tras cambio de ruedas",
    estimated_time: "3-5 min",
    vehicle_types: ["car", "truck"],
    difficulty: "easy",
    preconditions: [
      "Neumáticos inflados a presión correcta",
      "Vehículo encendido"
    ],
    brands: {
      toyota: {
        methods: [
          {
            name: "Inicialización Directa",
            commands: [
              "ATSH 750",
              "1003",
              "2F0101C001"
            ]
          }
        ]
      }
    }
  },

  EPB_SERVICE: {
    id: "epb_service",
    name: "Servicio Freno EPB",
    icon: "ParkingCircle",
    color: "#FF3B3B",
    category: "brakes",
    description: "Retrae/extiende pistón electrónico para cambio de pastillas traseras",
    estimated_time: "5-10 min",
    vehicle_types: ["car"],
    difficulty: "medium",
    preconditions: [
      "Vehículo elevado con gato seguro",
      "Ruedas delanteras calzadas",
      "Motor apagado o en posición ACC"
    ],
    brands: {
      universal: {
        methods: [
          {
            name: "Retracción EPB (Abrir)",
            commands: [
              "ATSH 760",
              "1003",
              "2F4A0001FF"
            ]
          }
        ]
      }
    }
  }
};
