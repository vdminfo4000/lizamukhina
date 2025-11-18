import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Thermometer, Sun, Droplets, Wind } from "lucide-react";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Skeleton } from "./ui/skeleton";

interface PlotWeatherDetailProps {
  plotName: string;
  cadastralNumber: string;
  latitude: number | null;
  longitude: number | null;
}

export function PlotWeatherDetail({ 
  plotName, 
  cadastralNumber, 
  latitude, 
  longitude 
}: PlotWeatherDetailProps) {
  const { weatherData, loading } = useWeatherData(latitude, longitude);

  if (loading || !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cadastralNumber} - {plotName}</CardTitle>
          <CardDescription>Погодные условия для участка</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cadastralNumber} - {plotName}</CardTitle>
        <CardDescription>Погодные условия для участка</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-3">Текущая погода</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Thermometer className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Температура</p>
                  <p className="text-xl font-bold">{weatherData.current.temp}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Sun className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Условия</p>
                  <p className="text-lg font-semibold">{weatherData.current.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Droplets className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Влажность</p>
                  <p className="text-lg font-semibold">{weatherData.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Wind className="h-6 w-6 text-cyan-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ветер</p>
                  <p className="text-lg font-semibold">
                    {weatherData.current.windSpeed} м/с {weatherData.current.windDirection}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Прогноз на 3 дня</h4>
            <div className="space-y-2">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{day.day}</span>
                    <span className="font-bold text-lg">{day.temp}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{day.condition}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        <span>{day.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        <span>{day.windSpeed} м/с</span>
                      </div>
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
