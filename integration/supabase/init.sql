-- Database schema for storing RO character configurations in Supabase

-- Character table to store configurations for rendering
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,

  -- Visual parameters for zrenderer
  job integer not null default 0,
  gender integer not null default 1, -- 1=male, 0=female
  head integer not null default 1,
  outfit integer not null default 0,
  headgear integer[] default '{}',
  garment integer not null default 0,
  weapon integer not null default 0,
  shield integer not null default 0,
  body_palette integer default -1,
  head_palette integer default -1,

  -- Position and State (for a tactical RPG)
  pos_x integer default 0,
  pos_y integer default 0,
  hp integer default 100,
  max_hp integer default 100,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS (Row Level Security) - Enable and add policies as needed
alter table public.characters enable row level security;

-- Example policy: Users can see all characters but only edit their own
create policy "Anyone can read characters"
  on public.characters for select
  using (true);

create policy "Users can update their own characters"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Users can insert their own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);
