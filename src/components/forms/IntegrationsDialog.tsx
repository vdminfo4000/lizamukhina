import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface IntegrationsDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Integration {
  id: string;
  platform_name: string;
  platform_type: string;
  api_key: string | null;
  is_active: boolean;
}

export function IntegrationsDialog({ companyId, open, onOpenChange }: IntegrationsDialogProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { name: "1C", type: "accounting", description: "Интеграция с 1С:Предприятие" },
    { name: "ЕГАИС", type: "monitoring", description: "Единая государственная автоматизированная информационная система" },
    { name: "Росреестр", type: "registry", description: "Интеграция с Росреестром для участков" },
    { name: "Метеослужба", type: "weather", description: "Получение данных о погоде" },
  ];

  useEffect(() => {
    if (open) {
      loadIntegrations();
    }
  }, [open]);

  const loadIntegrations = async () => {
    const { data } = await supabase
      .from("integrations")
      .select("*")
      .eq("company_id", companyId);

    if (data) {
      setIntegrations(data);
    }
  };

  const handleToggle = async (platformName: string, isActive: boolean) => {
    setLoading(true);

    const existing = integrations.find((i) => i.platform_name === platformName);

    if (existing) {
      const { error } = await supabase
        .from("integrations")
        .update({ is_active: isActive })
        .eq("id", existing.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить интеграцию",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: `Интеграция ${platformName} ${isActive ? "включена" : "отключена"}`,
        });
        loadIntegrations();
      }
    }

    setLoading(false);
  };

  const handleSaveApiKey = async (platformName: string, platformType: string, apiKey: string) => {
    setLoading(true);

    const existing = integrations.find((i) => i.platform_name === platformName);

    if (existing) {
      const { error } = await supabase
        .from("integrations")
        .update({ api_key: apiKey })
        .eq("id", existing.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить API ключ",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "API ключ сохранен",
        });
        loadIntegrations();
      }
    } else {
      const { error } = await supabase.from("integrations").insert({
        company_id: companyId,
        platform_name: platformName,
        platform_type: platformType,
        api_key: apiKey,
        is_active: false,
      });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить интеграцию",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "Интеграция добавлена",
        });
        loadIntegrations();
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Интеграции</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={platforms[0].name}>
          <TabsList className="grid w-full grid-cols-4">
            {platforms.map((platform) => (
              <TabsTrigger key={platform.name} value={platform.name}>
                {platform.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {platforms.map((platform) => {
            const integration = integrations.find((i) => i.platform_name === platform.name);
            return (
              <TabsContent key={platform.name} value={platform.name}>
                <Card>
                  <CardHeader>
                    <CardTitle>{platform.name}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`active-${platform.name}`}>Активна</Label>
                      <Switch
                        id={`active-${platform.name}`}
                        checked={integration?.is_active || false}
                        onCheckedChange={(checked) => handleToggle(platform.name, checked)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`api-${platform.name}`}>API ключ</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id={`api-${platform.name}`}
                          type="password"
                          placeholder="Введите API ключ"
                          defaultValue={integration?.api_key || ""}
                          onBlur={(e) => {
                            if (e.target.value) {
                              handleSaveApiKey(platform.name, platform.type, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}