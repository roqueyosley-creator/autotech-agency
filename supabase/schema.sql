-- Tablas para el sistema de diagnóstico OBD-II

-- 1. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    vin TEXT PRIMARY KEY,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    anio INTEGER NOT NULL,
    kilometraje_total INTEGER DEFAULT 0,
    ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Diagnósticos
CREATE TABLE IF NOT EXISTS diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin TEXT REFERENCES vehiculos(vin) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    kilometraje_momento INTEGER,
    resumen TEXT,
    voltaje_bateria NUMERIC(4,2),
    carga_motor NUMERIC(5,2),
    estado_emisiones TEXT,
    metadata JSONB -- Para guardar otros PIDs si es necesario
);

-- 3. Tabla de Errores DTC (Diagnostic Trouble Codes)
CREATE TABLE IF NOT EXISTS errores_dtc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostico_id UUID REFERENCES diagnosticos(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL, -- Ej: P0301
    descripcion TEXT,
    estado_actual TEXT DEFAULT 'activo', -- activo, pendiente, historico
    prioridad TEXT DEFAULT 'media', -- baja, media, alta
    soluciones_sugeridas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS (Row Level Security) - Ejemplo básico
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE errores_dtc ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según el sistema de auth)
-- Forzar que solo usuarios autenticados puedan leer (ejemplo rápido)
-- CREATE POLICY "Select for authenticated" ON vehiculos FOR SELECT USING (auth.role() = 'authenticated');
