-- Fix RLS policies for critical security vulnerabilities

-- 1. Fix clients table - restrict access based on user roles
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;
CREATE POLICY "Users can view clients based on role" 
ON public.clients 
FOR SELECT 
USING (
  -- Super admins can see all clients
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Rev scientists can see clients they created or are assigned to
  (has_role(auth.uid(), 'rev_scientist'::app_role) AND created_by = auth.uid())
);

-- 2. Fix profiles table - users can only see their own profile and admins can see all
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 3. Fix revenue table - restrict access to financial personnel only
DROP POLICY IF EXISTS "Users can view all revenue" ON public.revenue;
CREATE POLICY "Only admins can view revenue data" 
ON public.revenue 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Fix agent_conversations - users can only see their own conversations
DROP POLICY IF EXISTS "Users can view all conversations" ON public.agent_conversations;
CREATE POLICY "Users can view their own conversations only" 
ON public.agent_conversations 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Fix logs table - restrict to admins only
DROP POLICY IF EXISTS "Users can view all logs" ON public.logs;
CREATE POLICY "Only admins can view logs" 
ON public.logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));