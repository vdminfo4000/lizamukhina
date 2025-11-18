import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";

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
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">{plotName}</p>
              <div className="flex items-center gap-2 mt-1">
                {getWeatherIcon(currentCondition)}
                <span className="text-2xl font-bold">{currentTemp}°C</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentCondition}</p>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span>{humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>{windSpeed} м/с {windDirection || ''}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            {forecast.slice(0, 3).map((day, idx) => (
              <div key={idx} className="text-center space-y-1">
                <p className="text-xs font-medium">{day.day}</p>
                <div className="flex justify-center">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-semibold">{day.temp}°C</p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <Droplets className="h-2.5 w-2.5" />
                    <span>{day.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Wind className="h-2.5 w-2.5" />
                    <span>{day.windSpeed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
