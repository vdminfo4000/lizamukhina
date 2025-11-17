
-- Fix RLS policy to avoid recursion by using has_role() function
DROP POLICY IF EXISTS "profiles_view_same_inn_admins" ON public.profiles;

CREATE POLICY "profiles_view_same_inn_admins"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see profiles with the same INN as their company
  inn IN (
    SELECT c.inn 
    FROM public.companies c
    WHERE c.id = public.get_user_company_id(auth.uid())
  )
  AND
  -- Only if the current user is an admin (using security definer function)
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Also ensure admins can update profiles in their company
DROP POLICY IF EXISTS "profiles_update_company_admin" ON public.profiles;

CREATE POLICY "profiles_update_company_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
