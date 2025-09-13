-- Phase 1: Database Schema Transformation for TRS RevOS Platform (Fixed)

-- Create new user role enum for PRD compliance
CREATE TYPE public.app_role AS ENUM ('super_admin', 'rev_scientist', 'qa');

-- Create organizations table (replacing client entity focus)
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create engagements table (central entity replacing projects)
CREATE TABLE public.engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'complete')) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboards table for org-specific dashboard data
CREATE TABLE public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('clarity_audit', 'gap_map', 'executive_command', 'agent_roi')),
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create logs table for detailed agent interaction tracking
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
  message TEXT,
  direction TEXT CHECK (direction IN ('input', 'output')) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user_roles table to use new enum (safe approach)
ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role USING 
  CASE 
    WHEN role = 'admin' THEN 'super_admin'::app_role
    WHEN role = 'scientist' THEN 'rev_scientist'::app_role
    WHEN role = 'analyst' THEN 'qa'::app_role
    ELSE 'qa'::app_role
  END;

-- Update ai_agents table to include org and engagement references
ALTER TABLE public.ai_agents 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.engagements(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orgs
CREATE POLICY "Users can view all orgs" ON public.orgs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create orgs" ON public.orgs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update orgs" ON public.orgs FOR UPDATE USING (true);
CREATE POLICY "Admins can delete orgs" ON public.orgs FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for engagements
CREATE POLICY "Users can view all engagements" ON public.engagements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create engagements" ON public.engagements FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update engagements" ON public.engagements FOR UPDATE USING (true);
CREATE POLICY "Admins can delete engagements" ON public.engagements FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for dashboards
CREATE POLICY "Users can view all dashboards" ON public.dashboards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create dashboards" ON public.dashboards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update dashboards" ON public.dashboards FOR UPDATE USING (true);
CREATE POLICY "Admins can delete dashboards" ON public.dashboards FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for logs
CREATE POLICY "Users can view all logs" ON public.logs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create logs" ON public.logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update logs" ON public.logs FOR UPDATE USING (true);
CREATE POLICY "Admins can delete logs" ON public.logs FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update has_role function to use new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Data migration: Convert existing clients to orgs
INSERT INTO public.orgs (name, created_at, updated_at)
SELECT company, created_at, updated_at FROM public.clients
ON CONFLICT DO NOTHING;

-- Data migration: Convert existing projects to engagements
INSERT INTO public.engagements (org_id, name, status, start_date, end_date, budget, description, created_by, created_at, updated_at)
SELECT 
  o.id,
  p.name,
  p.status,
  p.start_date,
  p.end_date,
  p.budget,
  p.description,
  p.created_by,
  p.created_at,
  p.updated_at
FROM public.projects p
JOIN public.clients c ON p.client_id = c.id
JOIN public.orgs o ON c.company = o.name
ON CONFLICT DO NOTHING;