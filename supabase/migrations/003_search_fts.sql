-- Blackspace v4 — full-text search for deterministic baseline retrieval
-- Run in Supabase SQL Editor. Idempotent.
--
-- Adds a generated tsvector column over title + description so the search
-- endpoint can use real Postgres full-text search (stemming: "learn" matches
-- "learning", "chef" matches "chefing", etc.) with a GIN index for speed.
-- GENERATED ... STORED backfills existing rows automatically.

alter table scholarships
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) stored;

create index if not exists idx_scholarships_search_vector
  on scholarships
  using gin (search_vector);
