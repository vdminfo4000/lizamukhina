import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Send, Mail, Users, FileText, Upload, Trash2, User, MessageSquare, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddReportDialog } from "@/components/forms/AddReportDialog";
import { ReportSettingsDialog } from "@/components/forms/ReportSettingsDialog";
import { ReportFormDialog } from "@/components/forms/ReportFormDialog";
import { AddPlanDialog } from "@/components/forms/AddPlanDialog";
import { DocumentTemplatesDialog } from "@/components/forms/DocumentTemplatesDialog";

interface Message {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
  receiver_id: string | null;
}

interface Email {
  id: string;
  direction: string;
  from_email: string;
  to_email: string;
  subject: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

interface Document {
  id: string;
  uploader_name: string;
  file_name: string;
  file_size: number | null;
  description: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  contact_type: string;
  name: string;
  organization: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export default function CRM() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const { toast } = useToast();

  const [newMessage, setNewMessage] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState<string>("all");
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailTo, setNewEmailTo] = useState("");
  const [newEmailBody, setNewEmailBody] = useState("");
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    type: "client",
    name: "",
    organization: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    totalEmails: 0,
    unreadEmails: 0,
    totalDocuments: 0,
    totalContacts: 0,
  });

  const [reports, setReports] = useState<Array<{ id: string; name: string; template_url?: string; fields?: any }>>([]);
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [reportSettingsOpen, setReportSettingsOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const [plans, setPlans] = useState<{
    plots: Array<{ id: string; name: string; description?: string }>;
    equipment: Array<{ id: string; name: string; description?: string }>;
    facilities: Array<{ id: string; name: string; description?: string }>;
  }>({
    plots: [],
    equipment: [],
    facilities: []
  });
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [planType, setPlanType] = useState<"plots" | "equipment" | "facilities">("plots");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (companyId) {
      setupRealtime();
    }
  }, [companyId]);

  const setupRealtime = () => {
    if (!companyId) return;

    const messagesChannel = supabase
      .channel('crm-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_messages',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          loadMessages(companyId);
          loadAnalytics();
        }
      )
      .subscribe();

    const emailsChannel = supabase
      .channel('crm-emails-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_emails',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          loadEmails(companyId);
          loadAnalytics();
        }
      )
      .subscribe();

    const documentsChannel = supabase
      .channel('crm-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_documents',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          loadDocuments(companyId);
          loadAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(emailsChannel);
      supabase.removeChannel(documentsChannel);
    };
  };

  const loadAnalytics = async () => {
    if (!companyId) return;

    const [messagesRes, emailsRes, documentsRes, contactsRes] = await Promise.all([
      supabase.from("crm_messages").select("id, is_read", { count: "exact" }).eq("company_id", companyId),
      supabase.from("crm_emails").select("id, is_read", { count: "exact" }).eq("company_id", companyId),
      supabase.from("crm_documents").select("id", { count: "exact" }).eq("company_id", companyId),
      supabase.from("crm_contacts").select("id", { count: "exact" }).eq("company_id", companyId),
    ]);

    setAnalytics({
      totalMessages: messagesRes.count || 0,
      unreadMessages: messagesRes.data?.filter(m => !m.is_read).length || 0,
      totalEmails: emailsRes.count || 0,
      unreadEmails: emailsRes.data?.filter(e => !e.is_read).length || 0,
      totalDocuments: documentsRes.count || 0,
      totalContacts: contactsRes.count || 0,
    });
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    setIsAdmin(roleData?.role === 'admin');

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) return;

    setCompanyId(profile.company_id);
    setUserName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Пользователь");

    // Load company employees
    const { data: employeesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("company_id", profile.company_id)
      .neq("id", user.id);

    if (employeesData) setEmployees(employeesData);

    // Load reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });
    
    if (reportsData) {
      setReports(reportsData.map(r => ({ id: r.id, name: r.name, template_url: r.template_url, fields: r.fields })));
    }

    // Load plans
    const { data: plansData } = await supabase
      .from('plans')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });
    
    if (plansData) {
      const groupedPlans = {
        plots: plansData.filter(p => p.plan_type === 'plot').map(p => ({ id: p.id, name: p.name, description: p.description })),
        equipment: plansData.filter(p => p.plan_type === 'equipment').map(p => ({ id: p.id, name: p.name, description: p.description })),
        facilities: plansData.filter(p => p.plan_type === 'facility').map(p => ({ id: p.id, name: p.name, description: p.description })),
      };
      setPlans(groupedPlans);
    }

    loadMessages(profile.company_id);
    loadEmails(profile.company_id);
    loadDocuments(profile.company_id);
    loadContacts(profile.company_id);
    loadAnalytics();
  };

  const loadMessages = async (companyId: string) => {
    const { data } = await supabase
      .from("crm_messages")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
  };

  const loadEmails = async (companyId: string) => {
    const { data } = await supabase
      .from("crm_emails")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data) setEmails(data);
  };

  const loadDocuments = async (companyId: string) => {
    const { data } = await supabase
      .from("crm_documents")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data) setDocuments(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !companyId || !userId) return;

    setUploadingFile(true);
    const fileName = `${userId}/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("crm-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("crm-documents")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("crm_documents").insert({
        company_id: companyId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: userId,
        uploader_name: userName,
      });

      if (dbError) throw dbError;

      toast({
        title: "Успешно",
        description: "Файл загружен",
      });

      loadDocuments(companyId);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  };

  const loadContacts = async (companyId: string) => {
    const { data } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data) setContacts(data);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !companyId || !userId) return;

    const { error } = await supabase.from("crm_messages").insert({
      company_id: companyId,
      sender_id: userId,
      sender_name: userName,
      receiver_id: selectedReceiver === "all" ? null : selectedReceiver,
      message: newMessage,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Сообщение отправлено",
      });
      setNewMessage("");
      setSelectedReceiver("");
      loadMessages(companyId);
    }
  };

  const handleSendEmail = async () => {
    if (!newEmailSubject.trim() || !newEmailTo.trim() || !newEmailBody.trim() || !companyId || !userId) return;

    const { data: { user } } = await supabase.auth.getUser();
    const fromEmail = user?.email || "unknown@company.com";

    const { error } = await supabase.from("crm_emails").insert({
      company_id: companyId,
      user_id: userId,
      direction: "outgoing",
      from_email: fromEmail,
      to_email: newEmailTo,
      subject: newEmailSubject,
      body: newEmailBody,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить письмо",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Письмо отправлено",
      });
      setNewEmailSubject("");
      setNewEmailTo("");
      setNewEmailBody("");
      loadEmails(companyId);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !companyId) return;

    const { error } = await supabase.from("crm_contacts").insert({
      company_id: companyId,
      contact_type: newContact.type,
      name: newContact.name,
      organization: newContact.organization || null,
      email: newContact.email || null,
      phone: newContact.phone || null,
      address: newContact.address || null,
      notes: newContact.notes || null,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить контакт",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Контакт добавлен",
      });
      setNewContactOpen(false);
      setNewContact({
        type: "client",
        name: "",
        organization: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      if (companyId) loadContacts(companyId);
    }
  };

  const handleAddReport = (reportName: string) => {
    const newReport = {
      id: Date.now().toString(),
      name: reportName
    };
    setReports([...reports, newReport]);
    toast({
      title: "Успешно",
      description: `Отчет "${reportName}" добавлен`,
    });
  };

  const handleAddPlan = (plan: { name: string; description: string }) => {
    const newPlan = {
      id: Date.now().toString(),
      ...plan
    };
    setPlans({
      ...plans,
      [planType]: [...plans[planType], newPlan]
    });
    toast({
      title: "Успешно",
      description: `План "${plan.name}" добавлен`,
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground">
          Управление взаимодействием с сотрудниками, партнерами и клиентами
        </p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Отчеты
          </TabsTrigger>
          <TabsTrigger value="planning">
            <FileText className="w-4 h-4 mr-2" />
            Планирование
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Чат
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Почта
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Документы
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="w-4 h-4 mr-2" />
            Контакты
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Отчеты</CardTitle>
                  <CardDescription>Управление отчетами для сотрудников</CardDescription>
                </div>
                {isAdmin && (
                  <Button onClick={() => setAddReportOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Добавить отчет
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Пока нет созданных отчетов</p>
                  <p className="text-sm mt-1">Создайте первый отчет для заполнения сотрудниками</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report.name);
                            setReportSettingsOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          setSelectedReport(report.name);
                          setReportFormOpen(true);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {report.name}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <AddReportDialog
            open={addReportOpen}
            onOpenChange={setAddReportOpen}
            onAdd={handleAddReport}
          />

          <ReportSettingsDialog
            open={reportSettingsOpen}
            onOpenChange={setReportSettingsOpen}
            reportName={selectedReport}
          />

          <ReportFormDialog
            open={reportFormOpen}
            onOpenChange={setReportFormOpen}
            reportName={selectedReport}
          />
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <Tabs defaultValue="plots" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plots">Участки</TabsTrigger>
              <TabsTrigger value="equipment">Техника</TabsTrigger>
              <TabsTrigger value="facilities">Объекты</TabsTrigger>
            </TabsList>

            <TabsContent value="plots">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Планирование по участкам</CardTitle>
                      <CardDescription>Планы по посеву и сбору урожая</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setPlanType("plots");
                      setAddPlanOpen(true);
                    }}>
                      <FileText className="mr-2 h-4 w-4" />
                      Добавить план
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plans.plots.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Планирование работ на участках</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {plans.plots.map((plan) => (
                        <Button key={plan.id} variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          {plan.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Планирование работы техники</CardTitle>
                      <CardDescription>График использования техники</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setPlanType("equipment");
                      setAddPlanOpen(true);
                    }}>
                      <FileText className="mr-2 h-4 w-4" />
                      Добавить план
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plans.equipment.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Планирование работы техники</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {plans.equipment.map((plan) => (
                        <Button key={plan.id} variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          {plan.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facilities">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Планирование загрузки объектов</CardTitle>
                      <CardDescription>Загрузка и выгрузка урожая на объектах</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setPlanType("facilities");
                      setAddPlanOpen(true);
                    }}>
                      <FileText className="mr-2 h-4 w-4" />
                      Добавить план
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plans.facilities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Планирование работы объектов</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {plans.facilities.map((plan) => (
                        <Button key={plan.id} variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          {plan.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AddPlanDialog
            open={addPlanOpen}
            onOpenChange={setAddPlanOpen}
            planType={planType}
            onAdd={handleAddPlan}
          />
        </TabsContent>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Сообщения</CardTitle>
                    <CardDescription>Чат с сотрудниками компании</CardDescription>
                  </div>
                  {selectedReceiver !== "all" && (
                    <Badge variant="outline">
                      Личный чат: {employees.find(e => e.id === selectedReceiver)?.first_name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">Нет сообщений</p>
                        <p className="text-xs text-muted-foreground mt-1">Начните общение с коллегами</p>
                      </div>
                    ) : (
                      messages
                        .filter(msg => selectedReceiver === "all" || msg.sender_id === selectedReceiver || msg.receiver_id === selectedReceiver)
                        .map((msg) => {
                        const isOwn = msg.sender_id === userId;
                        const sender = employees.find(e => e.id === msg.sender_id);
                        const initials = sender 
                          ? `${sender.first_name?.charAt(0) || ''}${sender.last_name?.charAt(0) || ''}`
                          : msg.sender_name?.split(' ').map(n => n.charAt(0)).join('') || '?';
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {initials}
                              </div>
                            </div>
                            <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className={`rounded-2xl px-4 py-2 ${
                                isOwn 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                {!isOwn && (
                                  <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1 px-2">
                                {formatDistanceToNow(new Date(msg.created_at), {
                                  addSuffix: true,
                                  locale: ru,
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 space-y-3 bg-background">
                  <Select value={selectedReceiver} onValueChange={setSelectedReceiver}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Всем (общий чат)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Всем (общий чат)
                        </div>
                      </SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {emp.first_name} {emp.last_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Введите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            handleSendMessage();
                          }
                        }
                      }}
                      rows={2}
                      className="resize-none"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="h-auto"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Сотрудники</CardTitle>
                <CardDescription>Список сотрудников компании</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="p-2">
                    {employees.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">Нет сотрудников</p>
                      </div>
                    ) : (
                      employees.map((emp) => {
                        const initials = `${emp.first_name?.charAt(0) || ''}${emp.last_name?.charAt(0) || ''}`;
                        const isSelected = selectedReceiver === emp.id;
                        
                        return (
                          <div 
                            key={emp.id} 
                            className={`p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors mb-1 ${
                              isSelected ? 'bg-accent' : ''
                            }`}
                            onClick={() => setSelectedReceiver(emp.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {emp.first_name} {emp.last_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Отправить письмо</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Кому</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newEmailTo}
                    onChange={(e) => setNewEmailTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Тема</Label>
                  <Input
                    placeholder="Тема письма"
                    value={newEmailSubject}
                    onChange={(e) => setNewEmailSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Сообщение</Label>
                  <Textarea
                    placeholder="Текст письма..."
                    rows={8}
                    value={newEmailBody}
                    onChange={(e) => setNewEmailBody(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendEmail} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Отправить
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История писем</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {emails.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Нет писем</p>
                    ) : (
                      emails.map((email) => (
                        <div key={email.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={email.direction === "outgoing" ? "default" : "secondary"}>
                              {email.direction === "outgoing" ? "Исходящее" : "Входящее"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(email.created_at), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">От: {email.from_email}</p>
                            <p className="font-medium">Кому: {email.to_email}</p>
                          </div>
                          <p className="font-semibold">{email.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{email.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Документы и файлы</CardTitle>
              <CardDescription>Хранение и обмен документами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {isAdmin && companyId && userId && (
                  <Button variant="outline" onClick={() => setTemplatesOpen(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Шаблоны
                  </Button>
                )}
                <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={uploadingFile}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFile ? 'Загрузка...' : 'Загрузить документ'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Нет документов</p>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.file_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.uploader_name} • {formatFileSize(doc.file_size)}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.created_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Контакты</CardTitle>
                  <CardDescription>Партнеры, клиенты и поставщики</CardDescription>
                </div>
                <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
                  <DialogTrigger asChild>
                    <Button>Добавить контакт</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый контакт</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Тип</Label>
                        <Select value={newContact.type} onValueChange={(val) => setNewContact({ ...newContact, type: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Клиент</SelectItem>
                            <SelectItem value="partner">Партнер</SelectItem>
                            <SelectItem value="supplier">Поставщик</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Имя</Label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Организация</Label>
                        <Input
                          value={newContact.organization}
                          onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Телефон</Label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Адрес</Label>
                        <Input
                          value={newContact.address}
                          onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Заметки</Label>
                        <Textarea
                          value={newContact.notes}
                          onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddContact} className="w-full">
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {contacts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Нет контактов</p>
                  ) : (
                    contacts.map((contact) => (
                      <div key={contact.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            {contact.organization && (
                              <p className="text-sm text-muted-foreground">{contact.organization}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>
                              {contact.contact_type === "client"
                                ? "Клиент"
                                : contact.contact_type === "partner"
                                ? "Партнер"
                                : "Поставщик"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const { error } = await supabase
                                  .from('crm_contacts')
                                  .delete()
                                  .eq('id', contact.id);
                                
                                if (error) {
                                  toast({
                                    title: 'Ошибка',
                                    description: 'Не удалось удалить контакт',
                                    variant: 'destructive',
                                  });
                                } else {
                                  toast({
                                    title: 'Успешно',
                                    description: 'Контакт удален',
                                  });
                                  if (companyId) loadContacts(companyId);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          {contact.email && <p>Email: {contact.email}</p>}
                          {contact.phone && <p>Телефон: {contact.phone}</p>}
                          {contact.address && <p>Адрес: {contact.address}</p>}
                          {contact.notes && (
                            <p className="text-muted-foreground italic mt-2">{contact.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddReportDialog 
        open={addReportOpen} 
        onOpenChange={setAddReportOpen} 
        onAdd={handleAddReport} 
      />
      <ReportSettingsDialog 
        open={reportSettingsOpen} 
        onOpenChange={setReportSettingsOpen} 
        reportName={selectedReport} 
      />
      <ReportFormDialog 
        open={reportFormOpen} 
        onOpenChange={setReportFormOpen} 
        reportName={selectedReport} 
      />
      <AddPlanDialog 
        open={addPlanOpen} 
        onOpenChange={setAddPlanOpen} 
        onAdd={handleAddPlan} 
        planType={planType} 
      />
      {isAdmin && companyId && userId && (
        <DocumentTemplatesDialog 
          open={templatesOpen} 
          onOpenChange={setTemplatesOpen} 
          companyId={companyId} 
          userId={userId}
        />
      )}
    </div>
  );
}