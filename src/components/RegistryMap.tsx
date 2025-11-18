import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Plot {
  id: string;
  name?: string | null;
  cadastral_number: string;
  area: number;
  crop: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
}

interface RegistryMapProps {
  plots: Plot[];
  equipment: Equipment[];
  facilities: Facility[];
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function RegistryMap({ plots, equipment, facilities }: RegistryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [clusterer, setClusterer] = useState<any>(null);

  const crops = ["all", ...Array.from(new Set(plots.map(p => p.crop).filter(Boolean))) as string[]];

  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps) {
        window.ymaps.ready(initMap);
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

      const newMap = new window.ymaps.Map(mapContainer.current, {
        center: [55.751244, 37.618423],
        zoom: 10,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      const newClusterer = new window.ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: false,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
      });

      newMap.geoObjects.add(newClusterer);
      setMap(newMap);
      setClusterer(newClusterer);
    };

    loadYandexMaps();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!map || !clusterer || !window.ymaps) return;

    clusterer.removeAll();
    const placemarks: any[] = [];

    const filteredPlots = selectedCrop === "all" 
      ? plots.filter(p => p.location_lat && p.location_lng)
      : plots.filter(p => p.crop === selectedCrop && p.location_lat && p.location_lng);

    filteredPlots.forEach((plot) => {
      const displayName = plot.name || plot.cadastral_number;
      const placemark = new window.ymaps.Placemark(
        [plot.location_lat, plot.location_lng],
        {
          balloonContentHeader: `<strong>${displayName}</strong>`,
          balloonContentBody: `
            <div style="padding: 8px;">
              <p><strong>Кадастровый номер:</strong> ${plot.cadastral_number}</p>
              <p><strong>Площадь:</strong> ${plot.area} га</p>
              <p><strong>Культура:</strong> ${plot.crop || 'Не указана'}</p>
              <p><strong>Адрес:</strong> ${plot.address || 'Не указан'}</p>
              <p><strong>Статус:</strong> ${plot.status || 'Активен'}</p>
            </div>
          `,
          hintContent: displayName
        },
        {
          preset: 'islands#greenCircleDotIcon'
        }
      );
      placemarks.push(placemark);
    });

    // Add facilities
    facilities.forEach((facility) => {
      if (facility.location_lat && facility.location_lng) {
        const placemark = new window.ymaps.Placemark(
          [facility.location_lat, facility.location_lng],
          {
            balloonContentHeader: `<strong>${facility.name}</strong>`,
            balloonContentBody: `
              <div style="padding: 8px;">
                <p><strong>Тип:</strong> ${facility.type}</p>
                <p><strong>Адрес:</strong> ${facility.address || 'Не указан'}</p>
                <p><strong>Статус:</strong> ${facility.status || 'Активен'}</p>
              </div>
            `,
            hintContent: facility.name
          },
          {
            preset: 'islands#blueWarehouseIcon'
          }
        );
        placemarks.push(placemark);
      }
    });

    if (placemarks.length > 0) {
      clusterer.add(placemarks);
      const bounds = clusterer.getBounds();
      if (bounds) {
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
      }
    }
  }, [map, clusterer, plots, facilities, selectedCrop]);

  return (
    <Card className="mb-6">
      <div className="p-4 flex items-center gap-4 border-b">
        <h3 className="text-lg font-semibold">Карта активов</h3>
        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все культуры" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все культуры</SelectItem>
            {crops.filter(c => c !== "all").map((crop) => (
              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div 
        ref={mapContainer} 
        className="w-full"
        style={{ height: '40vh' }}
      />
    </Card>
  );
}
