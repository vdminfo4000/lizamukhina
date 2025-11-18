import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

interface WeatherWidgetProps {
  plotName: string;
  currentTemp: number;
  currentCondition: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

export function WeatherWidget({ plotName, currentTemp, currentCondition, forecast }: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("Дождь") || condition.includes("дождь")) return <CloudRain className="h-5 w-5" />;
    if (condition.includes("Облачно") || condition.includes("облачно") || condition.includes("Пасмурно")) return <Cloud className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{plotName}</p>
              <div className="flex items-center gap-2 mt-1">
                {getWeatherIcon(currentCondition)}
                <span className="text-2xl font-bold">{currentTemp}°C</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentCondition}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            {forecast.slice(0, 3).map((day, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-medium">{day.day}</p>
                <div className="flex justify-center my-1">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-semibold">{day.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
