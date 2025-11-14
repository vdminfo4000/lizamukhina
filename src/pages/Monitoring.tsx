import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Thermometer, Wind, Sun, Activity, AlertTriangle, Settings, Plus, Wifi, WifiOff, Power, RefreshCw, Calendar } from "lucide-react";
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

const chartData = [
  { time: '00:00', moisture: 65, temp: 18, ph: 6.5 },
  { time: '04:00', moisture: 63, temp: 17, ph: 6.5 },
  { time: '08:00', moisture: 61, temp: 19, ph: 6.4 },
  { time: '12:00', moisture: 58, temp: 22, ph: 6.6 },
  { time: '16:00', moisture: 55, temp: 24, ph: 6.5 },
  { time: '20:00', moisture: 60, temp: 20, ph: 6.5 },
];

const maturityData = [
  { plot: "Участок 1", culture: "Пшеница озимая", maturity: 85, stage: "Молочная спелость", daysToHarvest: 12 },
  { plot: "Участок 2", culture: "Ячмень", maturity: 92, stage: "Восковая спелость", daysToHarvest: 5 },
  { plot: "Участок 3", culture: "Кукуруза", maturity: 65, stage: "Цветение", daysToHarvest: 35 },
];

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
  const [selectedPlot, setSelectedPlot] = useState<string>("Участок 1");
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${systemActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Power className={`h-6 w-6 ${systemActive ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Система мониторинга</p>
                <p className="text-sm text-muted-foreground">
                  {systemActive ? 'Активна' : 'Остановлена'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={systemActive ? "destructive" : "default"}
                onClick={() => setSystemActive(!systemActive)}
              >
                {systemActive ? 'Остановить' : 'Запустить'}
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Обновить
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
                      <Input id="sensor-id" placeholder="SN013" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sensor-name">Название</Label>
                      <Input id="sensor-name" placeholder="Датчик влажности #4" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="maturity">Созревание</TabsTrigger>
          <TabsTrigger value="charts">Графики</TabsTrigger>
          <TabsTrigger value="weather">Погода</TabsTrigger>
          <TabsTrigger value="sensors">Датчики</TabsTrigger>
          <TabsTrigger value="events">Журнал событий</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {sensorData.map((plotData, idx) => (
              <Card key={idx} className="shadow-card">
                <CardHeader>
                  <CardTitle>{plotData.plot}</CardTitle>
                  <CardDescription>Текущие показатели датчиков</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plotData.sensors.map((sensor, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                          <sensor.icon className={`h-5 w-5 ${sensor.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sensor.type}</p>
                          <p className="text-xs text-muted-foreground">{sensor.value}</p>
                        </div>
                      </div>
                      <Badge variant={sensor.status === "warning" ? "destructive" : "secondary"}>
                        {sensor.status === "warning" ? <AlertTriangle className="mr-1 h-3 w-3" /> : null}
                        {sensor.status === "warning" ? "Внимание" : "Норма"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maturity Tab */}
        <TabsContent value="maturity" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Данные о созревании культур</CardTitle>
              <CardDescription>Мониторинг стадий созревания и прогноз сбора урожая</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maturityData.map((item, idx) => (
                  <Card key={idx} className="border-l-4" style={{ borderLeftColor: item.maturity >= 90 ? '#22c55e' : item.maturity >= 70 ? '#eab308' : '#3b82f6' }}>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-5">
                        <div>
                          <p className="text-sm text-muted-foreground">Участок</p>
                          <p className="font-semibold text-foreground">{item.plot}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Культура</p>
                          <p className="font-semibold text-foreground">{item.culture}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Стадия</p>
                          <p className="font-semibold text-foreground">{item.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Зрелость</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-300"
                                style={{ 
                                  width: `${item.maturity}%`,
                                  backgroundColor: item.maturity >= 90 ? '#22c55e' : item.maturity >= 70 ? '#eab308' : '#3b82f6'
                                }}
                              />
                            </div>
                            <span className="font-semibold text-foreground">{item.maturity}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">До сбора</p>
                          <p className="font-semibold text-foreground">{item.daysToHarvest} дней</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Влажность почвы</CardTitle>
                <CardDescription>Динамика за последние 24 часа</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="moisture" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Влажность %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Температура почвы</CardTitle>
                <CardDescription>Динамика за последние 24 часа</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Температура °C" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle>pH почвы</CardTitle>
                <CardDescription>Динамика за последние 24 часа</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[6, 7]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ph" stroke="#22c55e" strokeWidth={2} name="pH" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
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
                    <Droplets className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs opacity-90">Влажность</p>
                    <p className="font-semibold">{weatherData.current.humidity}</p>
                  </div>
                  <div className="text-center">
                    <Wind className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs opacity-90">Ветер</p>
                    <p className="font-semibold">{weatherData.current.wind}</p>
                  </div>
                  <div className="text-center">
                    <Activity className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs opacity-90">Давление</p>
                    <p className="font-semibold">{weatherData.current.pressure}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            {weatherData.forecast.map((day, idx) => (
              <Card key={idx} className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold text-foreground mb-2">{day.day}</p>
                  <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-foreground">{day.temp}</p>
                  <p className="text-sm text-muted-foreground mt-1">{day.condition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="space-y-4">
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
                {plotSensors[selectedPlot as keyof typeof plotSensors]?.map((sensor) => (
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
                          <span className="text-xs text-muted-foreground">Калибровка: {sensor.lastCalibration}</span>
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
                      
                      <Dialog open={editingSensor?.id === sensor.id} onOpenChange={(open) => !open && setEditingSensor(null)}>
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
                              {sensor.name} ({sensor.id})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Название</Label>
                              <Input id="name" defaultValue={sensor.name} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="interval">Интервал опроса</Label>
                              <Select defaultValue="5">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 мин</SelectItem>
                                  <SelectItem value="5">5 мин</SelectItem>
                                  <SelectItem value="10">10 мин</SelectItem>
                                  <SelectItem value="30">30 мин</SelectItem>
                                  <SelectItem value="60">1 час</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="threshold">Пороговые значения</Label>
                              <Input id="threshold" defaultValue={sensor.threshold} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notifications">Уведомления</Label>
                              <Input id="notifications" type="text" placeholder="Email для уведомлений" />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingSensor(null)}>Отмена</Button>
                              <Button onClick={() => setEditingSensor(null)}>Сохранить</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={calibratingSensor?.id === sensor.id} onOpenChange={(open) => !open && setCalibratingSensor(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setCalibratingSensor(sensor)}>
                            Калибровка
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Калибровка датчика</DialogTitle>
                            <DialogDescription>
                              {sensor.name} ({sensor.id})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="rounded-lg bg-muted p-4">
                              <p className="text-sm text-muted-foreground">Последняя калибровка</p>
                              <p className="font-semibold text-foreground">{sensor.lastCalibration}</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="calibration-value">Эталонное значение</Label>
                              <Input id="calibration-value" type="text" placeholder="Введите эталонное значение" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="calibration-notes">Примечания</Label>
                              <Input id="calibration-notes" type="text" placeholder="Условия калибровки" />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                              <div>
                                <p className="font-medium text-foreground">Автокалибровка</p>
                                <p className="text-sm text-muted-foreground">Калибровка каждые 30 дней</p>
                              </div>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" onClick={() => setCalibratingSensor(null)}>Отмена</Button>
                              <Button onClick={() => setCalibratingSensor(null)}>Выполнить калибровку</Button>
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
        </TabsContent>

        {/* Events Log Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Журнал событий</CardTitle>
                  <CardDescription>История событий системы мониторинга</CardDescription>
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Фильтр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все события</SelectItem>
                    <SelectItem value="alert">Тревоги</SelectItem>
                    <SelectItem value="warning">Предупреждения</SelectItem>
                    <SelectItem value="info">Информация</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата и время</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Датчик</TableHead>
                    <TableHead>Участок</TableHead>
                    <TableHead>Сообщение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventLog
                    .filter(event => eventFilter === "all" || event.type === eventFilter)
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.time}</div>
                              <div className="text-xs text-muted-foreground">{event.date}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              event.type === "alert" ? "destructive" : 
                              event.type === "warning" ? "default" : 
                              "secondary"
                            }
                          >
                            {event.type === "alert" ? "Тревога" : event.type === "warning" ? "Предупр." : "Инфо"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{event.sensor}</TableCell>
                        <TableCell>{event.plot}</TableCell>
                        <TableCell>{event.message}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}