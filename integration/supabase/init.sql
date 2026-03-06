-- Table to store character configurations for Ragnarok Online sprites
CREATE TABLE IF NOT EXISTS public.characters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,

    -- zrenderer parameters
    job integer NOT NULL DEFAULT 0,
    gender integer NOT NULL DEFAULT 1 CHECK (gender IN (0, 1)),
    head integer NOT NULL DEFAULT 1,
    outfit integer NOT NULL DEFAULT 0,
    headgear integer[] DEFAULT '{}',
    garment integer NOT NULL DEFAULT 0,
    weapon integer NOT NULL DEFAULT 0,
    shield integer NOT NULL DEFAULT 0,
    body_palette integer NOT NULL DEFAULT -1,
    head_palette integer NOT NULL DEFAULT -1,
    headdir integer NOT NULL DEFAULT 0 CHECK (headdir IN (0, 1, 2, 3)),
    madogear_type integer NOT NULL DEFAULT 0 CHECK (madogear_type IN (0, 2)),
    enable_shadow boolean NOT NULL DEFAULT true,

    -- Default action/frame for static display
    action integer NOT NULL DEFAULT 0,
    frame integer NOT NULL DEFAULT 0,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS (Row Level Security) policies
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all characters') THEN
        CREATE POLICY "Users can view all characters" ON public.characters
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own characters') THEN
        CREATE POLICY "Users can create their own characters" ON public.characters
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own characters') THEN
        CREATE POLICY "Users can update their own characters" ON public.characters
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own characters') THEN
        CREATE POLICY "Users can delete their own characters" ON public.characters
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_characters_updated_at ON public.characters;
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
