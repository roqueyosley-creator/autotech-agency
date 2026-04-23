-- Tabla para registro de actuaciones bidireccionales
CREATE TABLE IF NOT EXISTS actuation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id TEXT,
    actuation_id TEXT NOT NULL,
    brand TEXT,
    command_sent TEXT,
    response_received TEXT,
    success BOOLEAN,
    nrc_code TEXT,
    nrc_description TEXT,
    verify_pid TEXT,
    verify_value_before FLOAT,
    verify_value_after FLOAT,
    safety_level TEXT,
    safety_confirmed BOOLEAN,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexar para búsquedas por vehículo y fecha
CREATE INDEX IF NOT EXISTS idx_actuation_logs_vehicle ON actuation_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_actuation_logs_created_at ON actuation_logs(created_at);
