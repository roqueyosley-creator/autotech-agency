-- ==========================================
-- SCRIPT DE INICIALIZACIÓN - NOVADRIVE PRO
-- Arquitectura de Base de Datos para Diagnóstico Automotriz
-- ==========================================

-- Habilitar extensión para generación de UUIDs si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS Y TIPOS
-- ==========================================
CREATE TYPE vehicle_type_enum AS ENUM ('car', 'moto');

-- ==========================================
-- 2. TABLAS Y RELACIONES
-- ==========================================

-- Tabla de Perfiles (Extiende de auth.users de Supabase)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    subscription_plan TEXT DEFAULT 'free',
    language TEXT DEFAULT 'es',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Tabla de Vehículos (Catálogo de vehículos únicos leídos por VIN)
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vin TEXT UNIQUE NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    type vehicle_type_enum NOT NULL DEFAULT 'car',
    protocol_detected TEXT, -- Protocolo detectado por el Smart Handshake
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Librería Maestra de Códigos DTC (Diccionario estático / alimentable)
CREATE TABLE dtc_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- Ej: P0101, U0100
    description TEXT NOT NULL,
    symptoms TEXT,
    possible_causes TEXT,
    category TEXT, -- Motor, Transmisión, Chasis, ABS, Red...
    fix_steps_json JSONB, -- Pasos de diagnóstico guiados en JSON
    -- Columna calculada automáticamente para Full Text Search (FTS)
    fts_tsvector tsvector GENERATED ALWAYS AS (
        to_tsvector('spanish', coalesce(code, '') || ' ' || coalesce(description, '') || ' ' || coalesce(possible_causes, ''))
    ) STORED
);

-- Índice GIN para acelerar dramáticamente el Full Text Search de códigos
CREATE INDEX dtc_fts_idx ON dtc_library USING GIN (fts_tsvector);

-- Sesiones de Diagnóstico (Relaciona el Mecánico (Profile) con el Vehículo)
CREATE TABLE diagnostic_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mechanic_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    location_gps TEXT, -- Opcional: Lat/Lng de donde se escaneó
    summary TEXT, -- Resumen del estatus
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Logs de Fallas Detectadas (DTCs) en una Sesión
CREATE TABLE fault_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE NOT NULL,
    dtc_code TEXT NOT NULL, -- Código arrojado por la ECU
    dtc_reference_id UUID REFERENCES dtc_library(id) ON DELETE SET NULL, -- Match en la DB (Opcional)
    freeze_frame_data JSONB, -- Snapshot del motor cuando ocurrió la falla (RPM, Temp, Carga...)
    status TEXT DEFAULT 'active', -- active, pending, cleared (borrado)
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Telemetría en Vivo (Optimizada para inserciones masivas de Live Data)
CREATE TABLE telemetry_streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE NOT NULL,
    pid TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
-- Índice temporal en telemetría para ordenar rápido por tiempo dentro de una sesión
CREATE INDEX idx_telemetry_session_time ON telemetry_streams (session_id, timestamp DESC);

-- ==========================================
-- 3. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtc_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_streams ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Políticas para 'profiles'
-- ----------------------------------------------------
-- Un usuario solo puede leer y actualizar su propio perfil
CREATE POLICY "Usuarios ven su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ----------------------------------------------------
-- Políticas para 'dtc_library'
-- ----------------------------------------------------
-- Cualquier usuario autenticado puede buscar en el diccionario
CREATE POLICY "Lectura pública de DTCs para usuarios autenticados" ON dtc_library
    FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------
-- Políticas para 'diagnostic_sessions'
-- ----------------------------------------------------
-- RLS Fuerte: Un mecánico solo ve, crea y borra SUS propias sesiones
CREATE POLICY "Mecánico ve sus propias sesiones" ON diagnostic_sessions
    FOR SELECT USING (auth.uid() = mechanic_id);

CREATE POLICY "Mecánico crea sus sesiones" ON diagnostic_sessions
    FOR INSERT WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Mecánico borra sus sesiones" ON diagnostic_sessions
    FOR DELETE USING (auth.uid() = mechanic_id);

-- ----------------------------------------------------
-- Políticas para 'fault_logs' & 'telemetry_streams'
-- ----------------------------------------------------
-- Cascada de seguridad: Tienes acceso si eres dueño de la 'session_id' vinculada
CREATE POLICY "Acceso a logs vinculado a la sesión del mecánico" ON fault_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM diagnostic_sessions 
            WHERE diagnostic_sessions.id = fault_logs.session_id 
            AND diagnostic_sessions.mechanic_id = auth.uid()
        )
    );

CREATE POLICY "Acceso a telemetría vinculado a la sesión del mecánico" ON telemetry_streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM diagnostic_sessions 
            WHERE diagnostic_sessions.id = telemetry_streams.session_id 
            AND diagnostic_sessions.mechanic_id = auth.uid()
        )
    );

-- ----------------------------------------------------
-- Políticas para 'vehicles'
-- ----------------------------------------------------
-- Inserción libre: Cualquier mecánico puede registrar un VIN nuevo si no existe.
CREATE POLICY "Mecánico puede registrar vehículos" ON vehicles
    FOR INSERT TO authenticated WITH CHECK (true);
    
-- Lectura: Solo pueden ver los vehículos que ellos mismos han escaneado (basado en sus sesiones).
CREATE POLICY "Mecánico ve vehículos de su taller/sesiones" ON vehicles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diagnostic_sessions 
            WHERE diagnostic_sessions.vehicle_id = vehicles.id 
            AND diagnostic_sessions.mechanic_id = auth.uid()
        )
    );
