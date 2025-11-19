import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (reportName: string) => void;
}

export function AddReportDialog({ open, onOpenChange, onAdd }: AddReportDialogProps) {
  const [reportName, setReportName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название отчета",
        variant: "destructive",
      });
      return;
    }

    onAdd(reportName);
    setReportName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить отчет</DialogTitle>
          <DialogDescription>
            Создайте новый тип отчета для заполнения сотрудниками
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reportName">Название отчета</Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Например: Отчет по посевным работам"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Добавить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
