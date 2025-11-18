import { WeatherWidget } from "./WeatherWidget";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Skeleton } from "./ui/skeleton";

interface PlotWeatherWidgetProps {
  plotName?: string | null;
  cadastralNumber?: string;
  latitude: number | null;
  longitude: number | null;
}

export function PlotWeatherWidget({ plotName, cadastralNumber, latitude, longitude }: PlotWeatherWidgetProps) {
  const { weatherData, loading } = useWeatherData(latitude, longitude);

  const displayName = plotName || cadastralNumber || 'Участок';

  if (loading || !weatherData) {
    return (
      <div className="h-[200px] w-full min-w-[280px]">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <WeatherWidget
      plotName={displayName}
      currentTemp={weatherData.current.temp}
      currentCondition={weatherData.current.condition}
      humidity={weatherData.current.humidity}
      windSpeed={weatherData.current.windSpeed}
      windDirection={weatherData.current.windDirection}
      forecast={weatherData.forecast}
    />
  );
}
