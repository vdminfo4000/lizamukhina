import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const marketPrices = [
  { crop: "Пшеница", price: "18,500₽", change: "+2.3%", trend: "up", volume: "2,450 т" },
  { crop: "Ячмень", price: "15,200₽", change: "-1.1%", trend: "down", volume: "1,870 т" },
  { crop: "Кукуруза", price: "16,800₽", change: "+3.7%", trend: "up", volume: "3,120 т" },
  { crop: "Подсолнечник", price: "32,400₽", change: "+1.8%", trend: "up", volume: "890 т" },
];

const listings = [
  {
    id: 1,
    crop: "Пшеница озимая",
    quality: "3 класс",
    quantity: "150 т",
    price: "18,200₽/т",
    seller: "ООО Агроком",
    location: "Краснодарский край",
    status: "active",
  },
  {
    id: 2,
    crop: "Ячмень",
    quality: "2 класс",
    quantity: "80 т",
    price: "15,500₽/т",
    seller: "ИП Петров",
    location: "Воронежская обл.",
    status: "active",
  },
  {
    id: 3,
    crop: "Подсолнечник",
    quality: "Высший",
    quantity: "50 т",
    price: "33,000₽/т",
    seller: "АО Золотой колос",
    location: "Ростовская обл.",
    status: "pending",
  },
];

interface Listing {
  id: string;
  company_id: string;
  user_id: string;
  crop: string;
  quality: string | null;
  quantity: number;
  unit: string;
  price: number;
  location: string | null;
  harvest_year: number | null;
  status: string;
  views: number;
  inquiries: number;
  created_at: string;
  seller?: string;
}

export default function Exchange() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListing, setNewListing] = useState({
    crop: "",
    quality: "",
    quantity: "",
    price: "",
    location: "",
    harvest_year: new Date().getFullYear().toString(),
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView, canEdit, loading: accessLoading } = useModuleAccess('exchange');
  const { logAction } = useAuditLog();

  useEffect(() => {
    if (!accessLoading && !canView) {
      toast({
        title: 'Доступ запрещен',
        description: 'У вас нет доступа к модулю Биржа',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [accessLoading, canView, navigate, toast]);

  useEffect(() => {
    if (user && canView) {
      loadListings();
    }
  }, [user, canView]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Load all active listings from all companies
      const { data: allListings, error: listingsError } = await supabase
        .from('market_listings')
        .select(`
          *,
          companies!market_listings_company_id_fkey (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Load user's own listings
      const { data: userListings, error: userListingsError } = await supabase
        .from('market_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (userListingsError) throw userListingsError;

      const formattedListings = (allListings || []).map((listing: any) => ({
        ...listing,
        seller: listing.companies?.name || 'Неизвестно',
      }));

      setListings(formattedListings);
      setMyListings(userListings || []);
    } catch (error: any) {
      console.error('Error loading listings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить объявления',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось определить компанию',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('market_listings')
        .insert({
          user_id: user.id,
          company_id: profile.company_id,
          crop: newListing.crop,
          quality: newListing.quality || null,
          quantity: parseFloat(newListing.quantity),
          price: parseFloat(newListing.price),
          location: newListing.location || null,
          harvest_year: parseInt(newListing.harvest_year) || null,
          unit: 'т',
          status: 'active',
        });

      if (error) throw error;

      await logAction({
        action: 'create',
        module: 'exchange',
        entityType: 'market_listing',
        details: {
          crop: newListing.crop,
          quantity: newListing.quantity,
        },
      });

      toast({
        title: 'Успешно',
        description: 'Объявление создано',
      });

      setNewListing({
        crop: "",
        quality: "",
        quantity: "",
        price: "",
        location: "",
        harvest_year: new Date().getFullYear().toString(),
      });

      loadListings();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать объявление',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('market_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

      await logAction({
        action: 'delete',
        module: 'exchange',
        entityType: 'market_listing',
        entityId: listingId,
      });

      toast({
        title: 'Успешно',
        description: 'Объявление удалено',
      });

      loadListings();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить объявление',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Товарная биржа</h1>
        <p className="text-muted-foreground">
          Торговая площадка для купли-продажи сельскохозяйственной продукции
        </p>
      </div>

      {/* Market Overview */}
      <Card className="shadow-card bg-gradient-hero text-white">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Текущие биржевые цены</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {marketPrices.map((item) => (
              <div key={item.crop} className="rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{item.crop}</p>
                  {item.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-300" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-300" />
                  )}
                </div>
                <p className="text-2xl font-bold">{item.price}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={item.trend === "up" ? "text-green-300" : "text-red-300"}>
                    {item.change}
                  </span>
                  <span className="opacity-90">{item.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="buy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buy">Купить</TabsTrigger>
          <TabsTrigger value="sell">Продать</TabsTrigger>
          <TabsTrigger value="my">Мои объявления</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Доступные предложения</CardTitle>
                  <CardDescription>Объявления о продаже продукции</CardDescription>
                </div>
                <div className="w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по названию..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-foreground">{listing.crop}</h4>
                        <Badge variant="outline">{listing.quality}</Badge>
                        {listing.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        ) : (
                          <Badge variant="secondary">Ожидание</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Количество: <span className="text-foreground font-medium">{listing.quantity}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Продавец: <span className="text-foreground font-medium">{listing.seller}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Цена: <span className="text-foreground font-medium">{listing.price}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Локация: <span className="text-foreground font-medium">{listing.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                      <Button size="sm">Связаться</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Разместить объявление</CardTitle>
              <CardDescription>Создайте новое предложение о продаже</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Культура</label>
                    <Input placeholder="Например: Пшеница озимая" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Класс/Качество</label>
                    <Input placeholder="Например: 3 класс" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Количество (т)</label>
                    <Input type="number" placeholder="150" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Цена за тонну (₽)</label>
                    <Input type="number" placeholder="18500" className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Локация</label>
                    <Input placeholder="Регион/область" className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Описание</label>
                    <textarea
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={4}
                      placeholder="Дополнительная информация о продукции..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  {canEdit && (
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Разместить объявление
                    </Button>
                  )}
                  <Button variant="outline">Предварительный просмотр</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Мои объявления</CardTitle>
                  <CardDescription>Управление вашими предложениями</CardDescription>
                </div>
                {canEdit && (
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-foreground">{listing.crop}</h4>
                        {listing.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        ) : (
                          <Badge variant="secondary">Неактивно</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Количество: <span className="text-foreground font-medium">{listing.quantity}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Цена: <span className="text-foreground font-medium">{listing.price}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Просмотры: <span className="text-foreground font-medium">{listing.views}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Запросы: <span className="text-foreground font-medium">{listing.inquiries}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Редактировать
                      </Button>
                      <Button variant="ghost" size="sm">
                        Снять с публикации
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
