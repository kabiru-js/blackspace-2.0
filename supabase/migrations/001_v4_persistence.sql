-- Blackspace v4 — persistence columns for intent-driven profiles
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: ALTER TABLE ... ADD COLUMN IF NOT EXISTS is idempotent.

-- Free-text interests derived from what the user typed in onboarding/profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[];

-- Inferred intents ("learn", "earn", "compete", "create", "explore")
ALTER TABLE users ADD COLUMN IF NOT EXISTS intents text[] DEFAULT '{}'::text[];

-- How exploratory the feed should be
ALTER TABLE users ADD COLUMN IF NOT EXISTS exploration_level text DEFAULT 'balanced'
  CHECK (exploration_level IN ('focused', 'balanced', 'open'));

-- Guard: if your DB already had these columns with a different definition,
-- the ADD COLUMN IF NOT EXISTS is a no-op and you're fine as-is.
