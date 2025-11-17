-- Drop the old RLS policy that joins with companies table
DROP POLICY IF EXISTS "Admins can view profiles with same INN" ON public.profiles;

-- Create a simpler RLS policy using the new inn column on profiles
CREATE POLICY "Admins can view profiles with same INN"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can view their own profile
  id = auth.uid()
  OR
  -- Admins can view profiles with the same INN as their company
  (
    inn IS NOT NULL
    AND inn = (
      SELECT c.inn
      FROM public.profiles p
      JOIN public.companies c ON c.id = p.company_id
      WHERE p.id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
);