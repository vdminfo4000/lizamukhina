import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Database, LineChart, Activity, ShoppingCart, Shield, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    title: "Реестр продукции",
    description: "Управление продукцией и интеграция с внешними системами",
    icon: Database,
    href: "/registry",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Аналитика и прогноз",
    description: "Инструменты сопоставления и анализа данных",
    icon: LineChart,
    href: "/analytics",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Мониторинг урожая",
    description: "Отслеживание показателей с датчиков в реальном времени",
    icon: Activity,
    href: "/monitoring",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Товарная биржа",
    description: "Торговая площадка с объявлениями и биржа с/х урожая",
    icon: ShoppingCart,
    href: "/exchange",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Страхование",
    description: "Формирование заявок для страхования товаров и сделок",
    icon: Shield,
    href: "/insurance",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Отчетность ГИС",
    description: "Автоматическое формирование и отправка отчетности",
    icon: FileText,
    href: "/gis-reporting",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

interface DashboardStats {
  activePlots: number;
  totalArea: number;
  activeDeals: number;
  onlineSensors: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activePlots: 0,
    totalArea: 0,
    activeDeals: 0,
    onlineSensors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get active plots count and total area
      const { data: plotsData } = await supabase
        .from('plots')
        .select('area, status')
        .eq('status', 'active');

      const activePlots = plotsData?.length || 0;
      const totalArea = plotsData?.reduce((sum, plot) => sum + Number(plot.area), 0) || 0;

      // Get active deals count (assuming deals are stored in a table, adjust if needed)
      // For now, using a placeholder value of 0
      const activeDeals = 0;

      // Get online sensors count (assuming there's a sensors table or monitoring data)
      // For now, using a placeholder value of 12
      const onlineSensors = 12;

      setStats({
        activePlots,
        totalArea: Math.round(totalArea * 10) / 10, // Round to 1 decimal
        activeDeals,
        onlineSensors,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: "Активных участков", 
      value: loading ? "..." : stats.activePlots.toString(), 
      unit: "участка", 
      trend: "+0%" 
    },
    { 
      label: "Общая площадь", 
      value: loading ? "..." : stats.totalArea.toString(), 
      unit: "Га", 
      trend: "+0%" 
    },
    { 
      label: "Активных сделок", 
      value: loading ? "..." : stats.activeDeals.toString(), 
      unit: "сделок", 
      trend: "+0%" 
    },
    { 
      label: "Датчиков онлайн", 
      value: loading ? "..." : stats.onlineSensors.toString(), 
      unit: "устройств", 
      trend: "+2" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white shadow-elevated">
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold">
            Система мониторинга и прогнозирования
          </h1>
          <p className="mb-6 text-lg opacity-90">
            Комплексное управление сельскохозяйственным производством
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/account">
              <Button variant="secondary" size="lg">
                Профиль компании
              </Button>
            </Link>
            <Link to="/monitoring">
              <Button variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Перейти к мониторингу
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.unit}</p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-primary">{stat.trend}</span> за последний месяц
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle>Последние уведомления</CardTitle>
          </div>
          <CardDescription>Важные события и обновления системы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Новые данные от датчиков влажности
                </p>
                <p className="text-xs text-muted-foreground">Участок 1 • 10 минут назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Обновлен прогноз урожайности
                </p>
                <p className="text-xs text-muted-foreground">Аналитика • 2 часа назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Добавлен новый товар на биржу
                </p>
                <p className="text-xs text-muted-foreground">Товарная биржа • 5 часов назад</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
