-- Fix RLS policy to allow admins to unbind employees from company
DROP POLICY IF EXISTS "profiles_update_company_admin" ON public.profiles;

CREATE POLICY "profiles_update_company_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Can update if employee is currently in admin's company
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  -- Can set to null (unbind) or to admin's company (bind)
  public.has_role(auth.uid(), 'admin'::app_role)
  AND (
    company_id IS NULL 
    OR company_id = public.get_user_company_id(auth.uid())
  )
);