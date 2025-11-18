import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  }>;
}

export function useWeatherData(latitude: number | null, longitude: number | null) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: functionError } = await supabase.functions.invoke('weather-fetch', {
          body: { latitude, longitude }
        });

        if (functionError) throw functionError;
        
        setWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        
        // Fallback to mock data
        setWeatherData({
          current: {
            temp: 20,
            condition: "Облачно",
            humidity: 65,
            windSpeed: 3.5,
            windDirection: "СЗ"
          },
          forecast: [
            { day: "Сегодня", temp: 20, condition: "Облачно", humidity: 65, windSpeed: 3.5 },
            { day: "Завтра", temp: 22, condition: "Ясно", humidity: 60, windSpeed: 2.8 },
            { day: "Послезавтра", temp: 19, condition: "Дождь", humidity: 75, windSpeed: 5.2 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weatherData, loading, error };
}
