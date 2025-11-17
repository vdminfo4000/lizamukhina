-- Add RLS policy to allow admins to view profiles with the same INN
-- This enables the "Add Employee" feature to show users from the same INN

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
  -- Only if the current user is an admin
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);