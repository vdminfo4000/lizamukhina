-- Update handle_new_user trigger to check INN and assign roles accordingly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_company_id UUID;
  new_company_id UUID;
  user_role app_role;
BEGIN
  -- Check if company with this INN already exists
  SELECT id INTO existing_company_id
  FROM public.companies
  WHERE inn = NEW.raw_user_meta_data->>'inn'
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
      NEW.raw_user_meta_data->>'inn'
    )
    RETURNING id INTO new_company_id;
    user_role := 'admin';
  END IF;

  -- Create profile linked to the company
  INSERT INTO public.profiles (id, company_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$function$;

-- Set admin role for Vdminfo@mail.ru
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'Vdminfo@mail.ru' LIMIT 1
);