import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin } from 'lucide-react';
import { YandexMapDialog } from './YandexMapDialog';

interface AddFacilityDialogProps {
  companyId: string;
  onSuccess: () => void;
}

export function AddFacilityDialog({ companyId, onSuccess }: AddFacilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    address: '',
    location_lat: '',
    location_lng: ''
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

    const { error } = await supabase.from('facilities').insert({
      company_id: companyId,
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      address: formData.address,
      location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
      location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
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
        description: 'Объект добавлен',
      });
      setFormData({
        name: '',
        type: '',
        capacity: '',
        address: '',
        location_lat: '',
        location_lng: ''
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
          Добавить объект
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить объект</DialogTitle>
          <DialogDescription>
            Введите данные об объекте (склад, ангар и т.д.)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              placeholder="Склад №1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип *</Label>
            <Input
              id="type"
              placeholder="Склад"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Вместимость</Label>
            <Input
              id="capacity"
              placeholder="500 т"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              placeholder="ул. Центральная, д. 1"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_lat">Широта</Label>
              <Input
                id="location_lat"
                type="number"
                step="any"
                placeholder="55.7558"
                value={formData.location_lat}
                onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_lng">Долгота</Label>
              <Input
                id="location_lng"
                type="number"
                step="any"
                placeholder="37.6173"
                value={formData.location_lng}
                onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMapDialog(true)}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Выбрать на карте
          </Button>

          <YandexMapDialog
            open={showMapDialog}
            onOpenChange={setShowMapDialog}
            onCoordinatesSelect={handleCoordinatesSelect}
            initialLat={formData.location_lat}
            initialLng={formData.location_lng}
          />

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
