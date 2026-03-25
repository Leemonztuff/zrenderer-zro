-- Esquema de base de datos para persistir apariencias de personajes en Supabase
-- Estos campos corresponden a los parámetros visuales que zrenderer puede procesar.

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,

    -- Visuales base
    job INTEGER NOT NULL DEFAULT 0, -- ID del trabajo (ej: 0 Novice, 1 Swordman)
    gender SMALLINT NOT NULL DEFAULT 1, -- 0 Female, 1 Male
    head INTEGER NOT NULL DEFAULT 1, -- ID del estilo de pelo

    -- Equipo visible
    headgear INTEGER[] DEFAULT '{}', -- Array de IDs de accesorios de cabeza (máximo 3)
    garment INTEGER DEFAULT 0, -- ID de capa/capucha
    weapon INTEGER DEFAULT 0, -- ID de arma
    shield INTEGER DEFAULT 0, -- ID de escudo

    -- Paletas de colores
    body_palette INTEGER DEFAULT -1,
    head_palette INTEGER DEFAULT -1,

    -- Estado adicional
    action INTEGER DEFAULT 0, -- Acción actual (stand, attack, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad de Supabase
CREATE POLICY "Public read for characters"
ON public.characters FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own characters"
ON public.characters FOR ALL
USING (auth.uid() = user_id);
