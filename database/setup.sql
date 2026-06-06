-- Portfolio rating table for Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard → SQL Editor → New query

create table if not exists public.portfolio_ratings (
  id         uuid primary key default gen_random_uuid(),
  stars      smallint not null check (stars >= 1 and stars <= 5),
  created_at timestamptz not null default now()
);

-- Allow anonymous visitors to read and submit ratings
alter table public.portfolio_ratings enable row level security;

create policy "Anyone can read ratings"
  on public.portfolio_ratings
  for select
  to anon, authenticated
  using (true);

create policy "Anyone can submit a rating"
  on public.portfolio_ratings
  for insert
  to anon, authenticated
  with check (stars >= 1 and stars <= 5);

-- Optional: index for faster aggregate queries as ratings grow
create index if not exists portfolio_ratings_created_at_idx
  on public.portfolio_ratings (created_at desc);
