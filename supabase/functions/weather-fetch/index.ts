import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Gismeteo API endpoint (требуется API ключ в переменных окружения)
    const gismeteoApiKey = Deno.env.get('GISMETEO_API_KEY');
    
    if (!gismeteoApiKey) {
      console.error('GISMETEO_API_KEY not configured');
      // Возвращаем моковые данные если нет API ключа
      return new Response(
        JSON.stringify({
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
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Запрос к Gismeteo API
    const response = await fetch(
      `https://api.gismeteo.net/v2/weather/current/?latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          'X-Gismeteo-Token': gismeteoApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Gismeteo API error: ${response.status}`);
    }

    const currentData = await response.json();

    // Запрос прогноза на 3 дня
    const forecastResponse = await fetch(
      `https://api.gismeteo.net/v2/weather/forecast/?latitude=${latitude}&longitude=${longitude}&days=3`,
      {
        headers: {
          'X-Gismeteo-Token': gismeteoApiKey,
          'Accept': 'application/json'
        }
      }
    );

    const forecastData = await forecastResponse.json();

    // Форматирование данных
    const formatCondition = (code: number) => {
      const conditions: Record<number, string> = {
        0: "Ясно",
        1: "Малооблачно",
        2: "Облачно",
        3: "Пасмурно",
        4: "Дождь",
        5: "Ливень",
        6: "Снег",
        7: "Гроза"
      };
      return conditions[code] || "Облачно";
    };

    const formatWindDirection = (degrees: number) => {
      const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    };

    const current = currentData.response;
    const forecast = forecastData.response;

    const weatherData = {
      current: {
        temp: Math.round(current.temperature.air.C),
        condition: formatCondition(current.description.weather_code),
        humidity: current.humidity.percent,
        windSpeed: Math.round(current.wind.speed.m_s * 10) / 10,
        windDirection: formatWindDirection(current.wind.direction.degree)
      },
      forecast: forecast.slice(0, 3).map((day: any, idx: number) => ({
        day: idx === 0 ? "Сегодня" : idx === 1 ? "Завтра" : "Послезавтра",
        temp: Math.round(day.temperature.air.C),
        condition: formatCondition(day.description.weather_code),
        humidity: day.humidity.percent,
        windSpeed: Math.round(day.wind.speed.m_s * 10) / 10
      }))
    };

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weather fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
