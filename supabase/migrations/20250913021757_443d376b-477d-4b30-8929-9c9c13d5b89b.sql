-- Phase 1B: Add RLS Policies and Complete Migration

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