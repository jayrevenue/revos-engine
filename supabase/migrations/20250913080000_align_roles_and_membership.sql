-- Align roles to app_role, introduce org_members, and tighten sample RLS

-- 1) Organization membership table
CREATE TABLE IF NOT EXISTS public.org_members (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'rev_scientist',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Self visibility and admin management
DROP POLICY IF EXISTS "Users can view own org memberships" ON public.org_members;
CREATE POLICY "Users can view own org memberships"
ON public.org_members
FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Admins manage org memberships" ON public.org_members;
CREATE POLICY "Admins manage org memberships"
ON public.org_members
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 2) Helper functions for membership checks
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.user_id = _user_id AND m.org_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_engagement_member(_user_id uuid, _engagement_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.engagements e
    JOIN public.org_members m ON m.org_id = e.org_id
    WHERE e.id = _engagement_id AND m.user_id = _user_id
  );
$$;

-- 3) Tighten sample RLS on core entities (drop permissive policies; scope to membership/admin)

-- Orgs
DROP POLICY IF EXISTS "Users can view all orgs" ON public.orgs;
DROP POLICY IF EXISTS "Users can update orgs" ON public.orgs;
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON public.orgs;
DROP POLICY IF EXISTS "Admins can delete orgs" ON public.orgs;

CREATE POLICY "View orgs if member or admin"
ON public.orgs
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  is_org_member(auth.uid(), id)
);

CREATE POLICY "Admins manage orgs"
ON public.orgs
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Engagements
DROP POLICY IF EXISTS "Users can view all engagements" ON public.engagements;
DROP POLICY IF EXISTS "Users can update engagements" ON public.engagements;
DROP POLICY IF EXISTS "Authenticated users can create engagements" ON public.engagements;
DROP POLICY IF EXISTS "Admins can delete engagements" ON public.engagements;

CREATE POLICY "View engagements if org member or admin"
ON public.engagements
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  is_engagement_member(auth.uid(), id)
);

CREATE POLICY "Create engagements if creator is user"
ON public.engagements
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins manage engagements"
ON public.engagements
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Dashboards
DROP POLICY IF EXISTS "Users can view all dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can update dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Authenticated users can create dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Admins can delete dashboards" ON public.dashboards;

CREATE POLICY "View dashboards if member or admin"
ON public.dashboards
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (engagement_id IS NOT NULL AND is_engagement_member(auth.uid(), engagement_id)) OR
  (engagement_id IS NULL AND is_org_member(auth.uid(), org_id))
);

CREATE POLICY "Admins manage dashboards"
ON public.dashboards
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Logs
DROP POLICY IF EXISTS "Users can view all logs" ON public.logs;
DROP POLICY IF EXISTS "Users can update logs" ON public.logs;
DROP POLICY IF EXISTS "Authenticated users can create logs" ON public.logs;
DROP POLICY IF EXISTS "Admins can delete logs" ON public.logs;

CREATE POLICY "View logs if engagement member or admin"
ON public.logs
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (engagement_id IS NOT NULL AND is_engagement_member(auth.uid(), engagement_id))
);

CREATE POLICY "Admins manage logs"
ON public.logs
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- AI Agents
DROP POLICY IF EXISTS "Users can view all agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can create agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Users can update agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Admins can delete agents" ON public.ai_agents;

CREATE POLICY "View agents if member or admin"
ON public.ai_agents
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (org_id IS NOT NULL AND is_org_member(auth.uid(), org_id)) OR
  (engagement_id IS NOT NULL AND is_engagement_member(auth.uid(), engagement_id))
);

CREATE POLICY "Create agents if creator is user"
ON public.ai_agents
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins manage agents"
ON public.ai_agents
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 4) Normalize old 'admin' policies to 'super_admin' (drop & recreate)

-- revenue
DROP POLICY IF EXISTS "Admins can delete revenue" ON public.revenue;
CREATE POLICY "Admins can delete revenue"
ON public.revenue
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- agent_conversations
DROP POLICY IF EXISTS "Admins can delete conversations" ON public.agent_conversations;
CREATE POLICY "Admins can delete conversations"
ON public.agent_conversations
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- agent_prompts
DROP POLICY IF EXISTS "Admins can delete prompts" ON public.agent_prompts;
CREATE POLICY "Admins can delete prompts"
ON public.agent_prompts
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- projects (legacy)
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

