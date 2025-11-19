import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
}

export function ReportFormDialog({ open, onOpenChange, reportName }: ReportFormDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Отчет отправлен",
      description: `Отчет "${reportName}" успешно заполнен и отправлен`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{reportName}</DialogTitle>
          <DialogDescription>
            Заполните форму отчета
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reportContent">Содержание отчета</Label>
            <Textarea
              id="reportContent"
              placeholder="Введите данные для отчета..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Отправить отчет</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
