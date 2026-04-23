export const ACTUATION_COMMANDS = {
  ENGINE: {
    label: "Motor",
    color: "#FF6B35",
    icon: "Zap",
    actuations: [
      {
        id: "injector_1",
        name: "Inyector Cilindro 1",
        description: "Activa/desactiva inyector #1 para prueba de balance",
        safety_level: "medium",
        warning: "El motor puede vibrar perceptiblemente durante la prueba.",
        duration_ms: 3000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "100101", data: "0300" },
          toyota:    { header: "7E0", service: "2F", did: "C20101", data: "0300" },
          ford:      { header: "7E0", service: "2F", did: "180101", data: "0300" },
          bmw:       { header: "7E4", service: "2F", did: "200101", data: "0300" }
        },
        stop_command: { service: "2F", did: "100101", data: "0000" },
        expected_response: "6F 10 01",
        verify_pid: "0104",
        verify_description: "La carga del motor debe bajar ~8%"
      },
      {
        id: "injector_2",
        name: "Inyector Cilindro 2",
        safety_level: "medium",
        warning: "El motor puede vibrar durante la prueba",
        duration_ms: 3000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "100102", data: "0300" }
        },
        stop_command: { service: "2F", did: "100102", data: "0000" }
      },
      {
        id: "injector_3", name: "Inyector Cilindro 3",
        safety_level: "medium", duration_ms: 3000,
        commands: { universal: { header: "7E0", service: "2F", did: "100103", data: "0300" }}
      },
      {
        id: "injector_4", name: "Inyector Cilindro 4",
        safety_level: "medium", duration_ms: 3000,
        commands: { universal: { header: "7E0", service: "2F", did: "100104", data: "0300" }}
      },
      {
        id: "fuel_pump",
        name: "Bomba de Combustible",
        description: "Activa bomba para verificar presión",
        safety_level: "medium",
        warning: "Verificar que no haya fugas visibles antes de activar.",
        duration_ms: 5000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "1A0001", data: "FF00" }
        },
        expected_response: "6F 1A 00",
        verify_pid: null,
        verify_description: "Escuchar activación física de la bomba"
      },
      {
        id: "idle_up",
        name: "Subir Ralentí +100 RPM",
        description: "Incrementa RPM de ralentí para prueba de carga",
        safety_level: "low",
        duration_ms: 10000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "0F0001", data: "6400" }
        },
        verify_pid: "010C",
        verify_description: "RPM debe subir ~100 unidades"
      },
      {
        id: "idle_down",
        name: "Bajar Ralentí -100 RPM",
        safety_level: "low",
        duration_ms: 10000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "0F0001", data: "9C00" }
        }
      },
      {
        id: "vvt_advance",
        name: "VVT - Avance de Válvulas",
        description: "Prueba sistema de distribución variable",
        safety_level: "medium",
        warning: "Solo ejecutar con el motor a temperatura de operación.",
        duration_ms: 3000,
        commands: {
          toyota: { header: "7E0", service: "2F", did: "D00101", data: "FF00" },
          honda:  { header: "7E8", service: "2F", did: "A10101", data: "FF00" }
        }
      }
    ]
  },
  IGNITION: {
    label: "Encendido",
    color: "#FFD700",
    icon: "Flame",
    actuations: [
      {
        id: "coil_1",
        name: "Bobina Cilindro 1",
        description: "Prueba de chispa bobina #1",
        safety_level: "high",
        warning: "PELIGRO: Alta tensión. No tocar cables ni componentes durante la prueba.",
        duration_ms: 2000,
        commands: {
          universal: { header: "7E0", service: "2F", did: "150101", data: "0100" }
        }
      },
      {
        id: "coil_2", name: "Bobina Cilindro 2",
        safety_level: "high", warning: "PELIGRO: Alta tensión",
        duration_ms: 2000,
        commands: { universal: { header: "7E0", service: "2F", did: "150102", data: "0100" }}
      }
    ]
  },
  COOLING: {
    label: "Enfriamiento",
    color: "#00D4FF",
    icon: "Wind",
    actuations: [
      {
        id: "fan_low",
        name: "Ventilador Velocidad 1",
        description: "Activa ventilador a baja velocidad",
        safety_level: "low",
        duration_ms: 10000,
        commands: {
          universal: { header: "7C0", service: "2F", did: "1B0001", data: "3200" }
        }
      },
      {
        id: "fan_high",
        name: "Ventilador Máxima Velocidad",
        description: "Activa ventilador a máxima potencia",
        safety_level: "medium",
        warning: "Mantener extremidades alejadas de las aspas.",
        duration_ms: 10000,
        commands: {
          universal: { header: "7C0", service: "2F", did: "1B0003", data: "FF00" }
        }
      }
    ]
  },
  BRAKES: {
    label: "Frenos",
    color: "#FF3B3B",
    icon: "CircleStop",
    actuations: [
      {
        id: "abs_bleed",
        name: "Sangrado ABS Asistido",
        description: "Cicla el módulo hidráulico ABS para purgar aire",
        safety_level: "high",
        warning: "VEHÍCULO EN POSICIÓN SEGURA. Tener líquido de frenos listo. No presionar pedal.",
        duration_ms: 15000,
        commands: {
          universal: { header: "760", service: "2F", did: "3A0001", data: "FF00" }
        }
      },
      {
        id: "epb_open",
        name: "Abrir Freno de Mano (EPB)",
        description: "Retrae pistón EPB para mantenimiento",
        safety_level: "high",
        warning: "VEHÍCULO ELEVADO Y SEGURO. Calzar ruedas delanteras.",
        duration_ms: 8000,
        commands: {
          universal: { header: "760", service: "2F", did: "4A0001", data: "FF00" },
          vw_audi:   { header: "769", service: "2F", did: "4A0001", data: "FF00" },
          bmw:       { header: "764", service: "2F", did: "5A0001", data: "FF00" }
        }
      }
    ]
  },
  TRANSMISSION: {
    label: "Transmisión",
    color: "#FF8C00",
    icon: "Settings2",
    actuations: [
      {
        id: "transmission_reset",
        name: "Reset Adaptaciones TCM",
        description: "Borra memoria adaptativa de la caja",
        safety_level: "medium",
        warning: "La caja tardará en readaptarse. Se recomienda conducción suave inicial.",
        duration_ms: 2000,
        commands: {
          universal: { header: "7E1", service: "14", did: "FF00", data: null },
          toyota:    { header: "7E1", service: "14", did: "C27F", data: null }
        }
      }
    ]
  }
};
