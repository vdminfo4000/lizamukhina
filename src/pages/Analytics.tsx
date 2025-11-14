import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  return (
    <div className="space-y-6">
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
                <p className="text-sm font-medium text-muted-foreground">Доходность</p>
                <p className="text-2xl font-bold text-foreground">23.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Прогнозирование</TabsTrigger>
          <TabsTrigger value="comparison">Сопоставление</TabsTrigger>
          <TabsTrigger value="efficiency">Эффективность</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Прогноз урожайности</CardTitle>
                <CardDescription>На основе данных мониторинга и погодных условий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Пшеница озимая</p>
                      <span className="text-sm text-green-600 font-medium">+15%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gradient-primary" style={{ width: "75%" }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Прогноз: 4.2 т/га • Участок 1
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Ячмень</p>
                      <span className="text-sm text-green-600 font-medium">+8%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gradient-primary" style={{ width: "68%" }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Прогноз: 3.5 т/га • Участок 2
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Подсолнечник</p>
                      <span className="text-sm text-green-600 font-medium">+12%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gradient-primary" style={{ width: "82%" }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Прогноз: 2.8 т/га • Участок 3
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Модели прогнозирования</CardTitle>
                <CardDescription>Используемые алгоритмы и точность</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">Модель машинного обучения</p>
                      <p className="text-sm text-muted-foreground">Random Forest Regression</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">92.5%</p>
                      <p className="text-xs text-muted-foreground">точность</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">Погодная модель</p>
                      <p className="text-sm text-muted-foreground">Weather API Integration</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">88.3%</p>
                      <p className="text-xs text-muted-foreground">точность</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">Историческая модель</p>
                      <p className="text-sm text-muted-foreground">5 лет данных</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">85.7%</p>
                      <p className="text-xs text-muted-foreground">точность</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Сопоставление данных</CardTitle>
              <CardDescription>
                Корреляция между показателями мониторинга и внешними системами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-foreground">Влажность почвы vs Погодные данные</p>
                    <span className="text-sm text-primary font-medium">Корреляция: 0.87</span>
                  </div>
                  <div className="h-32 rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">График корреляции</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-foreground">Температура vs Рост культур</p>
                    <span className="text-sm text-primary font-medium">Корреляция: 0.79</span>
                  </div>
                  <div className="h-32 rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">График корреляции</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Анализ эффективности</CardTitle>
              <CardDescription>Показатели производственной эффективности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Затраты на Га</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">45,230₽</p>
                  <p className="mt-1 text-xs text-green-600">-5.2% от прошлого года</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Доход на Га</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">89,450₽</p>
                  <p className="mt-1 text-xs text-green-600">+12.8% от прошлого года</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Рентабельность</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">97.8%</p>
                  <p className="mt-1 text-xs text-green-600">+18.3% от прошлого года</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Отчеты</CardTitle>
              <CardDescription>Сформированные аналитические отчеты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Отчет по урожайности за 2024</p>
                    <p className="text-sm text-muted-foreground">Сформирован 01.11.2024</p>
                  </div>
                  <Button variant="outline" size="sm">Скачать</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Анализ эффективности Q3 2024</p>
                    <p className="text-sm text-muted-foreground">Сформирован 30.09.2024</p>
                  </div>
                  <Button variant="outline" size="sm">Скачать</Button>
                </div>
                <Button variant="outline" className="w-full">Создать новый отчет</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
