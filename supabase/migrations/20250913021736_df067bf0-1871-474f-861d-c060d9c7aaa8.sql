-- Phase 1: Database Schema Transformation for TRS RevOS Platform (Step by Step)

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

-- Update ai_agents table to include org and engagement references
ALTER TABLE public.ai_agents 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.engagements(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;