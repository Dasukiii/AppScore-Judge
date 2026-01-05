-- AppScore Judge Database Schema (AI-Only Evaluation)
-- Run this script in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Auto-created profile for each authenticated user
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- APPS TABLE
-- ============================================
-- Stores submitted applications with instant AI evaluation results
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  screenshots TEXT[] DEFAULT '{}',
  
  -- AI Evaluation Scores (1-5 scale, set immediately on submission)
  ux_score INTEGER CHECK (ux_score >= 1 AND ux_score <= 5),
  usefulness_score INTEGER CHECK (usefulness_score >= 1 AND usefulness_score <= 5),
  reliability_score INTEGER CHECK (reliability_score >= 1 AND reliability_score <= 5),
  data_handling_score INTEGER CHECK (data_handling_score >= 1 AND data_handling_score <= 5),
  clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
  
  -- Calculated total score (0-100)
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  
  -- AI-generated feedback and insights
  ai_feedback TEXT,
  ai_strengths TEXT[],
  ai_improvements TEXT[],
  ai_action_items TEXT[],
  
  -- Score explanations per criterion
  ux_explanation TEXT,
  usefulness_explanation TEXT,
  reliability_explanation TEXT,
  data_handling_explanation TEXT,
  clarity_explanation TEXT,
  
  -- Metadata
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Apps policies
CREATE POLICY "Users can view all apps" ON public.apps
  FOR SELECT USING (true);

CREATE POLICY "Users can create apps" ON public.apps
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update own apps" ON public.apps
  FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Users can delete own apps" ON public.apps
  FOR DELETE USING (auth.uid() = submitted_by);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS apps_submitted_by_idx ON public.apps(submitted_by);
CREATE INDEX IF NOT EXISTS apps_total_score_idx ON public.apps(total_score DESC);
CREATE INDEX IF NOT EXISTS apps_created_at_idx ON public.apps(created_at DESC);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_apps_updated_at ON public.apps;
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STORAGE BUCKET FOR SCREENSHOTS
-- ============================================
-- Run this in the Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Users can upload screenshots" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

-- CREATE POLICY "Anyone can view screenshots" ON storage.objects
--   FOR SELECT USING (bucket_id = 'screenshots');

-- ============================================
-- VIEWS FOR LEADERBOARD
-- ============================================
CREATE OR REPLACE VIEW public.app_leaderboard AS
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
FROM public.apps
WHERE total_score IS NOT NULL
ORDER BY total_score DESC;

-- Grant access to view
GRANT SELECT ON public.app_leaderboard TO authenticated;

-- ============================================
-- HELPER FUNCTION: Calculate total score
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_total_score(
  ux INTEGER,
  usefulness INTEGER,
  reliability INTEGER,
  data_handling INTEGER,
  clarity INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  -- Each criterion is worth 20% (5 criteria × 20% = 100%)
  -- Score per criterion is 1-5, so max = 5 × 5 = 25
  -- Total percentage = (sum of scores / 25) × 100
  RETURN ROUND(((COALESCE(ux, 0) + COALESCE(usefulness, 0) + COALESCE(reliability, 0) + COALESCE(data_handling, 0) + COALESCE(clarity, 0))::DECIMAL / 25) * 100);
END;
$$ LANGUAGE plpgsql;
