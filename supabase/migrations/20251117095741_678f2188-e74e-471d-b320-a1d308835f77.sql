-- Allow admins to view profiles from companies with the same INN
-- This enables the "Add Employee" feature to show all users registered with the company's INN

CREATE POLICY "Admins can view profiles with same INN"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.companies c1
    JOIN public.profiles p ON p.id = auth.uid()
    JOIN public.companies c2 ON c2.id = p.company_id
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE c1.id = profiles.company_id
      AND c1.inn = c2.inn
      AND c1.inn IS NOT NULL
      AND c2.inn IS NOT NULL
      AND ur.role = 'admin'
  )
);