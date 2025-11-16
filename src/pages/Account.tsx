import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddPlotDialog } from "@/components/forms/AddPlotDialog";

interface Company {
  id: string;
  name: string;
  inn: string | null;
  ogrn: string | null;
  director: string | null;
  email: string | null;
  phone: string | null;
  legal_address: string | null;
  address: string | null;
}

interface Plot {
  id: string;
  cadastral_number: string;
  area: number;
  crop: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
}

export default function Account() {
  const [company, setCompany] = useState<Company | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Editable company fields
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get company_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    setCompanyId(profile.company_id);

    // Load company data
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();

    if (companyData) {
      setCompany(companyData);
      setEditedCompany(companyData);
    }

    // Load plots
    const { data: plotsData } = await supabase
      .from('plots')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (plotsData) setPlots(plotsData);

    setLoading(false);
  };

  const handleSaveCompany = async () => {
    if (!editedCompany || !companyId) return;

    setSaving(true);

    const { error } = await supabase
      .from('companies')
      .update({
        name: editedCompany.name,
        inn: editedCompany.inn,
        ogrn: editedCompany.ogrn,
        director: editedCompany.director,
        email: editedCompany.email,
        phone: editedCompany.phone,
        legal_address: editedCompany.legal_address,
        address: editedCompany.address,
      })
      .eq('id', companyId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setCompany(editedCompany);
      toast({
        title: 'Успешно',
        description: 'Данные компании обновлены',
      });
    }

    setSaving(false);
  };

  const deletePlot = async (id: string) => {
    const { error } = await supabase.from('plots').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Успешно', description: 'Участок удален' });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!company || !editedCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Данные компании не найдены</p>
      </div>
    );
  }

  const totalArea = plots.reduce((sum, plot) => sum + Number(plot.area), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Аккаунт компании</h1>
        <p className="text-muted-foreground">
          Управление профилем организации и земельными участками
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
                  <p className="text-sm opacity-90">ИНН: {company.inn || 'Не указан'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                <MapPin className="h-4 w-4" />
                <span>{company.address || 'Адрес не указан'}</span>
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
          <TabsTrigger value="plots">Участки ({plots.length})</TabsTrigger>
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
                  <Label htmlFor="name">Наименование организации</Label>
                  <Input
                    id="name"
                    value={editedCompany.name}
                    onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="inn">ИНН</Label>
                  <Input
                    id="inn"
                    value={editedCompany.inn || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, inn: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ogrn">ОГРН</Label>
                  <Input
                    id="ogrn"
                    value={editedCompany.ogrn || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, ogrn: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="director">Директор</Label>
                  <Input
                    id="director"
                    value={editedCompany.director || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, director: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedCompany.email || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={editedCompany.phone || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="legal_address">Юридический адрес</Label>
                  <Input
                    id="legal_address"
                    value={editedCompany.legal_address || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, legal_address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Фактический адрес</Label>
                  <Input
                    id="address"
                    value={editedCompany.address || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
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
                  <CardDescription>
                    Всего участков: {plots.length} • Общая площадь: {totalArea.toFixed(2)} Га
                  </CardDescription>
                </div>
                {companyId && (
                  <AddPlotDialog companyId={companyId} onSuccess={loadData} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {plots.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет данных о земельных участках</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Добавьте первый участок, чтобы начать управление
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Кадастровый номер</TableHead>
                      <TableHead>Площадь (Га)</TableHead>
                      <TableHead>Культура</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plots.map((plot) => (
                      <TableRow key={plot.id}>
                        <TableCell className="font-medium">{plot.cadastral_number}</TableCell>
                        <TableCell>{plot.area}</TableCell>
                        <TableCell>{plot.crop || '-'}</TableCell>
                        <TableCell>{plot.address || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={plot.status === 'active' ? 'default' : 'secondary'}>
                            {plot.status === 'active' ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePlot(plot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
