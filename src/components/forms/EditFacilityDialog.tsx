import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { YandexMapDialog } from './YandexMapDialog';

interface EditFacilityDialogProps {
  facility: {
    id: string;
    name: string;
    type: string;
    capacity: string | null;
    address: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditFacilityDialog({ facility, open, onOpenChange, onSuccess }: EditFacilityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: facility.name,
    type: facility.type,
    capacity: facility.capacity || "",
    address: facility.address || "",
    location_lat: "",
    location_lng: ""
  });

  const handleCoordinatesSelect = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      location_lat: lat.toString(),
      location_lng: lng.toString(),
      address: address || prev.address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("facilities")
      .update({
        name: formData.name,
        type: formData.type,
        capacity: formData.capacity || null,
        address: formData.address || null,
      })
      .eq("id", facility.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить объект",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Объект обновлен",
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать объект</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Тип</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="capacity">Вместимость</Label>
            <Input
              id="capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Адрес</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapDialog(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Карта
              </Button>
            </div>
          </div>

          <YandexMapDialog
            open={showMapDialog}
            onOpenChange={setShowMapDialog}
            onCoordinatesSelect={handleCoordinatesSelect}
            initialLat={formData.location_lat}
            initialLng={formData.location_lng}
          />
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