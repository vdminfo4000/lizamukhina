import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  userId: string;
}

interface Template {
  id: string;
  name: string;
  template_type: string;
  content: string;
  variables: string[];
  created_at: string;
}

export function DocumentTemplatesDialog({ open, onOpenChange, companyId, userId }: DocumentTemplatesDialogProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    template_type: "contract",
    content: "",
    variables: [] as string[],
  });
  const [variableInput, setVariableInput] = useState("");

  useEffect(() => {
    if (open && companyId) {
      loadTemplates();
    }
  }, [open, companyId]);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading templates:', error);
    } else {
      const templatesData = (data || []).map(t => ({
        id: t.id,
        name: t.name,
        template_type: t.template_type,
        content: t.content,
        variables: Array.isArray(t.variables) ? t.variables.filter((v): v is string => typeof v === 'string') : [],
        created_at: t.created_at,
      }));
      setTemplates(templatesData);
    }
  };

  const handleAddVariable = () => {
    if (variableInput.trim() && !newTemplate.variables.includes(variableInput.trim())) {
      setNewTemplate({
        ...newTemplate,
        variables: [...newTemplate.variables, variableInput.trim()],
      });
      setVariableInput("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setNewTemplate({
      ...newTemplate,
      variables: newTemplate.variables.filter(v => v !== variable),
    });
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните название и содержание шаблона",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from('document_templates').insert({
      company_id: companyId,
      name: newTemplate.name,
      template_type: newTemplate.template_type,
      content: newTemplate.content,
      variables: newTemplate.variables,
      created_by: userId,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Шаблон создан",
      });
      setNewTemplate({ name: "", template_type: "contract", content: "", variables: [] });
      setShowAddForm(false);
      loadTemplates();
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить шаблон",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Шаблон удален",
      });
      loadTemplates();
    }
  };

  const handleGenerateDocument = async (template: Template) => {
    // Create a simple document with the template content
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Успешно",
      description: "Документ сгенерирован и скачан",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Шаблоны документов</DialogTitle>
          <DialogDescription>
            Управление шаблонами для генерации договоров и документов
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить шаблон
              </Button>
            )}

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Новый шаблон</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Название шаблона</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Договор поставки"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-type">Тип документа</Label>
                    <Select
                      value={newTemplate.template_type}
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value })}
                    >
                      <SelectTrigger id="template-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Договор</SelectItem>
                        <SelectItem value="invoice">Счет</SelectItem>
                        <SelectItem value="act">Акт</SelectItem>
                        <SelectItem value="agreement">Соглашение</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="template-content">Содержание шаблона</Label>
                    <Textarea
                      id="template-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="Введите текст шаблона. Используйте {{переменная}} для вставки переменных."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label>Переменные</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={variableInput}
                        onChange={(e) => setVariableInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                        placeholder="Название переменной (например: company_name)"
                      />
                      <Button type="button" onClick={handleAddVariable}>
                        Добавить
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newTemplate.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="gap-2">
                          {`{{${variable}}}`}
                          <button
                            onClick={() => handleRemoveVariable(variable)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Создать шаблон
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Templates List */}
            <div className="space-y-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mt-1">
                            {template.template_type}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateDocument(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Переменные: </span>
                        {template.variables.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((v) => (
                              <Badge key={v} variant="secondary" className="text-xs">
                                {`{{${v}}}`}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Нет переменных</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto font-mono">
                        {template.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
