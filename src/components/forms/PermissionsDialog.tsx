import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PermissionsDialogProps {
  userId: string;
  userName: string;
}

const MODULES = [
  { id: "dashboard", name: "Панель управления" },
  { id: "registry", name: "Реестр активов" },
  { id: "monitoring", name: "Мониторинг" },
  { id: "analytics", name: "Аналитика" },
  { id: "insurance", name: "Страхование" },
  { id: "exchange", name: "Биржа" },
];

export function PermissionsDialog({ userId, userName }: PermissionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPermissions();
    }
  }, [open, userId]);

  const loadPermissions = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('user_permissions')
      .select('module, can_access')
      .eq('user_id', userId);

    const permissionsMap: Record<string, boolean> = {};
    
    // Default all modules to true (allowed)
    MODULES.forEach(module => {
      permissionsMap[module.id] = true;
    });

    // Override with actual permissions
    if (data) {
      data.forEach(perm => {
        permissionsMap[perm.module] = perm.can_access;
      });
    }

    setPermissions(permissionsMap);
    setLoading(false);
  };

  const handleTogglePermission = async (moduleId: string, canAccess: boolean) => {
    setPermissions(prev => ({ ...prev, [moduleId]: canAccess }));

    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        module: moduleId,
        can_access: canAccess,
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
      setPermissions(prev => ({ ...prev, [moduleId]: !canAccess }));
    } else {
      toast({
        title: "Успешно",
        description: "Разрешения обновлены",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="mr-2 h-4 w-4" />
          Разрешения
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Разрешения доступа</DialogTitle>
          <DialogDescription>
            Управление доступом к модулям для {userName}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {MODULES.map((module) => (
              <div key={module.id} className="flex items-center justify-between">
                <Label htmlFor={module.id} className="cursor-pointer">
                  {module.name}
                </Label>
                <Switch
                  id={module.id}
                  checked={permissions[module.id] ?? true}
                  onCheckedChange={(checked) => handleTogglePermission(module.id, checked)}
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
