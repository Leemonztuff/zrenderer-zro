--
-- Supabase Schema for Ragnarok Online Visual Parameters
-- Use this table to store character appearances and equipment.
--

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL UNIQUE,

    -- Primary visual parameters for zrenderer
    job TEXT NOT NULL DEFAULT '0', -- Job ID as string
    gender INTEGER DEFAULT 1, -- 1 for male, 0 for female
    head INTEGER DEFAULT 1,
    outfit INTEGER DEFAULT 0,
    headgear INTEGER[] DEFAULT '{}',
    garment INTEGER DEFAULT 0,
    weapon INTEGER DEFAULT 0,
    shield INTEGER DEFAULT 0,
    body_palette INTEGER DEFAULT -1,
    head_palette INTEGER DEFAULT -1,

    -- Additional game state
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,

    -- RPG Stats (Optional, for integration)
    hp INTEGER DEFAULT 100,
    sp INTEGER DEFAULT 10,
    strength INTEGER DEFAULT 1,
    agility INTEGER DEFAULT 1,
    vitality INTEGER DEFAULT 1,
    intelligence INTEGER DEFAULT 1,
    dexterity INTEGER DEFAULT 1,
    luck INTEGER DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic RLS (Row Level Security)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access"
  ON public.characters FOR SELECT
  USING (true);

CREATE POLICY "Allow individual character management"
  ON public.characters FOR ALL
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
