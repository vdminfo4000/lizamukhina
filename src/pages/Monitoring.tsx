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
import { SensorSettingsDialog } from "@/components/forms/SensorSettingsDialog";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PlotWeatherWidget } from "@/components/PlotWeatherWidget";
import { PlotWeatherDetail } from "@/components/PlotWeatherDetail";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useDragScroll } from "@/hooks/useDragScroll";
import { SensorZone } from "@/components/SensorZone";

interface Plot {
  id: string;
  name?: string | null;
  cadastral_number: string;
  area: number;
  crop: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
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
  const weatherScrollRef = useDragScroll();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({ name: "", description: "", plot_id: "" });
  const [newSensor, setNewSensor] = useState({ 
    name: "", 
    sensor_type: "moisture", 
    serial_number: "",
    battery_level: "100"
  });
  const [spectrometerData, setSpectrometerData] = useState({
    pb: "",
    zn: "",
    cd: "",
    as: "",
    cr: "",
    ni: "",
    cu: ""
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedSensorForSettings, setSelectedSensorForSettings] = useState<string | null>(null);
  const [sensorApiSettings, setSensorApiSettings] = useState({
    apiUrl: "",
    apiKey: "",
    apiMethod: "GET",
    thresholdMin: "",
    thresholdMax: "",
    alertEnabled: false
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
        .select(`
          *,
          zone:monitoring_zones(id, name)
        `)
        .in('zone_id', zonesData.map(z => z.id));
      
      if (sensorsData) {
        setSensors(sensorsData);
      }
    }
  };

  const handleAddZone = async (e: React.FormEvent, plotId: string) => {
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
        plot_id: plotId,
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

  const handleOpenSensorSettings = (sensor: Sensor) => {
    setSelectedSensorForSettings(sensor.id);
    // Load existing API settings from last_reading if available
    if (sensor.last_reading && typeof sensor.last_reading === 'object') {
      const settings = sensor.last_reading as any;
      setSensorApiSettings({
        apiUrl: settings.apiUrl || "",
        apiKey: settings.apiKey || "",
        apiMethod: settings.apiMethod || "GET",
        thresholdMin: (sensor as any).threshold_min?.toString() || "",
        thresholdMax: (sensor as any).threshold_max?.toString() || "",
        alertEnabled: (sensor as any).alert_enabled || false
      });
    } else {
      setSensorApiSettings({
        apiUrl: "",
        apiKey: "",
        apiMethod: "GET",
        thresholdMin: (sensor as any).threshold_min?.toString() || "",
        thresholdMax: (sensor as any).threshold_max?.toString() || "",
        alertEnabled: (sensor as any).alert_enabled || false
      });
    }
    setSettingsDialogOpen(true);
  };

  const handleSaveSensorSettings = async () => {
    if (!selectedSensorForSettings) return;

    const { error } = await supabase
      .from('monitoring_sensors')
      .update({
        last_reading: {
          ...sensorApiSettings,
          value: null, // Will be populated when API is called
        },
        threshold_min: sensorApiSettings.thresholdMin ? parseFloat(sensorApiSettings.thresholdMin) : null,
        threshold_max: sensorApiSettings.thresholdMax ? parseFloat(sensorApiSettings.thresholdMax) : null,
        alert_enabled: sensorApiSettings.alertEnabled
      })
      .eq('id', selectedSensorForSettings);

    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успешно",
        description: "Настройки датчика сохранены"
      });
      setSettingsDialogOpen(false);
      loadZones();
    }
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Мониторинг урожая</h1>
        <p className="text-muted-foreground">
          Отслеживание состояния посевов и готовности к уборке
        </p>
      </div>

