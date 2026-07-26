-- Blackspace v3 — Phase 0 Database Migration
-- Run in Supabase SQL Editor
-- Non-breaking: only ADD COLUMN, no DROP

-- 1. Add category/type system to opportunities
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'academic';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'scholarship';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS requirements TEXT;

-- 2. Expand user profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS category_focus TEXT[] DEFAULT ARRAY['academic'];
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'entry';

-- 3. Update existing scholarships to have category='academic', type='scholarship'
UPDATE scholarships SET category = 'academic' WHERE category IS NULL;
UPDATE scholarships SET type = 'scholarship' WHERE type IS NULL;
UPDATE scholarships SET skills = '{}' WHERE skills IS NULL;

-- 4. Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_scholarships_category ON scholarships(category);
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON scholarships(type);
CREATE INDEX IF NOT EXISTS idx_users_category_focus ON users USING GIN(category_focus);
CREATE INDEX IF NOT EXISTS idx_opportunities_skills ON scholarships USING GIN(skills);
