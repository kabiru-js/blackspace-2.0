-- Blackspace v4 — search observability
-- Run in Supabase SQL Editor. Idempotent.

create table if not exists search_logs (
  id uuid primary key default gen_random_uuid(),
  query text,
  keywords text[],
  result_count int,
  fallback_used boolean default false,
  clicked_result_id uuid default null,  -- for future synonym learning
  created_at timestamp default now()
);

-- Allow insert via anon key (logging must never depend on auth roles)
alter table search_logs enable row level security;
drop policy if exists "anon can insert search logs" on search_logs;
create policy "anon can insert search logs"
  on search_logs for insert
  with check (true);
