-- Initial schema for Tactical RPG using zrenderer

-- Enable RLS (Row Level Security)
-- This table stores character configurations that map to zrenderer parameters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,

  -- zrenderer parameters
  job_id INTEGER NOT NULL DEFAULT 0,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  head_id INTEGER NOT NULL DEFAULT 1,
  headgear_ids INTEGER[] DEFAULT '{}',
  garment_id INTEGER DEFAULT 0,
  weapon_id INTEGER DEFAULT 0,
  shield_id INTEGER DEFAULT 0,
  body_palette INTEGER DEFAULT -1,
  head_palette INTEGER DEFAULT -1,

  -- State for animation
  current_action INTEGER DEFAULT 0,
  current_frame INTEGER DEFAULT -1,

  -- Tactical RPG stats
  hp INTEGER NOT NULL DEFAULT 100,
  sp INTEGER NOT NULL DEFAULT 50,
  level INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
