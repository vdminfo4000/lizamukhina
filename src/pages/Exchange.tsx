import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, Plus, Trash2, Phone, Wheat, Tractor, Truck, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const marketPrices = [
  { crop: "Пшеница", price: "18,500₽", change: "+2.3%", trend: "up", volume: "2,450 т" },
  { crop: "Ячмень", price: "15,200₽", change: "-1.1%", trend: "down", volume: "1,870 т" },
  { crop: "Кукуруза", price: "16,800₽", change: "+3.7%", trend: "up", volume: "3,120 т" },
  { crop: "Подсолнечник", price: "32,400₽", change: "+1.8%", trend: "up", volume: "890 т" },
];

interface Listing {
  id: string;
  company_id: string;
  user_id: string;
  listing_type: string;
  category: string;
  title: string;
  description: string | null;
  price: number | null;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  status: string;
  created_at: string;
  contact_info: any;
  companies?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export default function Exchange() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListing, setNewListing] = useState({
    listing_type: "supply",
    category: "crops",
    title: "",
    description: "",
    price: "",
    quantity: "",
    unit: "т",
    location: "",
    contact_phone: "",
    contact_email: "",
  });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView, canEdit, loading: accessLoading } = useModuleAccess('exchange');
  const { logAction } = useAuditLog();

  useEffect(() => {
    if (!accessLoading && !canView) {
      toast({
        title: 'Доступ запрещён',
        description: 'У вас нет доступа к модулю Товарная биржа',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [accessLoading, canView, navigate, toast]);

  useEffect(() => {
    if (user) {
      loadListings();
      loadMyListings();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          *,
          companies:company_id(name, phone, email)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          *,
          companies:company_id(name, phone, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      console.error('Error loading my listings:', error);
    }
  };

  const handleCreateListing = async () => {
    if (!user || !canEdit) {
      toast({
        title: 'Ошибка',
        description: 'У вас нет прав на создание объявлений',
        variant: 'destructive',
      });
      return;
    }

    if (!newListing.title || !newListing.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: 'Ошибка',
          description: 'Не найдена компания пользователя',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('market_listings')
        .insert({
          company_id: profile.company_id,
          user_id: user.id,
          listing_type: newListing.listing_type,
          category: newListing.category,
          title: newListing.title,
          crop: newListing.title,
          description: newListing.description || null,
          price: newListing.price ? parseFloat(newListing.price) : null,
          quantity: newListing.quantity ? parseFloat(newListing.quantity) : null,
          unit: newListing.unit || null,
          location: newListing.location || null,
          contact_info: {
            phone: newListing.contact_phone,
            email: newListing.contact_email,
          },
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Объявление создано',
      });

      logAction({
        action: 'create',
        module: 'exchange',
        entityType: 'listing',
        details: {
          title: newListing.title,
          category: newListing.category,
        },
      });

      setNewListing({
        listing_type: "supply",
        category: "crops",
        title: "",
        description: "",
        price: "",
        quantity: "",
        unit: "т",
        location: "",
        contact_phone: "",
        contact_email: "",
      });

      loadListings();
      loadMyListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать объявление',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Объявление удалено',
      });

      logAction({
        action: 'delete',
        module: 'exchange',
        entityType: 'listing',
        entityId: id,
      });

      loadListings();
      loadMyListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить объявление',
        variant: 'destructive',
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crops': return Wheat;
      case 'equipment': return Tractor;
      case 'transport': return Truck;
      case 'facilities': return Building;
      default: return Wheat;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'crops': return 'С/Х Продукция';
      case 'equipment': return 'Техника';
      case 'transport': return 'Грузоперевозки';
      case 'facilities': return 'Объекты';
      default: return category;
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'supply': return 'Предложение';
      case 'demand': return 'Спрос';
      case 'operator': return 'Оператор';
      default: return type;
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Товарная биржа</h1>
        <p className="text-muted-foreground">
          Продажа и покупка сельхозпродукции, аренда техники, грузоперевозки и объектов
        </p>
      </div>

      {/* Market Overview */}
      <Card className="card-3d">
        <CardHeader>
          <CardTitle>Текущие цены на рынке</CardTitle>
          <CardDescription>Средние цены за последние 24 часа</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketPrices.map((item) => (
              <div key={item.crop} className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-1">{item.crop}</p>
                <p className="text-2xl font-bold mb-2">{item.price}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {item.trend === "up" ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                    {item.change}
                  </span>
                  <span className="text-muted-foreground">{item.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="my">Мои объявления</TabsTrigger>
          <TabsTrigger value="crops">С/Х Продукция</TabsTrigger>
          <TabsTrigger value="equipment">Техника</TabsTrigger>
          <TabsTrigger value="transport">Грузоперевозки</TabsTrigger>
          <TabsTrigger value="facilities">Объекты</TabsTrigger>
          <TabsTrigger value="operators">Операторы</TabsTrigger>
        </TabsList>

        {/* My Listings Tab */}
        <TabsContent value="my" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск моих объявлений..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => window.location.hash = '#create'}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить объявление
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myListings.filter(listing =>
              listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((listing) => {
              const CategoryIcon = getCategoryIcon(listing.category);
              return (
                <Card key={listing.id} className="card-3d">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-primary icon-3d" />
                        <div>
                          <CardTitle className="text-lg">{listing.title}</CardTitle>
                          <CardDescription>
                            {getCategoryLabel(listing.category)} • {getListingTypeLabel(listing.listing_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{listing.location || "Не указано"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listing.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {listing.price && (
                            <p className="text-2xl font-bold text-primary">
                              {listing.price.toLocaleString()}₽
                              {listing.unit && listing.quantity && ` / ${listing.unit}`}
                            </p>
                          )}
                          {listing.quantity && (
                            <p className="text-sm text-muted-foreground">
                              Количество: {listing.quantity} {listing.unit}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedListing(listing);
                            setContactDialogOpen(true);
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Контакты
                        </Button>
                      </div>

                      {listing.companies && (
                        <p className="text-xs text-muted-foreground">
                          Продавец: {listing.companies.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {['crops', 'equipment', 'transport', 'facilities'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Поиск в категории ${getCategoryLabel(category)}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setNewListing({ ...newListing, category: category });
                window.location.hash = '#create';
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить объявление
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredListings
                .filter(l => l.category === category)
                .map((listing) => {
                  const CategoryIcon = getCategoryIcon(listing.category);
                  return (
                    <Card key={listing.id} className="card-3d">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-5 w-5 text-primary icon-3d" />
                            <div>
                              <CardTitle className="text-lg">{listing.title}</CardTitle>
                              <CardDescription>
                                {getListingTypeLabel(listing.listing_type)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">{listing.location || "Не указано"}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {listing.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div>
                              {listing.price && (
                                <p className="text-2xl font-bold text-primary">
                                  {listing.price.toLocaleString()}₽
                                  {listing.unit && listing.quantity && ` / ${listing.unit}`}
                                </p>
                              )}
                              {listing.quantity && (
                                <p className="text-sm text-muted-foreground">
                                  Количество: {listing.quantity} {listing.unit}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedListing(listing);
                                setContactDialogOpen(true);
                              }}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Контакты
                            </Button>
                          </div>

                          {listing.companies && (
                            <p className="text-xs text-muted-foreground">
                              Продавец: {listing.companies.name}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle>Операторы продукции</CardTitle>
              <CardDescription>Закупочные цены от операторов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredListings
                  .filter(l => l.listing_type === 'operator')
                  .map((listing) => (
                    <Card key={listing.id} className="widget-3d">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                            <CardDescription>{listing.companies?.name}</CardDescription>
                          </div>
                          <Badge>Оператор</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {listing.description && (
                            <p className="text-sm text-muted-foreground">{listing.description}</p>
                          )}
                          
                          {listing.price && (
                            <div className="p-3 bg-primary/5 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Закупочная цена</p>
                              <p className="text-2xl font-bold text-primary">
                                {listing.price.toLocaleString()}₽ / {listing.unit || 'т'}
                              </p>
                            </div>
                          )}

                          <Button
                            className="w-full"
                            onClick={() => {
                              setSelectedListing(listing);
                              setContactDialogOpen(true);
                            }}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Связаться с оператором
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Listing Section */}
      <Card id="create" className="card-3d">
        <CardHeader>
          <CardTitle>Подать объявление</CardTitle>
          <CardDescription>Создайте новое объявление о продаже, покупке или аренде</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип объявления</Label>
              <Select
                value={newListing.listing_type}
                onValueChange={(value) => setNewListing({ ...newListing, listing_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supply">Предложение</SelectItem>
                  <SelectItem value="demand">Спрос</SelectItem>
                  <SelectItem value="operator">Оператор продукции</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория</Label>
              <Select
                value={newListing.category}
                onValueChange={(value) => setNewListing({ ...newListing, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crops">С/Х Продукция</SelectItem>
                  <SelectItem value="equipment">Аренда техники</SelectItem>
                  <SelectItem value="transport">Грузоперевозки</SelectItem>
                  <SelectItem value="facilities">Аренда объектов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Название объявления *</Label>
              <Input
                placeholder="Например: Пшеница 3 класс"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Описание</Label>
              <Textarea
                placeholder="Подробное описание..."
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Единица измерения</Label>
              <Select
                value={newListing.unit}
                onValueChange={(value) => setNewListing({ ...newListing, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="т">тонна (т)</SelectItem>
                  <SelectItem value="кг">килограмм (кг)</SelectItem>
                  <SelectItem value="га">гектар (га)</SelectItem>
                  <SelectItem value="шт">штука (шт)</SelectItem>
                  <SelectItem value="час">час</SelectItem>
                  <SelectItem value="день">день</SelectItem>
                  <SelectItem value="месяц">месяц</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Количество</Label>
              <Input
                type="number"
                placeholder="0"
                value={newListing.quantity}
                onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Местоположение</Label>
              <Input
                placeholder="Краснодарский край"
                value={newListing.location}
                onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Контактный телефон</Label>
              <Input
                placeholder="+7 (___) ___-__-__"
                value={newListing.contact_phone}
                onChange={(e) => setNewListing({ ...newListing, contact_phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Контактный email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newListing.contact_email}
                onChange={(e) => setNewListing({ ...newListing, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleCreateListing} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Опубликовать объявление
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Listings */}
      <Card className="card-3d">
        <CardHeader>
          <CardTitle>Мои объявления</CardTitle>
          <CardDescription>Управление вашими объявлениями</CardDescription>
        </CardHeader>
        <CardContent>
          {myListings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">У вас пока нет объявлений</p>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => {
                const CategoryIcon = getCategoryIcon(listing.category);
                return (
                  <div key={listing.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 text-primary icon-3d" />
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryLabel(listing.category)} • {getListingTypeLabel(listing.listing_type)}
                          {listing.price && ` • ${listing.price.toLocaleString()}₽`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                        {listing.status === 'active' ? 'Активно' : 'Неактивно'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Контактная информация</DialogTitle>
            <DialogDescription>
              Свяжитесь с продавцом для уточнения деталей
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedListing.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedListing.companies?.name}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                {selectedListing.contact_info?.phone && (
                  <div>
                    <Label>Телефон</Label>
                    <p className="text-lg font-medium">{selectedListing.contact_info.phone}</p>
                  </div>
                )}
                {selectedListing.contact_info?.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg font-medium">{selectedListing.contact_info.email}</p>
                  </div>
                )}
                {selectedListing.companies?.phone && (
                  <div>
                    <Label>Телефон компании</Label>
                    <p className="text-lg font-medium">{selectedListing.companies.phone}</p>
                  </div>
                )}
                {selectedListing.companies?.email && (
                  <div>
                    <Label>Email компании</Label>
                    <p className="text-lg font-medium">{selectedListing.companies.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
