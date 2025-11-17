-- Ensure proper RLS policies for profiles table to allow admins to see company employees
DROP POLICY IF EXISTS "profile_view_company" ON public.profiles;

CREATE POLICY "profile_view_company"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR id = auth.uid()
);

-- Ensure admins can see users with same INN (for adding employees)
DROP POLICY IF EXISTS "profiles_view_same_inn_admins" ON public.profiles;

CREATE POLICY "profiles_view_same_inn_admins"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  inn IN (
    SELECT c.inn
    FROM public.companies c
    WHERE c.id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure user_roles are visible to company admins
DROP POLICY IF EXISTS "role_view_company" ON public.user_roles;

CREATE POLICY "role_view_company"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR user_id = auth.uid()
);