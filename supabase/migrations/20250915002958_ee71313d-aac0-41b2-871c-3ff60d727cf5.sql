-- Create activities table for ActivityFeed component
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium'
);

-- Create indexes for performance
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_entity_id ON public.activities(entity_id);
CREATE INDEX idx_activities_is_read ON public.activities(is_read);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all activities" 
ON public.activities 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update all activities" 
ON public.activities 
FOR UPDATE 
USING (true);

CREATE POLICY "Super admins can delete activities" 
ON public.activities 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample activities for testing
INSERT INTO public.activities (type, title, description, user_id, entity_type, entity_id, priority) 
SELECT 
  'engagement_created',
  'New engagement created',
  'A new engagement "' || name || '" has been created',
  created_by,
  'engagement',
  id,
  'high'
FROM public.engagements
LIMIT 5;

INSERT INTO public.activities (type, title, description, user_id, entity_type, entity_id, priority) 
SELECT 
  'project_created',
  'New project created',
  'A new project "' || name || '" has been created',
  created_by,
  'project',
  id,
  'medium'
FROM public.projects
LIMIT 5;