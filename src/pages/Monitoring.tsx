import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Thermometer, Wind, Sun, Activity, AlertTriangle, Settings, Plus, Wifi, WifiOff, Power, RefreshCw, TrendingUp, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// Данные для графиков
const chartData = [
  { time: '00:00', moisture: 65, temp: 18, ph: 6.5 },
  { time: '04:00', moisture: 63, temp: 17, ph: 6.5 },
  { time: '08:00', moisture: 61, temp: 19, ph: 6.4 },
  { time: '12:00', moisture: 58, temp: 22, ph: 6.6 },
  { time: '16:00', moisture: 55, temp: 24, ph: 6.5 },
  { time: '20:00', moisture: 60, temp: 20, ph: 6.5 },
];

// Данные о созревании
const maturityData = [
  { plot: "Участок 1", culture: "Пшеница озимая", maturity: 85, stage: "Молочная спелость", daysToHarvest: 12 },
  { plot: "Участок 2", culture: "Ячмень", maturity: 92, stage: "Восковая спелость", daysToHarvest: 5 },
  { plot: "Участок 3", culture: "Кукуруза", maturity: 65, stage: "Цветение", daysToHarvest: 35 },
];

// Журнал событий
const eventLog = [
  { id: 1, time: "14:23", date: "14.11.2025", type: "warning", sensor: "SN007", plot: "Участок 2", message: "Низкий заряд батареи (15%)" },
  { id: 2, time: "12:15", date: "14.11.2025", type: "info", sensor: "SN001", plot: "Участок 1", message: "Калибровка выполнена успешно" },
  { id: 3, time: "09:40", date: "14.11.2025", type: "alert", sensor: "SN005", plot: "Участок 2", message: "Влажность ниже порога (42%)" },
  { id: 4, time: "08:20", date: "14.11.2025", type: "info", sensor: "SN003", plot: "Участок 1", message: "Система запущена" },
  { id: 5, time: "23:15", date: "13.11.2025", type: "warning", sensor: "SN007", plot: "Участок 2", message: "Потеря связи с датчиком" },
];

const plotSensors = {
  "Участок 1": [
    { id: "SN001", name: "Датчик влажности #1", type: "Влажность почвы", status: "online", battery: "85%", interval: "5 мин", threshold: "40-70%", lastCalibration: "10.11.2025" },
    { id: "SN002", name: "Датчик температуры #1", type: "Температура", status: "online", battery: "92%", interval: "10 мин", threshold: "15-25°C", lastCalibration: "08.11.2025" },
    { id: "SN003", name: "Датчик pH #1", type: "pH почвы", status: "online", battery: "78%", interval: "30 мин", threshold: "6.0-7.5", lastCalibration: "14.11.2025" },
    { id: "SN004", name: "Датчик освещенности #1", type: "Освещенность", status: "online", battery: "88%", interval: "15 мин", threshold: "500-1000 Lux", lastCalibration: "09.11.2025" },
  ],
  "Участок 2": [
    { id: "SN005", name: "Датчик влажности #2", type: "Влажность почвы", status: "online", battery: "91%", interval: "5 мин", threshold: "40-70%", lastCalibration: "12.11.2025" },
    { id: "SN006", name: "Датчик температуры #2", type: "Температура", status: "online", battery: "65%", interval: "10 мин", threshold: "15-25°C", lastCalibration: "11.11.2025" },
    { id: "SN007", name: "Датчик pH #2", type: "pH почвы", status: "offline", battery: "15%", interval: "30 мин", threshold: "6.0-7.5", lastCalibration: "05.11.2025" },
    { id: "SN008", name: "Датчик освещенности #2", type: "Освещенность", status: "online", battery: "72%", interval: "15 мин", threshold: "500-1000 Lux", lastCalibration: "10.11.2025" },
  ],
  "Участок 3": [
    { id: "SN009", name: "Датчик влажности #3", type: "Влажность почвы", status: "online", battery: "95%", interval: "5 мин", threshold: "40-70%", lastCalibration: "13.11.2025" },
    { id: "SN010", name: "Датчик температуры #3", type: "Температура", status: "online", battery: "82%", interval: "10 мин", threshold: "15-25°C", lastCalibration: "12.11.2025" },
    { id: "SN011", name: "Датчик pH #3", type: "pH почвы", status: "online", battery: "89%", interval: "30 мин", threshold: "6.0-7.5", lastCalibration: "11.11.2025" },
    { id: "SN012", name: "Датчик освещенности #3", type: "Освещенность", status: "online", battery: "76%", interval: "15 мин", threshold: "500-1000 Lux", lastCalibration: "13.11.2025" },
  ],
};

