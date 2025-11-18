import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    console.log('Fetching weather for coordinates:', { latitude, longitude });

    // Use Open-Meteo free API - no API key required
    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
    
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weather_code,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=3`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    console.log('Weather data fetched successfully');

    // Map WMO weather codes to conditions in Russian
    const getWeatherCondition = (code: number): string => {
      if (code === 0) return "Ясно";
      if (code <= 3) return "Облачно";
      if (code <= 48) return "Туман";
      if (code <= 67) return "Дождь";
      if (code <= 77) return "Снег";
      if (code <= 82) return "Ливень";
      if (code <= 86) return "Снегопад";
      if (code <= 99) return "Гроза";
      return "Переменная";
    };

    // Map wind direction from degrees to Russian cardinal directions
    const getWindDirection = (degrees: number): string => {
      if (degrees === null || degrees === undefined) return "—";
      const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    };

    const days = ["Сегодня", "Завтра", "Послезавтра"];

    const weatherData = {
      current: {
        temp: Math.round(currentData.current.temperature_2m),
        condition: getWeatherCondition(currentData.current.weather_code),
        humidity: currentData.current.relative_humidity_2m,
        windSpeed: currentData.current.wind_speed_10m,
        windDirection: getWindDirection(currentData.current.wind_direction_10m)
      },
      forecast: forecastData.daily.time.slice(0, 3).map((date: string, index: number) => ({
        day: days[index],
        temp: Math.round(forecastData.daily.temperature_2m_max[index]),
        condition: getWeatherCondition(forecastData.daily.weather_code[index]),
        humidity: Math.round(forecastData.daily.relative_humidity_2m_mean[index]),
        windSpeed: forecastData.daily.wind_speed_10m_max[index]
      }))
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching weather:', error);
    
    // Return mock data as fallback
    return new Response(JSON.stringify({
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
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
