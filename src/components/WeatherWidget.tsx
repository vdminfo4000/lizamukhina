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
    if (condition.includes("Дождь") || condition.includes("дождь") || condition.includes("Ливень")) return <CloudRain className="h-3 w-3" />;
    if (condition.includes("Облачно") || condition.includes("облачно") || condition.includes("Пасмурно")) return <Cloud className="h-3 w-3" />;
    return <Sun className="h-3 w-3" />;
  };

  return (
    <Card className="flex-shrink-0 w-36 bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-2">
        <div className="space-y-1.5">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-1 border-b border-border/50">
            <Sprout className="h-3 w-3 text-primary" />
            <p className="text-[10px] font-semibold text-foreground truncate">{plotName}</p>
          </div>

          {/* Current Weather */}
          <div className="bg-card/50 rounded-md p-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {currentTemp}°C
                </span>
              </div>
              {getWeatherIcon(currentCondition)}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate">{currentCondition}</p>
            
            {/* Additional Info */}
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-border/30">
              <div className="flex items-center gap-0.5">
                <Droplets className="h-2.5 w-2.5 text-blue-500" />
                <span className="text-[10px] font-medium">{humidity}%</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Wind className="h-2.5 w-2.5 text-slate-500" />
                <span className="text-[10px] font-medium">{windSpeed} м/с</span>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5 mb-0.5">
              <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
              <h4 className="text-[9px] font-semibold text-muted-foreground">Прогноз</h4>
            </div>
            <div className="space-y-0.5">
              {forecast.slice(0, 3).map((day, idx) => (
                <div key={idx} className="bg-card/30 rounded-sm px-1.5 py-1 flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground font-medium">{day.day}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold">{day.temp}°C</span>
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <Droplets className="h-2.5 w-2.5 text-blue-500" />
                      <span className="text-[9px]">{day.humidity}%</span>
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
