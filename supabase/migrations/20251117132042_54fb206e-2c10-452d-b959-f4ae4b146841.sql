-- Create audit_logs table for tracking user actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs in their company
CREATE POLICY "Admins can view all company audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND user_id IN (
    SELECT id FROM public.profiles 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
);

-- Users can view their own logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- System can insert logs (for application use)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);