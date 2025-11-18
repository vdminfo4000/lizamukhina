import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Thermometer, Wind, Sun, Activity, Wifi, WifiOff } from "lucide-react";
import { useDragScroll } from "@/hooks/useDragScroll";

interface SensorZoneProps {
  zoneName: string;
  sensors: any[];
}

export const SensorZone = ({ zoneName, sensors }: SensorZoneProps) => {
  const scrollRef = useDragScroll();

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{zoneName}</h4>
      <div ref={scrollRef} className="flex flex-nowrap gap-2 overflow-x-auto hide-scrollbar pb-2 w-full min-w-0">
        {sensors.map((sensor: any) => {
          const hasData = sensor.last_reading && typeof sensor.last_reading === 'object' && 'value' in sensor.last_reading;
          const sensorValue = hasData ? sensor.last_reading.value : null;
          const isOffline = !hasData || sensor.status !== 'active';
          
          const getSensorIcon = () => {
            switch (sensor.sensor_type) {
              case 'moisture': return Droplets;
              case 'temperature': case 'air_temperature': return Thermometer;
              case 'wind': return Wind;
              case 'light': return Sun;
              default: return Activity;
            }
          };
          
          const SensorIcon = getSensorIcon();
          
          return (
            <Card 
              key={sensor.id} 
              className={`flex-shrink-0 w-28 border widget-3d ${isOffline ? 'bg-destructive/10 border-destructive' : 'border-border'}`}
            >
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <SensorIcon className={`h-3 w-3 ${isOffline ? 'text-destructive' : 'text-primary'}`} />
                  {isOffline ? (
                    <WifiOff className="h-3 w-3 text-destructive" />
                  ) : (
                    <Wifi className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground truncate mb-0.5">{sensor.name}</p>
                <p className="text-sm font-bold">{sensorValue !== null ? sensorValue : '—'}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
