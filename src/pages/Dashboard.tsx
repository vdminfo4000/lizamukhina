import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Database, LineChart, Activity, ShoppingCart, Shield, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
];

const stats = [
  { label: "Активных участков", value: "3", unit: "участка", trend: "+0%" },
  { label: "Общая площадь", value: "30", unit: "Га", trend: "+0%" },
  { label: "Активных сделок", value: "0", unit: "сделок", trend: "+0%" },
  { label: "Датчиков онлайн", value: "12", unit: "устройств", trend: "+2" },
];

export default function Dashboard() {
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
        {stats.map((stat) => (
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

      {/* Modules Grid */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Модули системы</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.title} to={module.href}>
                <Card className="transition-all hover:shadow-elevated hover:scale-[1.02] cursor-pointer shadow-card">
                  <CardHeader>
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle className="text-foreground">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full">
                      Открыть модуль →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
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
