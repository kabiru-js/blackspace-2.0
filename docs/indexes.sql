-- Phase 3 Performance Indexes
-- Run this in your Supabase SQL editor

-- Speed up "load my swipes" query
CREATE INDEX IF NOT EXISTS idx_swipes_user_created ON swipes(user_id, created_at DESC);

-- Speed up "load my applications" query
CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC);

-- Speed up deadline filtering + sorting
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);

-- Speed up "find existing applications for scholarships"
CREATE INDEX IF NOT EXISTS idx_applications_user_scholarship ON applications(user_id, scholarship_id);

-- Speed up "find existing swipes for scholarships"
CREATE INDEX IF NOT EXISTS idx_swipes_user_scholarship ON swipes(user_id, scholarship_id);
