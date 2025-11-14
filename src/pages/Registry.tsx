import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Search, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const products = [
  { id: "P001", name: "Пшеница озимая", category: "Зерновые", quantity: "150 т", status: "active", integration: "1С" },
  { id: "P002", name: "Ячмень", category: "Зерновые", quantity: "80 т", status: "active", integration: "SAP" },
  { id: "P003", name: "Кукуруза", category: "Зерновые", quantity: "120 т", status: "pending", integration: "-" },
  { id: "P004", name: "Подсолнечник", category: "Масличные", quantity: "90 т", status: "active", integration: "1С" },
];

const integrations = [
  { name: "1С:Предприятие", status: "connected", lastSync: "10 мин назад" },
  { name: "SAP ERP", status: "connected", lastSync: "1 час назад" },
  { name: "ФГИС Меркурий", status: "pending", lastSync: "-" },
  { name: "ВетИС", status: "disconnected", lastSync: "3 дня назад" },
];

export default function Registry() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Реестр продукции</h1>
        <p className="text-muted-foreground">
          Управление номенклатурой и интеграция с внешними системами
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего позиций</p>
                <p className="mt-2 text-2xl font-bold text-foreground">127</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных</p>
                <p className="mt-2 text-2xl font-bold text-foreground">115</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Интеграций</p>
                <p className="mt-2 text-2xl font-bold text-foreground">4</p>
              </div>
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Синхронизация</p>
                <p className="mt-2 text-2xl font-bold text-foreground">98%</p>
              </div>
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products List */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Номенклатура продукции</CardTitle>
                  <CardDescription>Список всех товаров и материалов</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить
                </Button>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или коду..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Интеграция</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.integration}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        ) : (
                          <Badge variant="secondary">Ожидает</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Integrations */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Внешние интеграции</CardTitle>
              <CardDescription>Подключенные системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-start justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {integration.status === "connected" && (
                        <div className="h-2 w-2 rounded-full bg-green-600" />
                      )}
                      {integration.status === "pending" && (
                        <div className="h-2 w-2 rounded-full bg-amber-600" />
                      )}
                      {integration.status === "disconnected" && (
                        <div className="h-2 w-2 rounded-full bg-red-600" />
                      )}
                      <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {integration.lastSync}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Добавить интеграцию
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
