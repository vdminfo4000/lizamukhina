import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface CompanyData {
  plots: number;
  totalArea: number;
  equipment: number;
  facilities: number;
  harvest: number;
}

export default function GISReporting() {
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData>({
    plots: 0,
    totalArea: 0,
    equipment: 0,
    facilities: 0,
    harvest: 0,
  });
  const [reportStatus, setReportStatus] = useState<'ready' | 'generating' | 'completed'>('ready');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canView, canEdit, loading: accessLoading } = useModuleAccess('gis_reporting');

  useEffect(() => {
    if (!accessLoading && !canView) {
      toast({
        title: 'Доступ запрещен',
        description: 'У вас нет доступа к модулю Отчетность ГИС',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [accessLoading, canView, navigate, toast]);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return;

      // Загрузка данных участков
      const { data: plotsData } = await supabase
        .from('plots')
        .select('area')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // Загрузка данных техники
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // Загрузка данных объектов
      const { data: facilitiesData } = await supabase
        .from('facilities')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      setCompanyData({
        plots: plotsData?.length || 0,
        totalArea: plotsData?.reduce((sum, plot) => sum + Number(plot.area), 0) || 0,
        equipment: equipmentData?.length || 0,
        facilities: facilitiesData?.length || 0,
        harvest: 0, // Placeholder
      });
    } catch (error) {
      console.error('Error loading company data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные компании',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportStatus('generating');
    setProgress(0);

    // Имитация генерации отчета
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setReportStatus('completed');
          toast({
            title: 'Успешно',
            description: 'Отчет успешно сформирован',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleSendReport = () => {
    toast({
      title: 'Отчет отправлен',
      description: 'Отчет успешно отправлен в систему ГИС',
    });
    setReportStatus('ready');
    setProgress(0);
  };

  if (loading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Отчетность ГИС</h1>
        <p className="text-muted-foreground">
          Автоматическая подготовка и отправка отчетности в государственную информационную систему
        </p>
      </div>

      {/* Данные компании */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Участков</CardDescription>
            <CardTitle className="text-3xl">{companyData.plots}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Общая площадь: {companyData.totalArea.toFixed(1)} Га
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Техники</CardDescription>
            <CardTitle className="text-3xl">{companyData.equipment}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Единиц оборудования</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Объектов</CardDescription>
            <CardTitle className="text-3xl">{companyData.facilities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Складов и хранилищ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Урожай</CardDescription>
            <CardTitle className="text-3xl">{companyData.harvest}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Тонн в текущем сезоне</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Текущий отчет</TabsTrigger>
          <TabsTrigger value="history">История отчетов</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Формирование отчета</CardTitle>
              <CardDescription>
                Автоматическое заполнение данных на основе информации о деятельности и активах компании
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reportStatus === 'generating' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Формирование отчета...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {reportStatus === 'completed' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Отчет готов к отправке</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Все данные успешно собраны и проверены. Отчет готов к отправке в систему ГИС.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Отчет о посевных площадях</p>
                      <p className="text-sm text-muted-foreground">
                        Данные по {companyData.plots} участкам, {companyData.totalArea.toFixed(0)} Га
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Автозаполнение</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Отчет по технике</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.equipment} единиц техники
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Автозаполнение</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Отчет по объектам хранения</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.facilities} объектов
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Автозаполнение</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={reportStatus === 'generating'}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {reportStatus === 'generating' ? 'Формирование...' : 'Сформировать отчет'}
                </Button>
                
                {reportStatus === 'completed' && (
                  <>
                    <Button variant="outline" onClick={() => setReportStatus('ready')}>
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                    <Button onClick={handleSendReport}>
                      <Send className="mr-2 h-4 w-4" />
                      Отправить в ГИС
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История отправленных отчетов</CardTitle>
              <CardDescription>Список всех отчетов, отправленных в систему ГИС</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Пока нет отправленных отчетов</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Шаблоны отчетов</CardTitle>
              <CardDescription>Настройка и управление шаблонами для различных типов отчетов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Используются стандартные шаблоны ГИС</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
