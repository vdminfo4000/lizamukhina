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

    const coordinates = `${latitude},${longitude}`;

    // Запрос текущей погоды к Gismeteo API v4
    const currentResponse = await fetch(
      `https://api.gismeteo.net/v4/weather/current?coordinates=${coordinates}&locale=ru-RU`,
      {
        headers: {
          'X-Gismeteo-Token': gismeteoApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!currentResponse.ok) {
      console.error(`Gismeteo current API error: ${currentResponse.status}`);
      throw new Error(`Gismeteo API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Запрос прогноза на 3 дня (h24 - суточный прогноз)
    const forecastResponse = await fetch(
      `https://api.gismeteo.net/v4/weather/forecast/h24?coordinates=${coordinates}&days=3&locale=ru-RU`,
      {
        headers: {
          'X-Gismeteo-Token': gismeteoApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!forecastResponse.ok) {
      console.error(`Gismeteo forecast API error: ${forecastResponse.status}`);
      throw new Error(`Gismeteo forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Функция для определения состояния погоды на основе облачности
    const formatCondition = (cloudiness: number) => {
      if (cloudiness <= 25) return "Ясно";
      if (cloudiness <= 50) return "Малооблачно";
      if (cloudiness <= 75) return "Облачно";
      return "Пасмурно";
    };

    // Функция для форматирования направления ветра
    const formatWindDirection = (degrees: number | null) => {
      if (degrees === null) return "";
      const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    };

    const current = currentData.current;
    const forecast = forecastData.forecast;

    const weatherData = {
      current: {
        temp: Math.round(current.temperature_air),
        condition: formatCondition(current.cloudiness),
        humidity: Math.round(current.humidity),
        windSpeed: Math.round(current.wind_speed * 10) / 10,
        windDirection: formatWindDirection(current.wind_direction)
      },
      forecast: [0, 1, 2].map((idx: number) => ({
        day: idx === 0 ? "Сегодня" : idx === 1 ? "Завтра" : "Послезавтра",
        temp: Math.round(forecast.temperature_air_avg[idx]),
        condition: formatCondition(forecast.cloudiness[idx]),
        humidity: Math.round(forecast.humidity[idx]),
        windSpeed: Math.round(forecast.wind_speed[idx] * 10) / 10
      }))
    };

    console.log('Weather data successfully fetched:', weatherData);

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weather fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Возвращаем моковые данные при ошибке
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
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
