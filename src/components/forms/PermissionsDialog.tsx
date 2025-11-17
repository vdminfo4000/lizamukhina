import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuditLogsDialog } from "./AuditLogsDialog";

interface PermissionsDialogProps {
  userId: string;
  userName: string;
  userRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange?: () => void;
}

const MODULES = [
  { id: "dashboard", name: "Панель управления" },
  { id: "registry", name: "Реестр активов" },
  { id: "monitoring", name: "Мониторинг" },
  { id: "analytics", name: "Аналитика" },
  { id: "insurance", name: "Страхование" },
  { id: "exchange", name: "Биржа" },
];

const ACCESS_LEVELS = [
  { value: "closed", label: "Закрыто" },
  { value: "view", label: "Просмотр" },
  { value: "edit", label: "Редактирование" },
];

export function PermissionsDialog({ userId, userName, userRole, open, onOpenChange, onRoleChange }: PermissionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [currentRole, setCurrentRole] = useState(userRole);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPermissions();
      setCurrentRole(userRole);
    }
  }, [open, userId, userRole]);

  const loadPermissions = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('user_permissions')
      .select('module, access_level')
      .eq('user_id', userId);

    const permissionsMap: Record<string, string> = {};
    
    // Default all modules to 'edit' (full access)
    MODULES.forEach(module => {
      permissionsMap[module.id] = 'edit';
    });

    // Override with actual permissions
    if (data) {
      data.forEach(perm => {
        permissionsMap[perm.module] = perm.access_level;
      });
    }

    setPermissions(permissionsMap);
    setLoading(false);
  };

  const handleAccessLevelChange = async (moduleId: string, accessLevel: string) => {
    setPermissions(prev => ({ ...prev, [moduleId]: accessLevel }));

    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        module: moduleId,
        access_level: accessLevel as 'closed' | 'view' | 'edit',
      }, {
        onConflict: 'user_id,module'
      });

    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      // Revert on error
      loadPermissions();
    } else {
      toast({
        title: "Успешно",
        description: "Разрешения обновлены",
      });
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setCurrentRole(newRole);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole as 'admin' | 'user' })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      setCurrentRole(userRole);
    } else {
      toast({
        title: "Успешно",
        description: "Роль обновлена",
      });
      onRoleChange?.();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Разрешения доступа</DialogTitle>
                <DialogDescription>
                  Управление доступом к модулям для {userName}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuditLogs(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Журнал
              </Button>
            </div>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={currentRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="user">Пользователь</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Module Permissions */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Доступ к модулям</Label>
                <div className="space-y-3">
                  {MODULES.map((module) => (
                    <div key={module.id} className="flex items-center justify-between">
                      <Label htmlFor={module.id} className="cursor-pointer flex-1">
                        {module.name}
                      </Label>
                      <Select
                        value={permissions[module.id] ?? 'edit'}
                        onValueChange={(value) => handleAccessLevelChange(module.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCESS_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuditLogsDialog
        userId={userId}
        userName={userName}
        open={showAuditLogs}
        onOpenChange={setShowAuditLogs}
      />
    </>
  );
}
