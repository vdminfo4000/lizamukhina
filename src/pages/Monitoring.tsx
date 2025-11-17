import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useModuleAccess } from "@/hooks/useModuleAccess";

interface Plot {
  id: string;
  cadastral_number: string;
  area: number;
  crop: string | null;
  address: string | null;
  status: string;
}

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

const eventLog = [
  { id: 1, time: "14:23", date: "14.11.2025", type: "warning", sensor: "SN007", plot: "Участок 2", message: "Низкий заряд батареи (15%)" },
  { id: 2, time: "12:15", date: "14.11.2025", type: "info", sensor: "SN001", plot: "Участок 1", message: "Калибровка выполнена успешно" },
  { id: 3, time: "09:30", date: "14.11.2025", type: "alert", sensor: "SN003", plot: "Участок 2", message: "Критически низкая влажность почвы" },
  { id: 4, time: "08:45", date: "14.11.2025", type: "info", sensor: "SN005", plot: "Участок 3", message: "Обновление прошивки завершено" },
];

export default function Monitoring() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canView, canEdit, loading: accessLoading } = useModuleAccess('monitoring');

  useEffect(() => {
    loadPlots();
  }, []);

  useEffect(() => {
    if (!accessLoading && !canView) {
      toast({
        title: 'Доступ запрещен',
        description: 'У вас нет доступа к модулю Мониторинг',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [accessLoading, canView, navigate, toast]);

  const loadPlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    const { data: plotsData } = await supabase
      .from('plots')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (plotsData) {
      setPlots(plotsData);
    }
    setLoading(false);
  };

  // Mock maturity data based on plots
  const maturityData = plots.map((plot, index) => ({
    plot: `${plot.crop || 'Культура'} (${plot.cadastral_number})`,
    culture: plot.crop || 'Не указано',
    maturity: 65 + (index * 10),
    stage: index === 0 ? "Молочная спелость" : index === 1 ? "Восковая спелость" : "Цветение",
    daysToHarvest: 12 + (index * 10),
  }));

  // Mock sensor data based on plots
  const sensorData = plots.map((plot) => ({
    plot: `${plot.crop || 'Участок'} (${plot.cadastral_number})`,
    area: plot.area,
    sensors: [
      { type: "Влажность почвы", value: "65%", status: "normal", icon: Droplets, color: "text-blue-600" },
      { type: "Температура", value: "18°C", status: "normal", icon: Thermometer, color: "text-orange-600" },
      { type: "pH почвы", value: "6.5", status: "normal", icon: Activity, color: "text-green-600" },
      { type: "Освещенность", value: "850 Lux", status: "normal", icon: Sun, color: "text-yellow-600" },
    ],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (plots.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Мониторинг урожая</CardTitle>
            <CardDescription>
              Для начала работы добавьте участки в разделе Реестр
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Мониторинг урожая</h1>
        <p className="text-muted-foreground">
          Отслеживание состояния посевов и готовности к уборке
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных участков</p>
                <p className="text-2xl font-bold text-foreground">{plots.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ср. влажность</p>
                <p className="text-2xl font-bold text-foreground">62%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Требует внимания</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <Thermometer className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Температура</p>
                <p className="text-2xl font-bold text-foreground">20°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Датчики</TabsTrigger>
          <TabsTrigger value="maturity">Спелость</TabsTrigger>
          <TabsTrigger value="weather">Погода</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {sensorData.map((data, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{data.plot}</CardTitle>
                    <CardDescription>Площадь: {data.area} га</CardDescription>
                  </div>
                  {canEdit && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Настроить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Настройки датчиков</DialogTitle>
                          <DialogDescription>
                            Управление датчиками для {data.plot}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground">
                            Настройка датчиков будет доступна после подключения оборудования
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {data.sensors.map((sensor, sIndex) => (
                    <Card key={sIndex} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <sensor.icon className={`h-5 w-5 ${sensor.color}`} />
                          <Badge variant={sensor.status === "normal" ? "default" : "destructive"}>
                            {sensor.status === "normal" ? "Норма" : "Предупр."}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{sensor.type}</p>
                        <p className="text-2xl font-bold">{sensor.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="maturity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Стадии созревания</CardTitle>
              <CardDescription>Прогресс созревания культур по участкам</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Участок</TableHead>
                    <TableHead>Культура</TableHead>
                    <TableHead>Спелость</TableHead>
                    <TableHead>Стадия</TableHead>
                    <TableHead>До уборки (дней)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maturityData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.plot}</TableCell>
                      <TableCell>{item.culture}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${item.maturity}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{item.maturity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.stage}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.daysToHarvest}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Текущая погода</CardTitle>
                <CardDescription>Условия на текущий момент</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Thermometer className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Температура</p>
                      <p className="text-2xl font-bold">{weatherData.current.temp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Droplets className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Влажность</p>
                      <p className="text-2xl font-bold">{weatherData.current.humidity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Wind className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ветер</p>
                      <p className="text-2xl font-bold">{weatherData.current.wind}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Прогноз на 4 дня</CardTitle>
                <CardDescription>Планирование полевых работ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-muted-foreground">{day.condition}</span>
                      <span className="font-bold">{day.temp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Журнал событий</CardTitle>
              <CardDescription>История событий с датчиков и оборудования</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Датчик</TableHead>
                    <TableHead>Участок</TableHead>
                    <TableHead>Сообщение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventLog.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.time}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            event.type === "alert" ? "destructive" : 
                            event.type === "warning" ? "default" : 
                            "secondary"
                          }
                        >
                          {event.type === "alert" ? "Тревога" : 
                           event.type === "warning" ? "Предупр." : 
                           "Инфо"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{event.sensor}</TableCell>
                      <TableCell>{event.plot}</TableCell>
                      <TableCell className="text-muted-foreground">{event.message}</TableCell>
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
