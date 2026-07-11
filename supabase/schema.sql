-- Run this in the Supabase SQL editor for your project.

-- ============ Favorites ============
-- entity_type: 'team' | 'league' | 'player' | 'f1_driver' | 'f1_team'
-- entity_id: the id from API-Football / Ergast, stored as text for simplicity
create table if not exists favorites (
  id bigint generated always as identity primary key,
  owner_id text not null,
  entity_type text not null check (entity_type in ('team', 'league', 'player', 'f1_driver', 'f1_team')),
  entity_id text not null,
  entity_name text not null,
  entity_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, entity_type, entity_id)
);

alter table favorites enable row level security;

-- Anonymous-friendly policy: anyone can manage rows that match their own
-- owner_id (a random UUID stored in localStorage). Tighten this once you
-- add real authentication (e.g. scope to auth.uid()::text = owner_id).
create policy "Owners can read their favorites"
  on favorites for select
  using (true);

create policy "Owners can insert their favorites"
  on favorites for insert
  with check (true);

create policy "Owners can delete their favorites"
  on favorites for delete
  using (true);

-- ============ Predictions ============
-- event_type: 'fixture' | 'race'
create table if not exists predictions (
  id bigint generated always as identity primary key,
  owner_id text not null,
  event_type text not null check (event_type in ('fixture', 'race')),
  event_id text not null,
  choice text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, event_type, event_id)
);

alter table predictions enable row level security;

create policy "Anyone can read predictions"
  on predictions for select
  using (true);

create policy "Anyone can cast a prediction"
  on predictions for insert
  with check (true);

create policy "Owners can change their own prediction"
  on predictions for update
  using (true);
