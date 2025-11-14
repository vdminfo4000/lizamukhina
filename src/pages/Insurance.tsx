import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, CheckCircle, Clock, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const insuranceProducts = [
  {
    name: "Страхование урожая",
    coverage: "До 80% стоимости",
    premium: "от 3.5%",
    description: "Защита от неблагоприятных погодных условий",
  },
  {
    name: "Страхование техники",
    coverage: "До 100% стоимости",
    premium: "от 2.8%",
    description: "Полная защита сельхозтехники",
  },
  {
    name: "Страхование сделок",
    coverage: "До 90% суммы",
    premium: "от 1.5%",
    description: "Защита от невыполнения обязательств",
  },
];

const applications = [
  {
    id: "INS-2024-001",
    type: "Страхование урожая",
    crop: "Пшеница озимая",
    area: "10 Га",
    sum: "1,850,000₽",
    status: "approved",
    date: "15.10.2024",
  },
  {
    id: "INS-2024-002",
    type: "Страхование техники",
    asset: "Комбайн John Deere",
    sum: "8,500,000₽",
    status: "pending",
    date: "20.10.2024",
  },
];

export default function Insurance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Страхование</h1>
        <p className="text-muted-foreground">
          Формирование заявок на страхование товаров и сельскохозяйственных рисков
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных полисов</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Одобренных</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">На рассмотрении</p>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Общая сумма</p>
                <p className="text-2xl font-bold text-foreground">15.2М₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Products */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Доступные программы</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {insuranceProducts.map((product) => (
            <Card key={product.name} className="shadow-card">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Покрытие:</span>
                    <span className="font-medium text-foreground">{product.coverage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Премия:</span>
                    <span className="font-medium text-foreground">{product.premium}</span>
                  </div>
                  <Button className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Оформить заявку
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Applications */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Активные заявки</TabsTrigger>
          <TabsTrigger value="new">Новая заявка</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Текущие заявки</CardTitle>
              <CardDescription>Заявки в обработке и активные полисы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <p className="font-semibold text-foreground">{app.id}</p>
                        {app.status === "approved" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Одобрено
                          </Badge>
                        ) : (
                          <Badge variant="secondary">На рассмотрении</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Тип: <span className="text-foreground font-medium">{app.type}</span>
                        </p>
                        {app.crop && (
                          <p className="text-muted-foreground">
                            Культура: <span className="text-foreground font-medium">{app.crop}</span>
                          </p>
                        )}
                        {app.asset && (
                          <p className="text-muted-foreground">
                            Объект: <span className="text-foreground font-medium">{app.asset}</span>
                          </p>
                        )}
                        {app.area && (
                          <p className="text-muted-foreground">
                            Площадь: <span className="text-foreground font-medium">{app.area}</span>
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Сумма: <span className="text-foreground font-medium">{app.sum}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Дата: <span className="text-foreground font-medium">{app.date}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                      {app.status === "approved" && (
                        <Button size="sm">Скачать полис</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Создать новую заявку</CardTitle>
              <CardDescription>Заполните форму для подачи заявки на страхование</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Тип страхования</label>
                  <Input placeholder="Выберите тип" className="mt-1.5" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Объект страхования</label>
                    <Input placeholder="Например: Пшеница озимая" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Площадь/Количество</label>
                    <Input placeholder="10 Га" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Страховая сумма (₽)</label>
                    <Input type="number" placeholder="1850000" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Период страхования</label>
                    <Input placeholder="12 месяцев" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Дополнительная информация</label>
                  <textarea
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={4}
                    placeholder="Укажите дополнительные детали..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <FileText className="h-4 w-4" />
                    Отправить заявку
                  </Button>
                  <Button variant="outline">Сохранить черновик</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>История заявок</CardTitle>
              <CardDescription>Архив завершенных заявок и полисов</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground py-8">
                Завершенных заявок пока нет
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
