import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditPlotDialogProps {
  plot: {
    id: string;
    cadastral_number: string;
    area: number;
    crop: string | null;
    address: string | null;
    location_lat: number | null;
    location_lng: number | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPlotDialog({ plot, open, onOpenChange, onSuccess }: EditPlotDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cadastral_number: plot.cadastral_number,
    area: plot.area.toString(),
    crop: plot.crop || "",
    location_lat: plot.location_lat?.toString() || "",
    location_lng: plot.location_lng?.toString() || "",
    address: plot.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("plots")
      .update({
        cadastral_number: formData.cadastral_number,
        area: parseFloat(formData.area),
        crop: formData.crop || null,
        location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
        location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
        address: formData.address || null,
      })
      .eq("id", plot.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить участок",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Участок обновлен",
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать участок</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cadastral_number">Кадастровый номер</Label>
            <Input
              id="cadastral_number"
              value={formData.cadastral_number}
              onChange={(e) => setFormData({ ...formData, cadastral_number: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="area">Площадь (га)</Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="crop">Культура</Label>
            <Input
              id="crop"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_lat">Широта</Label>
              <Input
                id="location_lat"
                type="number"
                step="0.000001"
                value={formData.location_lat}
                onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location_lng">Долгота</Label>
              <Input
                id="location_lng"
                type="number"
                step="0.000001"
                value={formData.location_lng}
                onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}