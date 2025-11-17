-- Add owner role to existing users (assuming first user of company is owner)
-- This will mark the first user of each company as owner
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ON (company_id) id, 'admin'::app_role
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
ORDER BY company_id, created_at
ON CONFLICT (user_id, role) DO NOTHING;

-- Add RLS policy for companies table - only admins can view company details
CREATE POLICY "Admins can view their company details"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id = get_user_company_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Update existing company view policy to allow regular users to see basic info
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

CREATE POLICY "Users can view their own company basic info"
ON public.companies
FOR SELECT
TO authenticated
USING (id = get_user_company_id(auth.uid()));

-- Allow admins to update company
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;

CREATE POLICY "Admins can update their company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = get_user_company_id(auth.uid())
  AND has_role(auth.uid(), 'admin')
)
WITH CHECK (
  id = get_user_company_id(auth.uid())
  AND has_role(auth.uid(), 'admin')
);

-- Allow admins to view all profiles in their company
CREATE POLICY "Admins can view all company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  OR id = auth.uid()
);

-- Allow admins to update profiles in their company
CREATE POLICY "Admins can update company profiles"
ON public.profiles
FOR UPDATE  
TO authenticated
USING (
  (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  OR id = auth.uid()
);

-- Allow admins to manage user roles in their company
CREATE POLICY "Admins can view company user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
    AND p.company_id = get_user_company_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
    AND p.company_id = get_user_company_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
    AND p.company_id = get_user_company_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
    AND p.company_id = get_user_company_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
);