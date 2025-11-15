import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface AddPlotDialogProps {
  companyId: string;
  onSuccess: () => void;
}

export function AddPlotDialog({ companyId, onSuccess }: AddPlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cadastral_number: '',
    area: '',
    crop: '',
    location_lat: '',
    location_lng: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('plots').insert({
      company_id: companyId,
      cadastral_number: formData.cadastral_number,
      area: parseFloat(formData.area),
      crop: formData.crop,
      location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
      location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
      address: formData.address,
    });

    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Успешно',
        description: 'Участок добавлен',
      });
      setFormData({
        cadastral_number: '',
        area: '',
        crop: '',
        location_lat: '',
        location_lng: '',
        address: '',
      });
      setOpen(false);
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить участок
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить земельный участок</DialogTitle>
          <DialogDescription>
            Введите данные о земельном участке
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cadastral_number">Кадастровый номер *</Label>
              <Input
                id="cadastral_number"
                placeholder="00:00:000000:00"
                value={formData.cadastral_number}
                onChange={(e) => setFormData({ ...formData, cadastral_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Площадь (га) *</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="100.50"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Культура</Label>
            <Input
              id="crop"
              placeholder="Пшеница озимая"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_lat">Широта</Label>
              <Input
                id="location_lat"
                type="number"
                step="0.000001"
                placeholder="55.751244"
                value={formData.location_lat}
                onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_lng">Долгота</Label>
              <Input
                id="location_lng"
                type="number"
                step="0.000001"
                placeholder="37.618423"
                value={formData.location_lng}
                onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес участка</Label>
            <Input
              id="address"
              placeholder="Московская область, г. Москва"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
