import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
}

export function ReportSettingsDialog({ open, onOpenChange, reportName }: ReportSettingsDialogProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: `Настройки отчета "${reportName}" обновлены`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Настройки отчета: {reportName}</DialogTitle>
          <DialogDescription>
            Загрузите шаблон и настройте поля для заполнения
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Шаблон отчета</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Перетащите файл сюда или нажмите для выбора
              </p>
              <Button variant="outline" size="sm">
                Выбрать файл
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Поля для заполнения</Label>
            <div className="mt-2 space-y-2">
              <Input placeholder="Название поля 1" />
              <Input placeholder="Название поля 2" />
              <Button variant="outline" size="sm" className="w-full">
                + Добавить поле
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить настройки</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
