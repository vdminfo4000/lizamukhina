-- Drop the existing policy
DROP POLICY IF EXISTS "profiles_update_company_admin" ON public.profiles;

-- Create updated policy that allows admin to add employees with same INN
CREATE POLICY "profiles_update_company_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Admin can update if:
  -- 1. Employee is currently in admin's company OR
  -- 2. Employee has same INN as admin and no company (company_id IS NULL)
  public.has_role(auth.uid(), 'admin'::app_role)
  AND (
    company_id = public.get_user_company_id(auth.uid())
    OR (
      company_id IS NULL
      AND inn = (SELECT inn FROM public.profiles WHERE id = auth.uid())
    )
  )
)
WITH CHECK (
  -- Can set to null (unbind) or to admin's company (bind)
  public.has_role(auth.uid(), 'admin'::app_role)
  AND (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
  )
);