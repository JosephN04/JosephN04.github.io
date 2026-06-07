-- Feedback and ratings for site and per-project
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  project_slug text not null,
  stars        smallint not null check (stars >= 1 and stars <= 5),
  message      text,
  created_at   timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can read feedback"
  on public.feedback for select to anon, authenticated using (true);

create policy "Anyone can submit feedback"
  on public.feedback for insert to anon, authenticated
  with check (stars >= 1 and stars <= 5);

create index if not exists feedback_project_created_idx
  on public.feedback (project_slug, created_at desc);

-- Q&A section (answer in Supabase Table Editor)
create table if not exists public.qa_questions (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  answered_at  timestamptz
);

alter table public.qa_questions enable row level security;

create policy "Read published Q&A"
  on public.qa_questions for select to anon, authenticated
  using (is_published = true and answer is not null);

create policy "Anyone can ask a question"
  on public.qa_questions for insert to anon, authenticated
  with check (answer is null and is_published = false);

-- Legacy table (optional - safe to drop if unused)
-- drop table if exists public.portfolio_ratings;
