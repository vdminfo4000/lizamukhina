-- Create storage bucket for CRM documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('crm-documents', 'crm-documents', false);

-- Create RLS policies for CRM documents bucket
CREATE POLICY "Users can view their company documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'crm-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND company_id IN (
      SELECT company_id FROM public.profiles WHERE id = (storage.foldername(name))[1]::uuid
    )
  )
);

CREATE POLICY "Users can upload documents to their company"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crm-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'crm-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for CRM tables
ALTER TABLE public.crm_messages REPLICA IDENTITY FULL;
ALTER TABLE public.crm_emails REPLICA IDENTITY FULL;
ALTER TABLE public.crm_documents REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;