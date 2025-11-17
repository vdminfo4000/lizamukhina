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
import { MessageSquare, Mail, FileText, Users, Send, Upload, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
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

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
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

        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Сообщения</CardTitle>
                <CardDescription>Чат с сотрудниками компании</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Нет сообщений</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg ${
                            msg.sender_id === userId ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">{msg.sender_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="space-y-2">
                  <Select value={selectedReceiver} onValueChange={setSelectedReceiver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всем (общий чат)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всем (общий чат)</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Введите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сотрудники</CardTitle>
                <CardDescription>Список сотрудников компании</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {employees.map((emp) => (
                      <div key={emp.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                        <p className="font-medium">
                          {emp.first_name} {emp.last_name}
                        </p>
                      </div>
                    ))}
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
              <div className="mb-4">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить документ
                </Button>
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
                          <Badge>
                            {contact.contact_type === "client"
                              ? "Клиент"
                              : contact.contact_type === "partner"
                              ? "Партнер"
                              : "Поставщик"}
                          </Badge>
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
    </div>
  );
}