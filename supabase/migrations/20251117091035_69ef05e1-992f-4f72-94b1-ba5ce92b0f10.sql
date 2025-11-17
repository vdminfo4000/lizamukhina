-- Drop the old can_access column and add access_level
ALTER TABLE public.user_permissions DROP COLUMN can_access;

-- Add new access_level column with enum type
CREATE TYPE public.access_level AS ENUM ('closed', 'view', 'edit');

ALTER TABLE public.user_permissions 
ADD COLUMN access_level access_level NOT NULL DEFAULT 'edit';

-- Update the unique constraint to include module and user_id
ALTER TABLE public.user_permissions 
DROP CONSTRAINT IF EXISTS user_permissions_user_id_module_key;

ALTER TABLE public.user_permissions 
ADD CONSTRAINT user_permissions_user_id_module_key UNIQUE (user_id, module);