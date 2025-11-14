import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, BarChart3, PieChart, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Данные приоритетности сбора урожая
const harvestPriority = [
  { 
    priority: 1, 
    plot: "Участок 2", 
    culture: "Ячмень", 
    maturity: 92, 
    quality: 95, 
    daysToHarvest: 5,
    weather: "Благоприятная",
    soilMoisture: 58,
    recommendation: "Срочно начать сбор",
    status: "urgent"
  },
  { 
    priority: 2, 
    plot: "Участок 1", 
    culture: "Пшеница озимая", 
    maturity: 85, 
    quality: 88, 
    daysToHarvest: 12,
    weather: "Дождь через 3 дня",
    soilMoisture: 65,
    recommendation: "Подготовить технику",
    status: "high"
  },
  { 
    priority: 3, 
    plot: "Участок 3", 
    culture: "Кукуруза", 
    maturity: 65, 
    quality: 82, 
    daysToHarvest: 35,
    weather: "Стабильная",
    soilMoisture: 62,
    recommendation: "Наблюдение",
    status: "normal"
  },
];

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
      <Tabs defaultValue="priority" className="space-y-4">
        <TabsList>
          <TabsTrigger value="priority">Приоритет сбора</TabsTrigger>
          <TabsTrigger value="forecast">Прогнозирование</TabsTrigger>
          <TabsTrigger value="comparison">Сопоставление</TabsTrigger>
          <TabsTrigger value="efficiency">Эффективность</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        {/* Harvest Priority Tab */}
        <TabsContent value="priority" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Приоритетность сбора урожая</CardTitle>
              <CardDescription>
                Аналитика на основе данных о созревании, погодных условиях и состоянии почвы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Приоритет</TableHead>
                    <TableHead>Участок</TableHead>
                    <TableHead>Культура</TableHead>
                    <TableHead>Зрелость</TableHead>
                    <TableHead>Качество</TableHead>
                    <TableHead>До сбора</TableHead>
                    <TableHead>Погода</TableHead>
                    <TableHead>Влажность почвы</TableHead>
                    <TableHead>Рекомендация</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvestPriority.map((item) => (
                    <TableRow key={item.priority}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.status === "urgent" && <AlertCircle className="h-5 w-5 text-red-600" />}
                          {item.status === "high" && <Clock className="h-5 w-5 text-amber-600" />}
                          {item.status === "normal" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          <span className="font-bold">{item.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.plot}</TableCell>
                      <TableCell>{item.culture}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress value={item.maturity} className="h-2 w-20" />
                            <span className="text-sm font-medium">{item.maturity}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.quality >= 90 ? "default" : "secondary"}>
                          {item.quality}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.daysToHarvest <= 7 ? "font-bold text-red-600" : ""}>
                          {item.daysToHarvest} дней
                        </span>
                      </TableCell>
                      <TableCell>{item.weather}</TableCell>
                      <TableCell>{item.soilMoisture}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "urgent" ? "destructive" : 
                            item.status === "high" ? "default" : 
                            "secondary"
                          }
                        >
                          {item.recommendation}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Weather and Soil Analytics */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Прогноз погоды и рекомендации</CardTitle>
                <CardDescription>Влияние погодных условий на сроки сбора</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Ближайшие 3 дня</h4>
                    <Badge>Благоприятно</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Устойчивая сухая погода. Оптимальные условия для сбора ячменя и пшеницы.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Через 3-5 дней</h4>
                    <Badge variant="default">Внимание</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ожидаются дожди. Рекомендуется завершить сбор на Участке 2 до начала осадков.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">6-7 дней</h4>
                    <Badge variant="secondary">Стабильно</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Возвращение сухой погоды. Возможен сбор на Участке 1 после улучшения условий.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Анализ состояния почвы</CardTitle>
                <CardDescription>Влияние параметров почвы на качество урожая</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Участок 1 - Влажность</span>
                    <span className="text-sm text-muted-foreground">65% (оптимально)</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Участок 2 - Влажность</span>
                    <span className="text-sm text-red-600">42% (низкая)</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Участок 3 - Влажность</span>
                    <span className="text-sm text-muted-foreground">62% (оптимально)</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2 text-blue-900">Рекомендация</h4>
                  <p className="text-sm text-blue-800">
                    Низкая влажность на Участке 2 способствует быстрому созреванию. 
                    Рекомендуется ускорить сбор для сохранения качества зерна.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
