-- =============================================
-- MIGRATION: Add AI Evaluation columns to apps table
-- =============================================
-- Run this in Supabase SQL Editor to update your existing table
-- =============================================

-- Step 1: Drop the old view that depends on the status column
DROP VIEW IF EXISTS app_leaderboard CASCADE;

-- Step 2: Remove status column from apps table
ALTER TABLE apps DROP COLUMN IF EXISTS status;

-- Step 3: Add AI Score columns to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ux_score INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS usefulness_score INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS reliability_score INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS data_handling_score INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS clarity_score INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS total_score INTEGER;

-- Step 4: Add AI Feedback columns
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ai_feedback TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ai_strengths TEXT[];
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ai_improvements TEXT[];

-- Step 5: Add score explanation columns
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ux_explanation TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS usefulness_explanation TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS reliability_explanation TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS data_handling_explanation TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS clarity_explanation TEXT;

-- Step 6: Add evaluated_at timestamp
ALTER TABLE apps ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ;

-- Step 7: Recreate the leaderboard view WITHOUT the status column
CREATE OR REPLACE VIEW app_leaderboard AS
SELECT 
  id,
  name,
  owner,
  url,
  total_score,
  ux_score,
  usefulness_score,
  reliability_score,
  data_handling_score,
  clarity_score,
  ai_feedback,
  evaluated_at,
  created_at,
  RANK() OVER (ORDER BY total_score DESC NULLS LAST) as rank
FROM apps
WHERE total_score IS NOT NULL
ORDER BY total_score DESC;

-- Grant access to view
GRANT SELECT ON app_leaderboard TO authenticated;

-- Optional: Drop evaluations table if you created it (no longer needed)
-- Uncomment the line below if you want to remove it:
-- DROP TABLE IF EXISTS evaluations CASCADE;
