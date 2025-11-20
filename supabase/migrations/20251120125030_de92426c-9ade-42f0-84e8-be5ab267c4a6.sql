-- Create storage bucket for document templates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-templates', 'document-templates', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for generated documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-documents', 'generated-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for document-templates bucket
CREATE POLICY "Users can view templates from their company"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'document-templates' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'document-templates' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can delete templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'document-templates' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- RLS policies for generated-documents bucket
CREATE POLICY "Users can view documents from their company"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload generated documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their generated documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generated-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Create table for generated documents metadata
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  filled_data JSONB,
  created_by UUID NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for generated_documents
CREATE POLICY "Users can view documents from their company"
ON public.generated_documents FOR SELECT
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create documents for their company"
ON public.generated_documents FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their documents"
ON public.generated_documents FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their documents"
ON public.generated_documents FOR DELETE
USING (created_by = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update document_templates table to store file_url for .docx templates
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add column to track if template is from file or text
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS is_file_template BOOLEAN DEFAULT false;