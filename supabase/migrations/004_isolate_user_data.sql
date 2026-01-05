-- =============================================
-- ENFORCE USER DATA ISOLATION
-- =============================================
-- This migration updates the Row Level Security (RLS) policies
-- to ensures users can ONLY see their own uploaded apps.
-- =============================================

-- Step 1: Drop the existing "view all" policy
DROP POLICY IF EXISTS "Users can view all apps" ON public.apps;

-- Step 2: Create strict isolation policy for viewing apps
CREATE POLICY "Users can only view their own apps" ON public.apps
  FOR SELECT USING (auth.uid() = submitted_by);

-- Step 3: Ensure Delete policy is secure (already exists, but reinforcing just in case)
-- DROP POLICY IF EXISTS "Users can delete own apps" ON public.apps;
-- CREATE POLICY "Users can delete own apps" ON public.apps
--   FOR DELETE USING (auth.uid() = submitted_by);

-- Note: This effectively makes the "Leaderboard" a "Personal History" view,
-- which matches the requirement for strict data isolation.
