-- Habilitar extensión pgvector para búsquedas semánticas
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla para fragmentos de manuales técnicos (RAG)
CREATE TABLE IF NOT EXISTS manual_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding VECTOR(768), -- Dimensión para Gemini text-embedding-004
    make TEXT,
    model TEXT,
    year_from INTEGER,
    year_to INTEGER,
    section TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para diagnósticos realizados por IA (Historial)
CREATE TABLE IF NOT EXISTS ai_diagnosis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id TEXT,
    dtcs TEXT[],
    symptoms TEXT,
    result JSONB,
    confidence INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para búsqueda semántica (Similarity Search)
CREATE OR REPLACE FUNCTION match_manual_chunks (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INTEGER,
    filter_make TEXT DEFAULT NULL,
    filter_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity FLOAT,
    make TEXT,
    section TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mc.id,
        mc.content,
        1 - (mc.embedding <=> query_embedding) AS similarity,
        mc.make,
        mc.section
    FROM manual_chunks mc
    WHERE 1 - (mc.embedding <=> query_embedding) > match_threshold
      AND (filter_make IS NULL OR mc.make = filter_make)
      AND (filter_year IS NULL OR (filter_year >= mc.year_from AND filter_year <= mc.year_to))
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
