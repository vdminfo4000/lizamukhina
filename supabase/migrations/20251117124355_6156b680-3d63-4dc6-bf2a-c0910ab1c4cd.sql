-- Create security definer function to get user INN
CREATE OR REPLACE FUNCTION public.get_user_inn(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inn TEXT;
BEGIN
  -- Direct query bypassing RLS completely
  SELECT inn INTO v_inn
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
  
  RETURN v_inn;
END;
$$;

-- Drop the existing policy with recursion issue
DROP POLICY IF EXISTS "profiles_update_company_admin" ON public.profiles;

-- Create updated policy using security definer function
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
      AND inn = public.get_user_inn(auth.uid())
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