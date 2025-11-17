import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Thermometer, Wind, Sun, Activity, AlertTriangle, Settings, Plus, Wifi, WifiOff, Power, RefreshCw, Calendar, Trash2 } from "lucide-react";
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

interface Zone {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  plot_id: string | null;
  created_at: string;
}

interface Sensor {
  id: string;
  zone_id: string;
  name: string;
  sensor_type: string;
  serial_number: string | null;
  status: string;
  last_reading: any;
  battery_level: number | null;
  calibration_date: string | null;
  created_at: string;
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
  const [zones, setZones] = useState<Zone[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({ name: "", description: "", plot_id: "" });
  const [newSensor, setNewSensor] = useState({ 
    name: "", 
    sensor_type: "moisture", 
    serial_number: "",
    battery_level: "100"
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canView, canEdit, loading: accessLoading } = useModuleAccess('monitoring');

  useEffect(() => {
    loadPlots();
    loadZones();
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

  const loadZones = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return;

    const { data: zonesData } = await supabase
      .from('monitoring_zones')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (zonesData) {
      setZones(zonesData);
      // Load sensors for all zones
      const { data: sensorsData } = await supabase
        .from('monitoring_sensors')
        .select('*')
        .in('zone_id', zonesData.map(z => z.id));
      
      if (sensorsData) {
        setSensors(sensorsData);
      }
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return;

    const { error } = await supabase
      .from('monitoring_zones')
      .insert({
        company_id: profile.company_id,
        name: newZone.name,
        description: newZone.description || null,
        plot_id: newZone.plot_id || null,
      });

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить зону',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Успешно',
      description: 'Зона добавлена',
    });

    setNewZone({ name: "", description: "", plot_id: "" });
    loadZones();
  };

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZone) {
      toast({
        title: 'Ошибка',
        description: 'Выберите зону',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('monitoring_sensors')
      .insert({
        zone_id: selectedZone,
        name: newSensor.name,
        sensor_type: newSensor.sensor_type,
        serial_number: newSensor.serial_number || null,
        battery_level: parseInt(newSensor.battery_level) || null,
        status: 'active',
      });

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить датчик',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Успешно',
      description: 'Датчик добавлен',
    });

    setNewSensor({ name: "", sensor_type: "moisture", serial_number: "", battery_level: "100" });
    loadZones();
  };

  const handleDeleteZone = async (zoneId: string) => {
    const { error } = await supabase
      .from('monitoring_zones')
      .delete()
      .eq('id', zoneId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить зону',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Успешно',
      description: 'Зона удалена',
    });

    loadZones();
  };

  const handleDeleteSensor = async (sensorId: string) => {
    const { error } = await supabase
      .from('monitoring_sensors')
      .delete()
      .eq('id', sensorId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить датчик',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Успешно',
      description: 'Датчик удален',
    });

    loadZones();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Мониторинг урожая</h1>
          <p className="text-muted-foreground">
            Отслеживание состояния посевов и готовности к уборке
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setConfigDialogOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Настроить
          </Button>
        )}
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

      {/* Zone and Sensor Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление зонами и датчиками</DialogTitle>
            <DialogDescription>
              Создавайте зоны мониторинга и добавляйте датчики
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="zones" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zones">Зоны мониторинга</TabsTrigger>
              <TabsTrigger value="sensors">Датчики</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zones" className="space-y-4">
              <form onSubmit={handleAddZone} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Добавить новую зону</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="zone_name">Название зоны</Label>
                    <Input
                      id="zone_name"
                      placeholder="Например: Западная часть поля"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zone_plot">Участок (опционально)</Label>
                    <Select 
                      value={newZone.plot_id} 
                      onValueChange={(value) => setNewZone({ ...newZone, plot_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите участок" />
                      </SelectTrigger>
                      <SelectContent>
                        {plots.map((plot) => (
                          <SelectItem key={plot.id} value={plot.id}>
                            {plot.crop || 'Участок'} ({plot.cadastral_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="zone_description">Описание</Label>
                    <Input
                      id="zone_description"
                      placeholder="Дополнительная информация"
                      value={newZone.description}
                      onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить зону
                </Button>
              </form>

              <div className="space-y-2">
                <h3 className="font-semibold">Существующие зоны</h3>
                {zones.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Зоны не созданы</p>
                ) : (
                  zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{zone.name}</p>
                        {zone.description && (
                          <p className="text-sm text-muted-foreground">{zone.description}</p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sensors" className="space-y-4">
              <form onSubmit={handleAddSensor} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Добавить новый датчик</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sensor_zone">Зона</Label>
                    <Select 
                      value={selectedZone || ''} 
                      onValueChange={setSelectedZone}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите зону" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sensor_name">Название датчика</Label>
                    <Input
                      id="sensor_name"
                      placeholder="Например: Датчик влажности 1"
                      value={newSensor.name}
                      onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sensor_type">Тип датчика</Label>
                    <Select 
                      value={newSensor.sensor_type} 
                      onValueChange={(value) => setNewSensor({ ...newSensor, sensor_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moisture">Влажность почвы</SelectItem>
                        <SelectItem value="temperature">Температура</SelectItem>
                        <SelectItem value="ph">pH почвы</SelectItem>
                        <SelectItem value="light">Освещенность</SelectItem>
                        <SelectItem value="wind">Ветер</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sensor_serial">Серийный номер</Label>
                    <Input
                      id="sensor_serial"
                      placeholder="SN001"
                      value={newSensor.serial_number}
                      onChange={(e) => setNewSensor({ ...newSensor, serial_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sensor_battery">Уровень батареи (%)</Label>
                    <Input
                      id="sensor_battery"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={newSensor.battery_level}
                      onChange={(e) => setNewSensor({ ...newSensor, battery_level: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить датчик
                </Button>
              </form>

              <div className="space-y-2">
                <h3 className="font-semibold">Существующие датчики</h3>
                {sensors.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Датчики не добавлены</p>
                ) : (
                  <div className="space-y-2">
                    {zones.map((zone) => {
                      const zoneSensors = sensors.filter(s => s.zone_id === zone.id);
                      if (zoneSensors.length === 0) return null;
                      
                      return (
                        <div key={zone.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{zone.name}</h4>
                          <div className="space-y-2">
                            {zoneSensors.map((sensor) => (
                              <div key={sensor.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">{sensor.name}</p>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>Тип: {sensor.sensor_type}</span>
                                    {sensor.serial_number && <span>SN: {sensor.serial_number}</span>}
                                    {sensor.battery_level && <span>Батарея: {sensor.battery_level}%</span>}
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSensor(sensor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
