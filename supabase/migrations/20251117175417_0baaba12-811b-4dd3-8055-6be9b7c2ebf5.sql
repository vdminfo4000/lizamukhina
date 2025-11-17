-- Create asset_comments table for employee messages
CREATE TABLE public.asset_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('plot', 'equipment', 'facility')),
  asset_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  platform_name TEXT NOT NULL,
  platform_type TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  config JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM contacts table (partners and clients)
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('partner', 'client', 'supplier')),
  name TEXT NOT NULL,
  organization TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM messages table (chat between employees)
CREATE TABLE public.crm_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_id UUID,
  channel_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM emails table
CREATE TABLE public.crm_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM documents table
CREATE TABLE public.crm_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  uploader_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_comments
CREATE POLICY "Users can view comments in their company"
  ON public.asset_comments FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create comments in their company"
  ON public.asset_comments FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND user_id = auth.uid());

-- RLS policies for integrations
CREATE POLICY "Admins can view company integrations"
  ON public.integrations FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage company integrations"
  ON public.integrations FOR ALL
  USING (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS policies for crm_contacts
CREATE POLICY "Users can view contacts in their company"
  ON public.crm_contacts FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can manage contacts in their company"
  ON public.crm_contacts FOR ALL
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS policies for crm_messages
CREATE POLICY "Users can view their messages"
  ON public.crm_messages FOR SELECT
  USING (
    company_id = get_user_company_id(auth.uid()) AND 
    (sender_id = auth.uid() OR receiver_id = auth.uid() OR receiver_id IS NULL)
  );

CREATE POLICY "Users can send messages"
  ON public.crm_messages FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Users can update their received messages"
  ON public.crm_messages FOR UPDATE
  USING (receiver_id = auth.uid() OR sender_id = auth.uid());

-- RLS policies for crm_emails
CREATE POLICY "Users can view emails in their company"
  ON public.crm_emails FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create emails"
  ON public.crm_emails FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update their emails"
  ON public.crm_emails FOR UPDATE
  USING (user_id = auth.uid());

-- RLS policies for crm_documents
CREATE POLICY "Users can view documents in their company"
  ON public.crm_documents FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can upload documents"
  ON public.crm_documents FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND uploaded_by = auth.uid());

CREATE POLICY "Users can delete their documents"
  ON public.crm_documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();