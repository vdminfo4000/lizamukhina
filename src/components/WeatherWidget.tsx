import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, CalendarDays, Sprout } from "lucide-react";

interface WeatherWidgetProps {
  plotName: string;
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  }>;
}

export function WeatherWidget({ 
  plotName, 
  currentTemp, 
  currentCondition, 
  humidity,
  windSpeed,
  windDirection,
  forecast 
}: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("Дождь") || condition.includes("дождь") || condition.includes("Ливень")) return <CloudRain className="h-4 w-4" />;
    if (condition.includes("Облачно") || condition.includes("облачно") || condition.includes("Пасмурно")) return <Cloud className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
    <Card className="flex-shrink-0 w-80 bg-gradient-to-br from-background to-muted/20 select-none pointer-events-auto">
      <CardContent className="p-2 pointer-events-none">
        {/* Header */}
        <div className="flex items-center gap-2 pb-1 border-b border-border/50 mb-2">
          <Sprout className="h-3 w-3 text-primary" />
          <p className="text-xs font-semibold text-foreground truncate">{plotName}</p>
        </div>

        <div className="flex gap-2">
          {/* Current Weather */}
          <div className="flex-1 bg-card/50 rounded-md p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {currentTemp}°C
                </span>
              </div>
              {getWeatherIcon(currentCondition)}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mb-1">{currentCondition}</p>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-medium">Влажность: {humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] font-medium">Ветер: {windSpeed} м/с {windDirection}</span>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-0.5 mb-1">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              <h4 className="text-[10px] font-semibold text-muted-foreground">Прогноз</h4>
            </div>
            <div className="space-y-0.5">
              {forecast.slice(0, 3).map((day, idx) => (
                <div key={idx} className="bg-card/30 rounded-sm px-1.5 py-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-muted-foreground font-medium">{day.day}</span>
                    <span className="text-[10px] font-bold">{day.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Droplets className="h-2.5 w-2.5 text-blue-500" />
                      <span className="text-[9px]">{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Wind className="h-2.5 w-2.5 text-slate-500" />
                      <span className="text-[9px]">{day.windSpeed} м/с</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