      {/* Stats Cards */}
      <Tabs defaultValue="sensors" className="space-y-4">
          {/* Weather Widgets Row */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Погода на участках</h3>
            <div 
              ref={weatherScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', userSelect: 'none' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {plots.map((plot) => (
                plot.location_lat && plot.location_lng && (
                  <PlotWeatherWidget
                    key={plot.id}
                    plotName={plot.name}
                    cadastralNumber={plot.cadastral_number}
                    latitude={plot.location_lat}
                    longitude={plot.location_lng}
                  />
                )
              ))}
            </div>
          </div>

        <TabsList>
          <TabsTrigger value="sensors">Датчики</TabsTrigger>
          <TabsTrigger value="maturity">Спелость</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {sensorData.map((data, index) => {
            const plot = plots[index];
            const plotZones = zones.filter(z => z.plot_id === plot.id);
            const plotSensors = sensors.filter(s => plotZones.some(z => z.id === s.zone_id));
            
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                  <div>
                      <CardTitle>{plot.name || plot.cadastral_number}</CardTitle>
                      <CardDescription>Площадь: {data.area} га • Кад. номер: {plot.cadastral_number}</CardDescription>
                    </div>
                    {canEdit && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPlotId(plot.id)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Настроить датчики
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Настройка зон и датчиков</DialogTitle>
                            <DialogDescription>
                              Управление зонами мониторинга и датчиками для {data.plot}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6 py-4">
                            {/* Данные спектрометра металлов */}
                            <div>
                              <h3 className="font-semibold mb-3">Данные спектрометра металлов</h3>
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <Label htmlFor="pb">Pb (мг/кг)</Label>
                                  <Input
                                    id="pb"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.pb}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, pb: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="zn">Zn (мг/кг)</Label>
                                  <Input
                                    id="zn"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.zn}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, zn: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cd">Cd (мг/кг)</Label>
                                  <Input
                                    id="cd"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.cd}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, cd: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="as">As (мг/кг)</Label>
                                  <Input
                                    id="as"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.as}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, as: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cr">Cr (мг/кг)</Label>
                                  <Input
                                    id="cr"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.cr}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, cr: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="ni">Ni (мг/кг)</Label>
                                  <Input
                                    id="ni"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.ni}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, ni: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cu">Cu (мг/кг)</Label>
                                  <Input
                                    id="cu"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={spectrometerData.cu}
                                    onChange={(e) => setSpectrometerData({ ...spectrometerData, cu: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Добавление зоны */}
                            <div>
                              <h3 className="font-semibold mb-3">Добавить зону мониторинга</h3>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                handleAddZone(e, plot.id);
                              }} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="zone_name">Название зоны</Label>
                                    <Input
                                      id="zone_name"
                                      placeholder="Например: Зона 1"
                                      value={newZone.name}
                                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="zone_description">Описание</Label>
                                    <Input
                                      id="zone_description"
                                      placeholder="Описание зоны"
                                      value={newZone.description}
                                      onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <Button type="submit" size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Добавить зону
                                </Button>
                              </form>
                            </div>

                            {/* Список зон участка */}
                            <div>
                              <h3 className="font-semibold mb-3">Зоны мониторинга</h3>
                              {plotZones.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Зоны не добавлены</p>
                              ) : (
                                <div className="space-y-2">
                                  {plotZones.map((zone) => (
                                    <Card key={zone.id}>
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-medium">{zone.name}</p>
                                            {zone.description && (
                                              <p className="text-sm text-muted-foreground">{zone.description}</p>
                                            )}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteZone(zone.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Добавление датчика */}
                            <div>
                              <h3 className="font-semibold mb-3">Добавить датчик</h3>
                              <form onSubmit={handleAddSensor} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
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
                                        {plotZones.map((zone) => (
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
                                      placeholder="Датчик влажности 1"
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
                                        <SelectItem value="temperature">Температура почвы</SelectItem>
                                        <SelectItem value="ph">pH почвы</SelectItem>
                                        <SelectItem value="light">Освещенность</SelectItem>
                                        <SelectItem value="wind">Ветер</SelectItem>
                                        <SelectItem value="air_humidity">Влажность воздуха</SelectItem>
                                        <SelectItem value="air_temperature">Температура воздуха</SelectItem>
                                        <SelectItem value="ec">EC</SelectItem>
                                        <SelectItem value="npk">NPK</SelectItem>
                                        <SelectItem value="nitrates">Нитраты</SelectItem>
                                        <SelectItem value="other">Другое</SelectItem>
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
                                <Button type="submit" size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Добавить датчик
                                </Button>
                              </form>
                            </div>

                            {/* Список датчиков участка */}
                            <div>
                              <h3 className="font-semibold mb-3">Датчики</h3>
                              {plotSensors.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Датчики не добавлены</p>
                              ) : (
                                <div className="space-y-2">
                                  {plotZones.map((zone) => {
                                    const zoneSensors = sensors.filter(s => s.zone_id === zone.id);
                                    if (zoneSensors.length === 0) return null;
                                    
                                    return (
                                      <div key={zone.id}>
                                        <p className="text-sm font-medium mb-2">{zone.name}</p>
                                        {zoneSensors.map((sensor) => {
                                          const sensorReading = sensor.last_reading && typeof sensor.last_reading === 'object' 
                                            ? (sensor.last_reading as any).value 
                                            : null;
                                          
                                          return (
                                            <Card key={sensor.id} className="mb-2">
                                              <CardContent className="p-3">
                                                <div className="flex items-center gap-3">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenSensorSettings(sensor)}
                                                  >
                                                    <Settings className="h-4 w-4" />
                                                  </Button>
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                      <div className="flex-1">
                                                        <p className="font-medium">{sensor.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                          {sensor.sensor_type} • {sensor.serial_number || 'Без номера'}
                                                          {sensor.battery_level && ` • Батарея: ${sensor.battery_level}%`}
                                                        </p>
                                                      </div>
                                                      <div className="min-w-[120px] text-right">
                                                        <p className="text-sm text-muted-foreground">Показания:</p>
                                                        <p className="text-lg font-semibold">
                                                          {sensorReading || '—'}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSensor(sensor.id)}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
              <CardContent>
                {plotSensors.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      plotSensors.reduce((acc: any, sensor: any) => {
                        const zoneName = sensor.zone?.name || 'Без зоны';
                        if (!acc[zoneName]) acc[zoneName] = [];
                        acc[zoneName].push(sensor);
                        return acc;
                      }, {})
                    ).map(([zoneName, zoneSensors]: [string, any]) => (
                      <SensorZone key={zoneName} zoneName={zoneName} sensors={zoneSensors} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Датчики не добавлены. Нажмите "Настроить датчики" для добавления.
                  </p>
                )}
              </CardContent>
              </Card>
            );
          })}
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

      {/* Sensor API Settings Dialog */}
      <SensorSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        settings={sensorApiSettings}
        onSettingsChange={setSensorApiSettings}
        onSave={handleSaveSensorSettings}
      />
    </div>
  );
}
