import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AccessLevel = 'closed' | 'view' | 'edit';

interface ModuleAccess {
  level: AccessLevel;
  canView: boolean;
  canEdit: boolean;
  loading: boolean;
}

export const useModuleAccess = (moduleName: string): ModuleAccess => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('edit');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Admins have full access to all modules
      if (roleData?.role === 'admin') {
        setAccessLevel('edit');
        setLoading(false);
        return;
      }

      // For non-admins, check their permissions
      const { data: permissionData } = await supabase
        .from('user_permissions')
        .select('access_level')
        .eq('user_id', user.id)
        .eq('module', moduleName)
        .single();

      if (permissionData) {
        setAccessLevel(permissionData.access_level as AccessLevel);
      } else {
        // Default to edit if no permission set
        setAccessLevel('edit');
      }

      setLoading(false);
    };

    loadPermissions();
  }, [user, moduleName]);

  return {
    level: accessLevel,
    canView: accessLevel === 'view' || accessLevel === 'edit',
    canEdit: accessLevel === 'edit',
    loading,
  };
};
