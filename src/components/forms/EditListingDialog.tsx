import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditListingDialogProps {
  listing: {
    id: string;
    crop: string;
    quantity: number;
    unit: string;
    price: number;
    harvest_year: number | null;
    quality: string | null;
    location: string | null;
    additional_info: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditListingDialog({ listing, open, onOpenChange, onSuccess }: EditListingDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    crop: listing.crop,
    quantity: listing.quantity.toString(),
    unit: listing.unit,
    price: listing.price.toString(),
    harvest_year: listing.harvest_year?.toString() || "",
    quality: listing.quality || "",
    location: listing.location || "",
    additional_info: listing.additional_info || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("market_listings")
      .update({
        crop: formData.crop,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        harvest_year: formData.harvest_year ? parseInt(formData.harvest_year) : null,
        quality: formData.quality || null,
        location: formData.location || null,
        additional_info: formData.additional_info || null,
      })
      .eq("id", listing.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить объявление",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Объявление обновлено",
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать объявление</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crop">Культура</Label>
              <Input
                id="crop"
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Единица измерения</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Цена за единицу (₽)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="harvest_year">Год урожая</Label>
              <Input
                id="harvest_year"
                type="number"
                value={formData.harvest_year}
                onChange={(e) => setFormData({ ...formData, harvest_year: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="quality">Качество</Label>
              <Input
                id="quality"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="additional_info">Дополнительная информация</Label>
            <Textarea
              id="additional_info"
              value={formData.additional_info}
              onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
              rows={4}
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
