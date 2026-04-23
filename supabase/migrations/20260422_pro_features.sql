-- Migración para Funciones Profesionales de Diagnóstico
-- Fecha: 2026-04-22

-- 1. Tabla de Lecturas de Telemetría (Time-series)
-- Permite guardar flujos de datos en tiempo real (RPM, Velocidad, etc.)
CREATE TABLE IF NOT EXISTS lecturas_telemetria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostico_id UUID REFERENCES diagnosticos(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pid TEXT NOT NULL, -- Código del PID (ej: '010C' para RPM)
    valor NUMERIC NOT NULL,
    unidad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas rápidas por diagnóstico y tiempo
CREATE INDEX IF NOT EXISTS idx_telemetria_diag_time ON lecturas_telemetria(diagnostico_id, timestamp);

-- 2. Tabla de Freeze Frames (Modo 02)
-- Guarda la "foto" de los sensores cuando ocurrió un error específico
CREATE TABLE IF NOT EXISTS freeze_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dtc_id UUID REFERENCES errores_dtc(id) ON DELETE CASCADE,
    data JSONB NOT NULL, -- Objeto con todos los PIDs capturados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mejora a errores_dtc (Añadir metadatos de AI si no existen)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='errores_dtc' AND column_name='metadata_ai') THEN
        ALTER TABLE errores_dtc ADD COLUMN metadata_ai JSONB;
    END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE lecturas_telemetria ENABLE ROW LEVEL SECURITY;
ALTER TABLE freeze_frames ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Lectura/Escritura para autenticados)
-- Nota: En producción, ajustar para que el usuario solo vea sus vehículos.
CREATE POLICY "Permitir todo a autenticados en telemetria" ON lecturas_telemetria FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados en freeze_frames" ON freeze_frames FOR ALL TO authenticated USING (true);
