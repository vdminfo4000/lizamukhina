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
    if (condition.includes("Дождь") || condition.includes("дождь") || condition.includes("Ливень")) return <CloudRain className="h-5 w-5" />;
    if (condition.includes("Облачно") || condition.includes("облачно") || condition.includes("Пасмурно")) return <Cloud className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  return (
    <Card className="min-w-[280px] bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Sprout className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">{plotName}</p>
          </div>

          {/* Current Weather */}
          <div className="bg-card/50 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {currentTemp}°C
                </span>
              </div>
              {getWeatherIcon(currentCondition)}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{currentCondition}</p>
            
            {/* Additional Info */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium">{humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-slate-500" />
                <span className="text-xs font-medium">{windSpeed} м/с {windDirection || ''}</span>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              <h4 className="text-xs font-semibold text-muted-foreground">Прогноз на 3 дня</h4>
            </div>
            <div className="space-y-1">
              {forecast.slice(0, 3).map((day, idx) => (
                <div key={idx} className="bg-card/30 rounded-md px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{day.temp}°C</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-[11px]">{day.humidity}%</span>
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
