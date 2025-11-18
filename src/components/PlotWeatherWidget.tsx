import { WeatherWidget } from "./WeatherWidget";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Skeleton } from "./ui/skeleton";

interface PlotWeatherWidgetProps {
  plotName: string;
  latitude: number | null;
  longitude: number | null;
}

export function PlotWeatherWidget({ plotName, latitude, longitude }: PlotWeatherWidgetProps) {
  const { weatherData, loading } = useWeatherData(latitude, longitude);

  if (loading || !weatherData) {
    return (
      <div className="h-[200px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <WeatherWidget
      plotName={plotName}
      currentTemp={weatherData.current.temp}
      currentCondition={weatherData.current.condition}
      humidity={weatherData.current.humidity}
      windSpeed={weatherData.current.windSpeed}
      windDirection={weatherData.current.windDirection}
      forecast={weatherData.forecast}
    />
  );
}
