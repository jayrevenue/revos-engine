-- Create calendar integrations table for storing external calendar tokens
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'notion')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  workspace_id TEXT, -- For Notion workspace ID
  calendar_id TEXT, -- For Google Calendar ID
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own integrations" 
ON public.calendar_integrations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create event sync table for tracking external calendar events
CREATE TABLE public.event_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local_event_id UUID NOT NULL,
  external_event_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'notion')),
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(local_event_id, provider)
);

-- Enable RLS
ALTER TABLE public.event_sync ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view sync status for their events" 
ON public.event_sync 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage event sync" 
ON public.event_sync 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add events table if it doesn't exist (for scheduling system)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('engagement_session', 'sprint_planning', 'deliverable_review', 'meeting', 'other')),
  engagement_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view all events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update events" 
ON public.events 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete events" 
ON public.events 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();