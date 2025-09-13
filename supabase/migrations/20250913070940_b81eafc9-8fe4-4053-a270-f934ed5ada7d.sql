-- Create organization settings table
CREATE TABLE public.org_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Organization',
  domain TEXT,
  description TEXT,
  timezone TEXT DEFAULT 'utc-5',
  currency TEXT DEFAULT 'usd',
  ai_auto_learning BOOLEAN DEFAULT true,
  real_time_analytics BOOLEAN DEFAULT true,
  external_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  new_engagement BOOLEAN DEFAULT true,
  deliverable_deadline BOOLEAN DEFAULT true,
  ai_conversation_completed BOOLEAN DEFAULT true,
  analytics_report_ready BOOLEAN DEFAULT true,
  team_member_invited BOOLEAN DEFAULT true,
  system_maintenance BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user preferences table for appearance settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  theme TEXT DEFAULT 'system',
  accent_color TEXT DEFAULT 'orange',
  layout_density TEXT DEFAULT 'comfortable',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for org_settings
CREATE POLICY "Users can view org settings" 
ON public.org_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage org settings" 
ON public.org_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_org_settings_updated_at
BEFORE UPDATE ON public.org_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();