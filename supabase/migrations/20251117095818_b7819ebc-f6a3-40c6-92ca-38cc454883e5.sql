-- Add inn column to profiles to track which INN the user registered with
-- This allows finding users even after they've been removed from a company

ALTER TABLE public.profiles ADD COLUMN inn text;

-- Create index for faster queries
CREATE INDEX idx_profiles_inn ON public.profiles(inn);

-- Update existing profiles with their company's INN
UPDATE public.profiles p
SET inn = c.inn
FROM public.companies c
WHERE p.company_id = c.id AND p.inn IS NULL;

-- Update the handle_new_user function to save INN to profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_company_id UUID;
  new_company_id UUID;
  user_role app_role;
  user_inn TEXT;
BEGIN
  user_inn := NEW.raw_user_meta_data->>'inn';
  
  -- Check if company with this INN already exists
  SELECT id INTO existing_company_id
  FROM public.companies
  WHERE inn = user_inn
  LIMIT 1;

  IF existing_company_id IS NOT NULL THEN
    -- Company exists, assign user role
    new_company_id := existing_company_id;
    user_role := 'user';
  ELSE
    -- Company doesn't exist, create new company and assign admin role
    INSERT INTO public.companies (name, inn)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Моя компания'),
      user_inn
    )
    RETURNING id INTO new_company_id;
    user_role := 'admin';
  END IF;

  -- Create profile linked to the company and store INN
  INSERT INTO public.profiles (id, company_id, first_name, last_name, email, inn)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    user_inn
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;