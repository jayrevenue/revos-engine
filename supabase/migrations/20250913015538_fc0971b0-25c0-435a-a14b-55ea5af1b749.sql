-- Create revenue tracking table
CREATE TABLE public.revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  payment_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_amount CHECK (amount >= 0),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all revenue" 
ON public.revenue 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create revenue" 
ON public.revenue 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update revenue" 
ON public.revenue 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete revenue" 
ON public.revenue 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_revenue_updated_at
BEFORE UPDATE ON public.revenue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_revenue_project_id ON public.revenue(project_id);
CREATE INDEX idx_revenue_payment_status ON public.revenue(payment_status);
CREATE INDEX idx_revenue_invoice_date ON public.revenue(invoice_date);
CREATE INDEX idx_revenue_payment_date ON public.revenue(payment_date);