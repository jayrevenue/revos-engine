-- Phase 4: RevOS Modules & IP Management Schema

-- Create RevOS modules table
CREATE TABLE public.revos_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (module_type IN ('outcome_tracker', 'intervention_planner', 'pricing_strategy', 'cac_compression', 'agent_deployment')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outcomes table for tracking before/after
CREATE TABLE public.outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.revos_modules(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  baseline_value NUMERIC,
  target_value NUMERIC,
  current_value NUMERIC,
  measurement_date DATE,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interventions table for planning
CREATE TABLE public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.revos_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  intervention_type TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planned',
  due_date DATE,
  assigned_to UUID,
  expected_impact TEXT,
  actual_impact TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt library table for IP management
CREATE TABLE public.prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  vertical TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  variables JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playbooks table
CREATE TABLE public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  vertical TEXT,
  content JSONB DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version TEXT DEFAULT '1.0',
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create frameworks table for IP storage
CREATE TABLE public.frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  framework_type TEXT CHECK (framework_type IN ('process', 'template', 'checklist', 'sop', 'visual')) DEFAULT 'process',
  content JSONB DEFAULT '{}',
  file_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version TEXT DEFAULT '1.0',
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.revos_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revos_modules
CREATE POLICY "Users can view all revos modules" ON public.revos_modules FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create revos modules" ON public.revos_modules FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update revos modules" ON public.revos_modules FOR UPDATE USING (true);
CREATE POLICY "Admins can delete revos modules" ON public.revos_modules FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for outcomes
CREATE POLICY "Users can view all outcomes" ON public.outcomes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create outcomes" ON public.outcomes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update outcomes" ON public.outcomes FOR UPDATE USING (true);
CREATE POLICY "Admins can delete outcomes" ON public.outcomes FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for interventions
CREATE POLICY "Users can view all interventions" ON public.interventions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create interventions" ON public.interventions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update interventions" ON public.interventions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete interventions" ON public.interventions FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for prompt_library
CREATE POLICY "Users can view all prompts" ON public.prompt_library FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create prompts" ON public.prompt_library FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update prompts" ON public.prompt_library FOR UPDATE USING (true);
CREATE POLICY "Admins can delete prompts" ON public.prompt_library FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for playbooks
CREATE POLICY "Users can view all playbooks" ON public.playbooks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create playbooks" ON public.playbooks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update playbooks" ON public.playbooks FOR UPDATE USING (true);
CREATE POLICY "Admins can delete playbooks" ON public.playbooks FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for frameworks
CREATE POLICY "Users can view all frameworks" ON public.frameworks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create frameworks" ON public.frameworks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update frameworks" ON public.frameworks FOR UPDATE USING (true);
CREATE POLICY "Admins can delete frameworks" ON public.frameworks FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_revos_modules_updated_at
  BEFORE UPDATE ON public.revos_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outcomes_updated_at
  BEFORE UPDATE ON public.outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at
  BEFORE UPDATE ON public.interventions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_library_updated_at
  BEFORE UPDATE ON public.prompt_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playbooks_updated_at
  BEFORE UPDATE ON public.playbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_frameworks_updated_at
  BEFORE UPDATE ON public.frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();