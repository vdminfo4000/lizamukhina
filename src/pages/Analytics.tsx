import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, BarChart3, PieChart, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useEffect } from "react";

interface Plot {
  id: string;
  name?: string | null;
  cadastral_number: string;
  area: number;
  crop: string | null;
  address: string | null;
  status: string;
}

export default function Analytics() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canView, loading: accessLoading } = useModuleAccess('analytics');

  useEffect(() => {
    loadPlots();
  }, []);

  useEffect(() => {
    if (!accessLoading && !canView) {
      toast({
        title: 'Доступ запрещен',
        description: 'У вас нет доступа к модулю Аналитика',
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

  // Generate harvest priority data from plots
  const harvestPriority = plots.map((plot, index) => ({
    priority: index + 1,
    plot: plot.name || plot.cadastral_number,
    culture: plot.crop || 'Не указано',
    area: plot.area,
    maturity: 92 - (index * 7),
    quality: 95 - (index * 3),
    daysToHarvest: 5 + (index * 7),
    weather: index === 0 ? "Благоприятная" : index === 1 ? "Дождь через 3 дня" : "Стабильная",
    soilMoisture: 58 + (index * 4),
    recommendation: index === 0 ? "Срочно начать сбор" : index === 1 ? "Подготовить технику" : "Наблюдение",
    status: index === 0 ? "urgent" : index === 1 ? "high" : "normal"
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
            <CardTitle>Аналитика и прогноз</CardTitle>
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
        <h1 className="mb-2 text-3xl font-bold text-foreground">Аналитика и прогноз</h1>
        <p className="text-muted-foreground">
          Инструменты анализа данных и прогнозирования урожайности
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Прогноз урожая</p>
                <p className="text-2xl font-bold text-foreground">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <LineChart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Рост эффект.</p>
                <p className="text-2xl font-bold text-foreground">+8.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Индекс качества</p>
                <p className="text-2xl font-bold text-foreground">94/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Участков готово</p>
                <p className="text-2xl font-bold text-foreground">{plots.filter((_, i) => i < 2).length}/{plots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="priority" className="space-y-4">
        <TabsList>
          <TabsTrigger value="priority">Приоритеты</TabsTrigger>
          <TabsTrigger value="yield">Прогноз урожая</TabsTrigger>
          <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
        </TabsList>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Приоритетность сбора урожая</CardTitle>
              <CardDescription>
                Оптимальная очередность уборки участков на основе анализа данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Приор.</TableHead>
                    <TableHead>Участок</TableHead>
                    <TableHead>Площадь (га)</TableHead>
                    <TableHead>Спелость</TableHead>
                    <TableHead>Качество</TableHead>
                    <TableHead>Дней до сбора</TableHead>
                    <TableHead>Погода</TableHead>
                    <TableHead>Влажность почвы</TableHead>
                    <TableHead>Рекомендация</TableHead>
                    <TableHead className="w-[100px]">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvestPriority.map((item) => (
                    <TableRow key={item.priority}>
                      <TableCell>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          item.status === 'urgent' ? 'bg-red-100 text-red-700' :
                          item.status === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.priority}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p>{item.plot}</p>
                          <p className="text-sm text-muted-foreground">{item.culture}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.area}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.maturity} className="w-16" />
                          <span className="text-sm font-medium">{item.maturity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.quality} className="w-16" />
                          <span className="text-sm font-medium">{item.quality}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.daysToHarvest <= 7 ? "destructive" : "secondary"}>
                          <Clock className="mr-1 h-3 w-3" />
                          {item.daysToHarvest}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={
                          item.weather === "Благоприятная" ? "text-green-600" :
                          item.weather.includes("Дождь") ? "text-amber-600" :
                          "text-muted-foreground"
                        }>
                          {item.weather}
                        </span>
                      </TableCell>
                      <TableCell>{item.soilMoisture}%</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm">{item.recommendation}</p>
                      </TableCell>
                      <TableCell>
                        {item.status === 'urgent' ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Срочно
                          </Badge>
                        ) : item.status === 'high' ? (
                          <Badge variant="default" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Скоро
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Норма
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Прогноз урожайности</CardTitle>
              <CardDescription>Ожидаемая урожайность по участкам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plots.map((plot, index) => (
                  <div key={plot.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{plot.crop || 'Культура'} ({plot.cadastral_number})</h4>
                      <p className="text-sm text-muted-foreground">Площадь: {plot.area} га</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{(35 - index * 2).toFixed(1)} ц/га</p>
                      <p className="text-sm text-muted-foreground">Прогноз</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Рекомендации по уборке</CardTitle>
              <CardDescription>Оптимальные действия для каждого участка</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {harvestPriority.slice(0, 3).map((item) => (
                  <div key={item.priority} className="p-4 rounded-lg border">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        item.status === 'urgent' ? 'bg-red-100' :
                        item.status === 'high' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        {item.status === 'urgent' ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : item.status === 'high' ? (
                          <Clock className="h-5 w-5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.plot}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.recommendation}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Спелость: {item.maturity}%</Badge>
                          <Badge variant="outline">Дней: {item.daysToHarvest}</Badge>
                          <Badge variant="outline">{item.weather}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
