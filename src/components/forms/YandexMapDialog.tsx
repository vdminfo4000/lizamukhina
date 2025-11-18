import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface YandexMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCoordinatesSelect: (lat: number, lng: number) => void;
  initialLat?: string;
  initialLng?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function YandexMapDialog({ 
  open, 
  onOpenChange, 
  onCoordinatesSelect,
  initialLat = '55.751244',
  initialLng = '37.618423'
}: YandexMapDialogProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemark, setPlacemark] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadYandexMaps = () => {
      if (window.ymaps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || map) return;

      const lat = parseFloat(initialLat) || 55.751244;
      const lng = parseFloat(initialLng) || 37.618423;

      const newMap = new window.ymaps.Map(mapContainer.current, {
        center: [lat, lng],
        zoom: 10,
        controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
      });

      const newPlacemark = new window.ymaps.Placemark([lat, lng], {}, {
        preset: 'islands#redDotIcon',
        draggable: true
      });

      newMap.geoObjects.add(newPlacemark);

      newPlacemark.events.add('dragend', function () {
        const coords = newPlacemark.geometry.getCoordinates();
        setSelectedCoords(coords);
      });

      newMap.events.add('click', function (e: any) {
        const coords = e.get('coords');
        newPlacemark.geometry.setCoordinates(coords);
        setSelectedCoords(coords);
      });

      setMap(newMap);
      setPlacemark(newPlacemark);
      setSelectedCoords([lat, lng]);
    };

    loadYandexMaps();

    return () => {
      if (map) {
        map.destroy();
        setMap(null);
        setPlacemark(null);
      }
    };
  }, [open]);

  const handleConfirm = () => {
    if (selectedCoords) {
      onCoordinatesSelect(selectedCoords[0], selectedCoords[1]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Выберите местоположение на карте</DialogTitle>
          <DialogDescription>
            Нажмите на карту или перетащите маркер для выбора координат
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div 
            ref={mapContainer} 
            className="w-full h-[500px] rounded-lg border border-border"
          />
          {selectedCoords && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                Широта: {selectedCoords[0].toFixed(6)}, Долгота: {selectedCoords[1].toFixed(6)}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedCoords}>
              Выбрать координаты
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
