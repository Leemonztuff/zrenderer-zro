-- Ragnarok Online RPG Tactical Integration Schema
-- This schema handles basic character and equipment state for the game.

-- Table for available jobs/classes
CREATE TABLE IF NOT EXISTS public.jobs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ro_job_id INTEGER NOT NULL UNIQUE,
    description TEXT
);

-- Table for player characters
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    job_id INTEGER REFERENCES public.jobs(ro_job_id),
    gender SMALLINT CHECK (gender IN (0, 1)) DEFAULT 1, -- 0: female, 1: male
    head_id INTEGER DEFAULT 1,
    body_palette INTEGER DEFAULT -1,
    head_palette INTEGER DEFAULT -1,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for equipment
CREATE TABLE IF NOT EXISTS public.equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ro_item_id INTEGER NOT NULL,
    type TEXT CHECK (type IN ('headgear', 'garment', 'weapon', 'shield')),
    slot INTEGER CHECK (slot IN (0, 1, 2, 3)) -- for headgears mostly
);

-- Table for character inventory/equipped items
CREATE TABLE IF NOT EXISTS public.character_equipment (
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES public.equipment(id),
    is_equipped BOOLEAN DEFAULT false,
    PRIMARY KEY (character_id, equipment_id)
);

-- Storage bucket setup (instructions)
-- Run these in your Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sprites', 'sprites', true);
