import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckSquare, Loader2 } from "lucide-react";

interface PlacementOption {
  id: string;
  label: string;
  description: string;
}

const PLACEMENT_OPTIONS: PlacementOption[] = [
  {
    id: "reports",
    label: "Отчеты",
    description: "Добавить в список отчетов",
  },
  {
    id: "documents",
    label: "Документы",
    description: "Добавить на страницу шаблонов документов",
  },
  {
    id: "planning_plots",
    label: "Планирование участков",
    description: "Добавить в планирование участков",
  },
  {
    id: "planning_equipment",
    label: "Планирование техники",
    description: "Добавить в планирование техники",
  },
  {
    id: "planning_facilities",
    label: "Планирование объектов",
    description: "Добавить в планирование объектов",
  },
];

interface TemplatePlacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  companyId: string;
  userId: string;
  onPlacementsChange?: () => void;
}

export function TemplatePlacementDialog({
  open,
  onOpenChange,
  templateId,
  templateName,
  companyId,
  userId,
  onPlacementsChange,
}: TemplatePlacementDialogProps) {
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [existingPlacements, setExistingPlacements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && templateId) {
      loadExistingPlacements();
    }
  }, [open, templateId]);

  const loadExistingPlacements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("template_placements")
        .select("placement_type")
        .eq("template_id", templateId);

      if (error) throw error;

      const placements = data?.map((p) => p.placement_type) || [];
      setExistingPlacements(placements);
      setSelectedPlacements(placements);
    } catch (error) {
      console.error("Error loading placements:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить места размещения",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlacement = (placementId: string) => {
    setSelectedPlacements((prev) =>
      prev.includes(placementId)
        ? prev.filter((id) => id !== placementId)
        : [...prev, placementId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Удаляем старые размещения
      const toRemove = existingPlacements.filter(
        (p) => !selectedPlacements.includes(p)
      );
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("template_placements")
          .delete()
          .eq("template_id", templateId)
          .in("placement_type", toRemove);

        if (deleteError) throw deleteError;
      }

      // Добавляем новые размещения
      const toAdd = selectedPlacements.filter(
        (p) => !existingPlacements.includes(p)
      );
      if (toAdd.length > 0) {
        const placements = toAdd.map((placement_type) => ({
          company_id: companyId,
          template_id: templateId,
          placement_type,
          created_by: userId,
        }));

        const { error: insertError } = await supabase
          .from("template_placements")
          .insert(placements);

        if (insertError) throw insertError;
      }

      toast({
        title: "Успешно",
        description: "Места размещения шаблона обновлены",
      });

      if (onPlacementsChange) {
        onPlacementsChange();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving placements:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить места размещения",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Место добавления шаблона</DialogTitle>
          <DialogDescription>
            Выберите, где будет доступен шаблон "{templateName}" для создания
            документов
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {PLACEMENT_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={option.id}
                    checked={selectedPlacements.includes(option.id)}
                    onCheckedChange={() => handleTogglePlacement(option.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  {selectedPlacements.includes(option.id) && (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Выбрано мест: {selectedPlacements.length}
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
