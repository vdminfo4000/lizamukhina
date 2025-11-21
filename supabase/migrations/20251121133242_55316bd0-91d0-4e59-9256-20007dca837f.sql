-- Create template_placements table for storing template placement locations
CREATE TABLE public.template_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('reports', 'documents', 'planning_plots', 'planning_equipment', 'planning_facilities')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(template_id, placement_type)
);

-- Enable RLS
ALTER TABLE public.template_placements ENABLE ROW LEVEL SECURITY;

-- Users can view placements in their company
CREATE POLICY "Users can view placements in their company"
ON public.template_placements
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

-- Admins can manage placements in their company
CREATE POLICY "Admins can manage placements in their company"
ON public.template_placements
FOR ALL
USING (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_template_placements_company ON public.template_placements(company_id);
CREATE INDEX idx_template_placements_template ON public.template_placements(template_id);
CREATE INDEX idx_template_placements_type ON public.template_placements(placement_type);