-- Create AI agents management tables
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  system_prompt TEXT,
  tools JSONB DEFAULT '[]'::jsonb,
  memory_config JSONB DEFAULT '{}'::jsonb,
  usage_stats JSONB DEFAULT '{"total_conversations": 0, "total_tokens": 0, "last_used": null}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent conversations table for tracking
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  token_count INTEGER DEFAULT 0,
  outcome_rating INTEGER CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  outcome_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent prompts library
CREATE TABLE public.agent_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  vertical TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all agent tables
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_agents
CREATE POLICY "Users can view all agents" 
ON public.ai_agents 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create agents" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update agents" 
ON public.ai_agents 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete agents" 
ON public.ai_agents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS policies for agent_conversations
CREATE POLICY "Users can view all conversations" 
ON public.agent_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create conversations" 
ON public.agent_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their conversations" 
ON public.agent_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete conversations" 
ON public.agent_conversations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS policies for agent_prompts
CREATE POLICY "Users can view all prompts" 
ON public.agent_prompts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create prompts" 
ON public.agent_prompts 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update prompts" 
ON public.agent_prompts 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete prompts" 
ON public.agent_prompts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create triggers for updated_at
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_prompts_updated_at
BEFORE UPDATE ON public.agent_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_ai_agents_project_id ON public.ai_agents(project_id);
CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_agent_conversations_agent_id ON public.agent_conversations(agent_id);
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_prompts_category ON public.agent_prompts(category);
CREATE INDEX idx_agent_prompts_tags ON public.agent_prompts USING GIN(tags);