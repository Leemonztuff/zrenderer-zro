-- Supabase SQL Schema for Ragnarok Online RPG Characters

-- Table to store character appearances
CREATE TABLE public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,

    -- zrenderer visual parameters
    job INTEGER NOT NULL DEFAULT 0,
    gender INTEGER NOT NULL DEFAULT 1, -- 1: male, 0: female
    head INTEGER NOT NULL DEFAULT 1,
    outfit INTEGER DEFAULT 0,
    headgear_1 INTEGER DEFAULT 0,
    headgear_2 INTEGER DEFAULT 0,
    headgear_3 INTEGER DEFAULT 0,
    garment INTEGER DEFAULT 0,
    weapon INTEGER DEFAULT 0,
    shield INTEGER DEFAULT 0,
    body_palette INTEGER DEFAULT -1,
    head_palette INTEGER DEFAULT -1,

    -- Status and location
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    sp INTEGER DEFAULT 50,
    max_sp INTEGER DEFAULT 50,
    map_id TEXT DEFAULT 'prontera',
    pos_x INTEGER DEFAULT 150,
    pos_y INTEGER DEFAULT 150,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own characters"
ON public.characters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
ON public.characters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
ON public.characters FOR UPDATE
USING (auth.uid() = user_id);
