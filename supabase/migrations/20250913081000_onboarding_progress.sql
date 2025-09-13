-- Onboarding progress tracking per user (resume capability)
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NULL REFERENCES public.orgs(id) ON DELETE SET NULL,
  engagement_id UUID NULL REFERENCES public.engagements(id) ON DELETE SET NULL,
  step TEXT NOT NULL CHECK (step IN ('org','engagement','modules','agent','schedule','done')) DEFAULT 'org',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users manage only their own progress
DROP POLICY IF EXISTS "Users read own onboarding" ON public.onboarding_progress;
CREATE POLICY "Users read own onboarding" ON public.onboarding_progress
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users write own onboarding" ON public.onboarding_progress;
CREATE POLICY "Users write own onboarding" ON public.onboarding_progress
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- update trigger
CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