export default function Monitoring() {
  const [systemActive, setSystemActive] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState("Участок 1");
  const [editingSensor, setEditingSensor] = useState<any>(null);
  const [calibratingSensor, setCalibratingSensor] = useState<any>(null);
  const [eventFilter, setEventFilter] = useState<string>("all");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Мониторинг урожая</h1>
        <p className="text-muted-foreground">
          Данные с датчиков и метеостанций в реальном времени
        </p>
      </div>

      {/* Control Panel */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Панель управления</CardTitle>
              <CardDescription>Управление системой мониторинга</CardDescription>
            </div>
            <Badge className={systemActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {systemActive ? "Система активна" : "Система остановлена"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setSystemActive(!systemActive)}
              variant={systemActive ? "destructive" : "default"}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {systemActive ? "Остановить систему" : "Запустить систему"}
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Обновить данные
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Подключить датчик
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Подключение нового датчика</DialogTitle>
                  <DialogDescription>
                    Введите параметры датчика для подключения к системе мониторинга
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensor-id">ID датчика</Label>
                    <Input id="sensor-id" placeholder="SN005" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-name">Название</Label>
                    <Input id="sensor-name" placeholder="Датчик влажности #2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-type">Тип датчика</Label>
                    <Select>
                      <SelectTrigger id="sensor-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moisture">Влажность почвы</SelectItem>
                        <SelectItem value="temperature">Температура</SelectItem>
                        <SelectItem value="ph">pH почвы</SelectItem>
                        <SelectItem value="light">Освещенность</SelectItem>
                        <SelectItem value="wind">Скорость ветра</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-plot">Участок</Label>
                    <Select>
                      <SelectTrigger id="sensor-plot">
                        <SelectValue placeholder="Выберите участок" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plot1">Участок 1</SelectItem>
                        <SelectItem value="plot2">Участок 2</SelectItem>
                        <SelectItem value="plot3">Участок 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Подключить датчик</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sensors by Plot */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Датчики по участкам</CardTitle>
              <CardDescription>Управление и настройка датчиков для каждого участка</CardDescription>
            </div>
            <Select value={selectedPlot} onValueChange={setSelectedPlot}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Участок 1">Участок 1</SelectItem>
                <SelectItem value="Участок 2">Участок 2</SelectItem>
                <SelectItem value="Участок 3">Участок 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plotSensors[selectedPlot as keyof typeof plotSensors].map((sensor) => (
              <div 
                key={sensor.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    sensor.status === 'online' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {sensor.status === 'online' ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{sensor.name}</p>
                    <p className="text-sm text-muted-foreground">{sensor.id} • {sensor.type}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">Интервал: {sensor.interval}</span>
                      <span className="text-xs text-muted-foreground">Порог: {sensor.threshold}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Батарея</p>
                    <p className="text-sm font-medium">{sensor.battery}</p>
                  </div>
                  <Badge className={sensor.status === 'online' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {sensor.status === 'online' ? 'Онлайн' : 'Офлайн'}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSensor(sensor)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Настройка датчика</DialogTitle>
                        <DialogDescription>
                          Настройте параметры датчика {sensor.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="sensor-name-edit">Название</Label>
                          <Input id="sensor-name-edit" defaultValue={sensor.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interval">Интервал опроса</Label>
                          <Select defaultValue={sensor.interval}>
                            <SelectTrigger id="interval">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 мин">1 минута</SelectItem>
                              <SelectItem value="5 мин">5 минут</SelectItem>
                              <SelectItem value="10 мин">10 минут</SelectItem>
                              <SelectItem value="15 мин">15 минут</SelectItem>
                              <SelectItem value="30 мин">30 минут</SelectItem>
                              <SelectItem value="1 час">1 час</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="threshold">Пороговые значения</Label>
                          <Input id="threshold" defaultValue={sensor.threshold} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alerts">Отправка уведомлений</Label>
                          <Select defaultValue="enabled">
                            <SelectTrigger id="alerts">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enabled">Включены</SelectItem>
                              <SelectItem value="disabled">Отключены</SelectItem>
                              <SelectItem value="critical">Только критические</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">Сохранить</Button>
                          <Button variant="outline" className="flex-1">Отменить</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
