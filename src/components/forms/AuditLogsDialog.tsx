import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_email: string | null;
  action: string;
  module: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
}

interface AuditLogsDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Создание",
  update: "Обновление",
  delete: "Удаление",
};

const MODULE_LABELS: Record<string, string> = {
  registry: "Реестр активов",
  monitoring: "Мониторинг",
  analytics: "Аналитика",
  insurance: "Страхование",
  exchange: "Биржа",
  employees: "Сотрудники",
};

export function AuditLogsDialog({ userId, userName, open, onOpenChange }: AuditLogsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, userId]);

  const loadLogs = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить журнал действий",
        variant: "destructive",
      });
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Журнал действий</DialogTitle>
          <DialogDescription>
            История действий пользователя {userName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Нет записей в журнале</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {MODULE_LABELS[log.module] || log.module}
                        </span>
                      </div>
                      {log.entity_type && (
                        <p className="text-sm text-muted-foreground">
                          Тип: {log.entity_type}
                        </p>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 rounded-md bg-muted p-2">
                          <p className="text-xs font-mono text-muted-foreground">
                            {JSON.stringify(log.details, null, 2)}
                          </p>
                        </div>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: ru })}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
