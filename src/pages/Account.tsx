import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Tractor, Warehouse } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const company = {
  name: "ООО «СМП СХ»",
  inn: "7701234567",
  ogrn: "1027700012345",
  kpp: "770101001",
  director: "Иванов Иван Иванович",
  taxSystem: "ЕСХН",
  address: "Запорожская область, улица 50-летия победы 12, оф. 7",
};

const plots = [
  {
    id: 1,
    name: "Участок 1",
    cadastral: "77:01:0001070:1033",
    area: "10 Га",
    type: "Собственность",
    crop: "Пшеница озимая",
  },
  {
    id: 2,
    name: "Участок 2",
    cadastral: "77:01:0044470:1033",
    area: "13 Га",
    type: "Аренда",
    crop: "Ячмень",
  },
  {
    id: 3,
    name: "Участок 3",
    cadastral: "77:01:0055570:1033",
    area: "7 Га",
    type: "Пользование",
    crop: "Подсолнечник",
  },
];

const equipment = [
  { name: "Комбайн", model: "John Deere S780", sts: "77АВ123456" },
  { name: "Трактор", model: "New Holland T7.290", sts: "77АВ234567" },
  { name: "Плуг", model: "Lemken EurOpal 7X", sts: "-" },
];

const facilities = [
  { type: "Склад", address: "с. Петровка, ул. Полевая 5", area: "1000 м²" },
  { type: "Элеватор", address: "с. Петровка, ул. Заводская 12", capacity: "5000 т" },
];

export default function Account() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Аккаунт компании</h1>
        <p className="text-muted-foreground">
          Управление профилем организации и объектами производства
        </p>
      </div>

      {/* Company Header */}
      <Card className="shadow-card bg-gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  <p className="text-sm opacity-90">{company.taxSystem}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                <MapPin className="h-4 w-4" />
                <span>{company.address}</span>
              </div>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              Производитель продукции
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Реквизиты</TabsTrigger>
          <TabsTrigger value="plots">Участки</TabsTrigger>
          <TabsTrigger value="assets">Имущество</TabsTrigger>
          <TabsTrigger value="banking">Банковские данные</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Информация о компании</CardTitle>
              <CardDescription>Юридические данные организации</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Наименование компании
                  </label>
                  <Input value={company.name} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ИНН</label>
                  <Input value={company.inn} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ОГРН</label>
                  <Input value={company.ogrn} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">КПП</label>
                  <Input value={company.kpp} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Генеральный директор
                  </label>
                  <Input value={company.director} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Система налогообложения
                  </label>
                  <Input value={company.taxSystem} className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Адрес</label>
                  <Input value={company.address} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button>Сохранить изменения</Button>
                <Button variant="outline">Отменить</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plots" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Земельные участки</CardTitle>
                  <CardDescription>Производственные площади</CardDescription>
                </div>
                <Button size="sm">Добавить участок</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plots.map((plot) => (
                  <div
                    key={plot.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-foreground">{plot.name}</h4>
                        <Badge variant="outline">{plot.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Кадастровый номер:{" "}
                          <span className="text-foreground font-medium">{plot.cadastral}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Площадь: <span className="text-foreground font-medium">{plot.area}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Культура: <span className="text-foreground font-medium">{plot.crop}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Редактировать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tractor className="h-5 w-5 text-primary" />
                  <CardTitle>Техника</CardTitle>
                </div>
                <CardDescription>Сельскохозяйственная техника</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipment.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.model}</p>
                      <p className="text-xs text-muted-foreground mt-1">СТС: {item.sts}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Добавить технику
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  <CardTitle>Недвижимость</CardTitle>
                </div>
                <CardDescription>Складские и производственные помещения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facilities.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3">
                      <p className="font-medium text-foreground">{item.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.area || item.capacity}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Добавить объект
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Банковские реквизиты</CardTitle>
              <CardDescription>Данные для финансовых операций</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Расчетный счет
                  </label>
                  <Input placeholder="40702810..." className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">БИК</label>
                  <Input placeholder="044525..." className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Банк</label>
                  <Input placeholder="Название банка" className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Корреспондентский счет
                  </label>
                  <Input placeholder="30101810..." className="mt-1.5" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button>Сохранить данные</Button>
                <Button variant="outline">Отменить</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
