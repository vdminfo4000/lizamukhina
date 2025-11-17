-- Fix infinite recursion in RLS policies by simplifying them
-- The issue: policies were calling SECURITY DEFINER functions that read from tables
-- with policies that call those same functions, creating infinite recursion

-- =====================================================
-- STEP 1: Drop all existing problematic RLS policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles with same INN" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view company user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can view company user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can insert user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can update user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can delete user permissions" ON public.user_permissions;

-- =====================================================
-- STEP 2: Create simplified RLS policies for profiles
-- =====================================================

-- Anyone can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Anyone can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can view profiles in their company (using direct join, no function calls)
CREATE POLICY "Admins view company profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT p.company_id 
    FROM public.profiles p
    WHERE p.id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can update profiles in their company
CREATE POLICY "Admins update company profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT p.company_id 
    FROM public.profiles p
    WHERE p.id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- =====================================================
-- STEP 3: Create simplified RLS policies for user_roles
-- =====================================================

-- Anyone can view their own roles
CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view roles of users in their company
CREATE POLICY "Admins view company roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can insert roles for users in their company
CREATE POLICY "Admins insert company roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can update roles for users in their company
CREATE POLICY "Admins update company roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can delete roles for users in their company
CREATE POLICY "Admins delete company roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- =====================================================
-- STEP 4: Create simplified RLS policies for user_permissions
-- =====================================================

-- Anyone can view their own permissions
CREATE POLICY "Users view own permissions"
ON public.user_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view permissions of users in their company
CREATE POLICY "Admins view company permissions"
ON public.user_permissions FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can insert permissions for users in their company
CREATE POLICY "Admins insert company permissions"
ON public.user_permissions FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can update permissions for users in their company
CREATE POLICY "Admins update company permissions"
ON public.user_permissions FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Admins can delete permissions for users in their company
CREATE POLICY "Admins delete company permissions"
ON public.user_permissions FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    WHERE p.company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);