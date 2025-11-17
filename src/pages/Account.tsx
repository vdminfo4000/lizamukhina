import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

export default function Account() {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();

    if (companyData) {
      setCompany(companyData);
      setEditedCompany(companyData);
    }

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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Аккаунт компании</h1>
        <p className="text-muted-foreground">
          Управление профилем организации
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  <p className="text-sm text-muted-foreground">ИНН: {company.inn || 'Не указан'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{company.address || 'Адрес не указан'}</span>
              </div>
            </div>
            <Badge variant="secondary">
              Производитель продукции
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Компания</TabsTrigger>
          <TabsTrigger value="employees" onClick={() => navigate('/employees')}>Сотрудники</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
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

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
