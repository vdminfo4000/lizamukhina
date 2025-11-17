
-- FINAL FIX: Drop ALL policies and recreate with ZERO recursion
-- Problem: Old policies with subqueries to profiles table were not dropped
-- Solution: Drop everything and use only direct auth.uid() checks

-- =====================================================
-- STEP 1: Drop EVERY SINGLE policy on these tables
-- =====================================================

-- Profiles - drop all possible policy names
DROP POLICY IF EXISTS "profiles_own_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_company_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update company profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_company_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_company_admin" ON public.profiles;

-- User Roles - drop all possible policy names  
DROP POLICY IF EXISTS "user_roles_own_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_company_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_modify" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins view company roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins insert company roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins update company roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete company roles" ON public.user_roles;

-- User Permissions - drop all possible policy names
DROP POLICY IF EXISTS "user_permissions_own_select" ON public.user_permissions;
DROP POLICY IF EXISTS "user_permissions_company_select" ON public.user_permissions;
DROP POLICY IF EXISTS "user_permissions_modify" ON public.user_permissions;
DROP POLICY IF EXISTS "Users view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins view company permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins insert company permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins update company permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins delete company permissions" ON public.user_permissions;

-- =====================================================
-- STEP 2: Create a helper table to store user's company_id
-- This breaks the recursion by caching the company_id
-- =====================================================

-- Add company_id cache to user_roles to avoid profiles lookup
-- (This column may already exist, so we use IF NOT EXISTS pattern)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN company_id UUID;
  END IF;
END $$;

-- Update existing rows to populate company_id
UPDATE public.user_roles ur
SET company_id = p.company_id
FROM public.profiles p
WHERE ur.user_id = p.id
AND ur.company_id IS NULL;

-- =====================================================
-- STEP 3: Update SECURITY DEFINER functions to use simpler logic
-- =====================================================

-- Recreate get_user_company_id to be bulletproof
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Direct query bypassing RLS completely
  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$;

-- Recreate has_role to be bulletproof
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_has_role BOOLEAN;
BEGIN
  -- Direct query bypassing RLS completely
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO v_has_role;
  
  RETURN v_has_role;
END;
$$;

-- =====================================================
-- STEP 4: Create SIMPLE policies with NO subqueries to same table
-- =====================================================

-- Profiles: Super simple - only direct checks
CREATE POLICY "profile_view_own"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profile_edit_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- User Roles: Super simple - only direct checks
CREATE POLICY "role_view_own"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "role_manage_own"
ON public.user_roles FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User Permissions: Super simple - only direct checks  
CREATE POLICY "perm_view_own"
ON public.user_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "perm_manage_own"
ON public.user_permissions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- STEP 5: Add company-level access using SECURITY DEFINER
-- These are SAFE because functions use search_path = ''
-- =====================================================

-- Profiles: View others in same company
CREATE POLICY "profile_view_company"
ON public.profiles FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR id = auth.uid()
);

-- User Roles: View/manage roles in same company
CREATE POLICY "role_view_company"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "role_manage_company"
ON public.user_roles FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- User Permissions: Manage permissions in same company
CREATE POLICY "perm_manage_company"
ON public.user_permissions FOR ALL
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  OR user_id = auth.uid()
)
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  OR user_id = auth.uid()
);

-- =====================================================
-- STEP 6: Create trigger to keep user_roles.company_id in sync
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_user_role_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When inserting or updating user_roles, automatically set company_id
  NEW.company_id := (SELECT company_id FROM public.profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_company_id_trigger ON public.user_roles;
CREATE TRIGGER sync_company_id_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_company_id();