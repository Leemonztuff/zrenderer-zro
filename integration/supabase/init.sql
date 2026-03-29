-- Schema to store character appearances for an RPG
-- This table matches the parameters used by zrenderer

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,

    -- Visual parameters for zrenderer
    job TEXT[] NOT NULL DEFAULT '{"1"}', -- Array of job IDs (e.g., '1' for Swordman)
    gender INT NOT NULL DEFAULT 1,      -- 1: male, 0: female
    head INT NOT NULL DEFAULT 1,
    outfit INT NOT NULL DEFAULT 0,
    headgear INT[] DEFAULT '{}',        -- Up to 3 headgears
    garment INT NOT NULL DEFAULT 0,
    weapon INT NOT NULL DEFAULT 0,
    shield INT NOT NULL DEFAULT 0,
    body_palette INT NOT NULL DEFAULT -1,
    head_palette INT NOT NULL DEFAULT -1,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Basic RLS for character data
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all characters" ON public.characters
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own characters" ON public.characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own characters" ON public.characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);
