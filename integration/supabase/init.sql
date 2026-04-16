-- Esquema inicial para gestionar personajes de Ragnarok Online en un RPG táctico
-- Este esquema está diseñado para usarse con Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,

    -- Parámetros visuales para zrenderer
    job INTEGER[] NOT NULL DEFAULT '{0}', -- Array de IDs de trabajo (e.g. {1001} o {4012})
    gender INTEGER NOT NULL DEFAULT 1, -- 1: male, 0: female
    head INTEGER NOT NULL DEFAULT 1,
    outfit INTEGER NOT NULL DEFAULT 0,
    action INTEGER NOT NULL DEFAULT 0,
    headdir INTEGER NOT NULL DEFAULT 0,
    headgear INTEGER[] DEFAULT '{}', -- Hasta 3 IDs
    garment INTEGER DEFAULT 0,
    weapon INTEGER DEFAULT 0,
    shield INTEGER DEFAULT 0,
    body_palette INTEGER DEFAULT -1,
    head_palette INTEGER DEFAULT -1,

    -- Estadísticas de juego (ejemplo para RPG táctico)
    level INTEGER DEFAULT 1,
    hp_current INTEGER DEFAULT 100,
    hp_max INTEGER DEFAULT 100,
    sp_current INTEGER DEFAULT 50,
    sp_max INTEGER DEFAULT 50,
    pos_x INTEGER DEFAULT 0,
    pos_y INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Usuarios pueden ver todos los personajes"
    ON public.characters FOR SELECT
    USING (true);

CREATE POLICY "Usuarios pueden crear sus propios personajes"
    ON public.characters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios personajes"
    ON public.characters FOR UPDATE
    USING (auth.uid() = user_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
