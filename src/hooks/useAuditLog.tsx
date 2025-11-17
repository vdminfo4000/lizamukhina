import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LogActionParams {
  action: 'create' | 'update' | 'delete';
  module: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = async ({ action, module, entityType, entityId, details }: LogActionParams) => {
    if (!user) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action,
        module,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  return { logAction };
};
