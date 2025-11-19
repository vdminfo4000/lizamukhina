import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: "plots" | "equipment" | "facilities";
  onAdd: (plan: { name: string; description: string }) => void;
}

export function AddPlanDialog({ open, onOpenChange, planType, onAdd }: AddPlanDialogProps) {
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const getPlanTypeLabel = () => {
    switch (planType) {
      case "plots": return "участку";
      case "equipment": return "технике";
      case "facilities": return "объекту";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название плана",
        variant: "destructive",
      });
      return;
    }

    onAdd({ name: planName, description });
    setPlanName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить план по {getPlanTypeLabel()}</DialogTitle>
          <DialogDescription>
            Создайте новый план для планирования работ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="planName">Название плана</Label>
            <Input
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Например: План посева озимой пшеницы"
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительная информация о плане..."
              className="min-h-[100px]"
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
