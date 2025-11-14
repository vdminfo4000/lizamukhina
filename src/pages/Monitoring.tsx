import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Thermometer, Wind, Sun, Activity, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sensorData = [
  {
    plot: "Участок 1",
    sensors: [
      { type: "Влажность почвы", value: "65%", status: "normal", icon: Droplets, color: "text-blue-600" },
      { type: "Температура", value: "18°C", status: "normal", icon: Thermometer, color: "text-orange-600" },
      { type: "pH почвы", value: "6.5", status: "normal", icon: Activity, color: "text-green-600" },
      { type: "Освещенность", value: "850 Lux", status: "normal", icon: Sun, color: "text-yellow-600" },
    ],
  },
  {
    plot: "Участок 2",
    sensors: [
      { type: "Влажность почвы", value: "42%", status: "warning", icon: Droplets, color: "text-blue-600" },
      { type: "Температура", value: "22°C", status: "normal", icon: Thermometer, color: "text-orange-600" },
      { type: "pH почвы", value: "7.2", status: "normal", icon: Activity, color: "text-green-600" },
      { type: "Освещенность", value: "920 Lux", status: "normal", icon: Sun, color: "text-yellow-600" },
    ],
  },
  {
    plot: "Участок 3",
    sensors: [
      { type: "Влажность почвы", value: "58%", status: "normal", icon: Droplets, color: "text-blue-600" },
      { type: "Температура", value: "19°C", status: "normal", icon: Thermometer, color: "text-orange-600" },
      { type: "pH почвы", value: "6.8", status: "normal", icon: Activity, color: "text-green-600" },
      { type: "Освещенность", value: "780 Lux", status: "normal", icon: Sun, color: "text-yellow-600" },
    ],
  },
];

const weatherData = {
  current: { temp: "20°C", humidity: "65%", wind: "12 км/ч", pressure: "1013 мбар" },
  forecast: [
    { day: "Сегодня", temp: "20°C", condition: "Облачно" },
    { day: "Завтра", temp: "22°C", condition: "Ясно" },
    { day: "Вт", temp: "19°C", condition: "Дождь" },
    { day: "Ср", temp: "18°C", condition: "Пасмурно" },
  ],
};

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Мониторинг урожая</h1>
        <p className="text-muted-foreground">
          Данные с датчиков и метеостанций в реальном времени
        </p>
      </div>

      {/* Weather Widget */}
      <Card className="shadow-card bg-gradient-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-90">Текущая погода</p>
              <p className="text-4xl font-bold mt-2">{weatherData.current.temp}</p>
              <p className="text-sm opacity-90 mt-1">Облачно</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <Droplets className="h-6 w-6 mx-auto mb-1 opacity-90" />
                <p className="text-sm">{weatherData.current.humidity}</p>
                <p className="text-xs opacity-75">Влажность</p>
              </div>
              <div className="text-center">
                <Wind className="h-6 w-6 mx-auto mb-1 opacity-90" />
                <p className="text-sm">{weatherData.current.wind}</p>
                <p className="text-xs opacity-75">Ветер</p>
              </div>
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-1 opacity-90" />
                <p className="text-sm">{weatherData.current.pressure}</p>
                <p className="text-xs opacity-75">Давление</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-white/20">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="text-center text-white">
                <p className="text-sm opacity-90">{day.day}</p>
                <p className="text-lg font-semibold mt-1">{day.temp}</p>
                <p className="text-xs opacity-75 mt-1">{day.condition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="shadow-card border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Требуется внимание</p>
              <p className="text-sm text-muted-foreground">
                Участок 2: низкий уровень влажности почвы (42%). Рекомендуется полив.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Data by Plot */}
      <Tabs defaultValue="plot1" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plot1">Участок 1</TabsTrigger>
          <TabsTrigger value="plot2">Участок 2</TabsTrigger>
          <TabsTrigger value="plot3">Участок 3</TabsTrigger>
          <TabsTrigger value="all">Все участки</TabsTrigger>
        </TabsList>

        <TabsContent value="plot1">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sensorData[0].sensors.map((sensor) => {
              const Icon = sensor.icon;
              return (
                <Card key={sensor.type} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className={`h-5 w-5 ${sensor.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{sensor.type}</p>
                        <p className="text-2xl font-bold text-foreground">{sensor.value}</p>
                      </div>
                    </div>
                    {sensor.status === "normal" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Норма</Badge>
                    ) : (
                      <Badge variant="secondary">Внимание</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plot2">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sensorData[1].sensors.map((sensor) => {
              const Icon = sensor.icon;
              return (
                <Card key={sensor.type} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className={`h-5 w-5 ${sensor.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{sensor.type}</p>
                        <p className="text-2xl font-bold text-foreground">{sensor.value}</p>
                      </div>
                    </div>
                    {sensor.status === "normal" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Норма</Badge>
                    ) : (
                      <Badge variant="secondary">Внимание</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plot3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sensorData[2].sensors.map((sensor) => {
              const Icon = sensor.icon;
              return (
                <Card key={sensor.type} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className={`h-5 w-5 ${sensor.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{sensor.type}</p>
                        <p className="text-2xl font-bold text-foreground">{sensor.value}</p>
                      </div>
                    </div>
                    {sensor.status === "normal" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Норма</Badge>
                    ) : (
                      <Badge variant="secondary">Внимание</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {sensorData.map((plot) => (
              <Card key={plot.plot} className="shadow-card">
                <CardHeader>
                  <CardTitle>{plot.plot}</CardTitle>
                  <CardDescription>Показатели датчиков</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {plot.sensors.map((sensor) => {
                      const Icon = sensor.icon;
                      return (
                        <div key={sensor.type} className="rounded-lg border border-border p-4">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${sensor.color}`} />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{sensor.type}</p>
                              <p className="text-xl font-bold text-foreground">{sensor.value}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Historical Data */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>График изменений</CardTitle>
          <CardDescription>Динамика показателей за последние 7 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">График временных рядов</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
