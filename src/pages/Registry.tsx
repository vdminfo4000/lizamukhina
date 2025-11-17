import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Warehouse, Tractor, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddPlotDialog } from "@/components/forms/AddPlotDialog";
import { AddEquipmentDialog } from "@/components/forms/AddEquipmentDialog";
import { AddFacilityDialog } from "@/components/forms/AddFacilityDialog";

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

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string | null;
  year: number | null;
  status: string;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  capacity: string | null;
  address: string | null;
  status: string;
}

export default function Registry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plots, setPlots] = useState<Plot[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Get user's company ID
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

    setCompanyId(profile.company_id);

    // Load plots
    const { data: plotsData } = await supabase
      .from('plots')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (plotsData) setPlots(plotsData);

    // Load equipment
    const { data: equipmentData } = await supabase
      .from('equipment')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (equipmentData) setEquipment(equipmentData);

    // Load facilities
    const { data: facilitiesData } = await supabase
      .from('facilities')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (facilitiesData) setFacilities(facilitiesData);

    setLoading(false);
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

  const deleteEquipment = async (id: string) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    
    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Успешно', description: 'Техника удалена' });
      loadData();
    }
  };

  const deleteFacility = async (id: string) => {
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    
    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Успешно', description: 'Объект удален' });
      loadData();
    }
  };

  const totalArea = plots.reduce((sum, plot) => sum + Number(plot.area), 0);

  const filteredPlots = plots.filter((item) =>
    item.cadastral_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.crop?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.address?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Реестр активов</h1>
        <p className="text-muted-foreground">
          Управление техникой и объектами
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Участки</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{plots.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Площадь: {totalArea.toFixed(2)} Га
                </p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Техника</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{equipment.length}</p>
              </div>
              <Tractor className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Объектов</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{facilities.length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plots">Участки</TabsTrigger>
          <TabsTrigger value="equipment">Техника</TabsTrigger>
          <TabsTrigger value="facilities">Объекты</TabsTrigger>
        </TabsList>

        <TabsContent value="plots" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Земельные участки</CardTitle>
                  <CardDescription>Список участков компании</CardDescription>
                </div>
                {companyId && (
                  <AddPlotDialog companyId={companyId} onSuccess={loadData} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredPlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Участки не найдены</p>
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
                    {filteredPlots.map((plot) => (
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

        <TabsContent value="equipment" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Сельхозтехника</CardTitle>
                  <CardDescription>Список техники компании</CardDescription>
                </div>
                {companyId && <AddEquipmentDialog companyId={companyId} onSuccess={loadData} />}
              </div>
            </CardHeader>
            <CardContent>
              {filteredEquipment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных. Добавьте первую технику.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Год</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.model || '-'}</TableCell>
                        <TableCell>{item.year || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {item.status === 'active' ? 'Активен' : item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEquipment(item.id)}
                            title="Удалить"
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

        <TabsContent value="facilities" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Объекты и сооружения</CardTitle>
                  <CardDescription>Склады, ангары и другие объекты</CardDescription>
                </div>
                {companyId && <AddFacilityDialog companyId={companyId} onSuccess={loadData} />}
              </div>
            </CardHeader>
            <CardContent>
              {filteredFacilities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных. Добавьте первый объект.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Вместимость</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFacilities.map((facility) => (
                      <TableRow key={facility.id}>
                        <TableCell className="font-medium">{facility.name}</TableCell>
                        <TableCell>{facility.type}</TableCell>
                        <TableCell>{facility.capacity || '-'}</TableCell>
                        <TableCell>{facility.address || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {facility.status === 'active' ? 'Активен' : facility.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFacility(facility.id)}
                            title="Удалить"
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
