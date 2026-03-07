-- This is a sample Supabase SQL schema for managing character sprites and related data.
-- This can be used to track which sprites are cached in Supabase storage and their associated metadata.

CREATE TABLE IF NOT EXISTS character_sprites (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL,
  gender INT NOT NULL DEFAULT 1,
  head_id INT DEFAULT 1,
  headgear INT[] DEFAULT ARRAY[]::INT[],
  garment_id INT DEFAULT 0,
  weapon_id INT DEFAULT 0,
  shield_id INT DEFAULT 0,
  body_palette_id INT DEFAULT -1,
  head_palette_id INT DEFAULT -1,
  action_id INT DEFAULT 0,
  frame_id INT DEFAULT -1, -- -1 for all frames, or specific frame index

  storage_path TEXT NOT NULL, -- Path to the PNG in Supabase Storage
  public_url TEXT,            -- Cached public URL

  checksum TEXT,              -- Checksum of parameters for easy lookup
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(checksum)
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_character_sprites_modtime
BEFORE UPDATE ON character_sprites
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Storage bucket setup (Optional, depending on your setup)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sprites', 'sprites', true);
-- CREATE POLICY "Public read for sprites" ON storage.objects FOR SELECT USING (bucket_id = 'sprites');
-- CREATE POLICY "Service role write for sprites" ON storage.objects FOR ALL USING (auth.role() = 'service_role');
