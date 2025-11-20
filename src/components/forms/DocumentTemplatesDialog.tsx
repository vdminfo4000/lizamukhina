import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Download, Upload, Settings, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

interface DocumentTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  userId: string;
  userName?: string;
}

interface Template {
  id: string;
  name: string;
  template_type: string;
  content: string;
  variables: string[];
  created_at: string;
  file_url: string | null;
  is_file_template: boolean;
}

interface GeneratedDocument {
  id: string;
  template_id: string;
  file_name: string;
  file_url: string;
  filled_data: Record<string, any>;
  created_by_name: string;
  created_at: string;
}

export function DocumentTemplatesDialog({ open, onOpenChange, companyId, userId, userName = "Сотрудник" }: DocumentTemplatesDialogProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [fillFormOpen, setFillFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open && companyId) {
      loadTemplates();
      loadGeneratedDocuments();
    }
  }, [open, companyId]);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_file_template', true)
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
        file_url: t.file_url,
        is_file_template: t.is_file_template,
      }));
      setTemplates(templatesData);
    }
  };

  const loadGeneratedDocuments = async () => {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading generated documents:', error);
    } else {
      const docs = (data || []).map(d => ({
        ...d,
        filled_data: d.filled_data as Record<string, any>
      }));
      setGeneratedDocs(docs);
    }
  };

  const extractVariablesFromDocx = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          const zip = new PizZip(content);
          
          // Extract text directly from XML without docxtemplater to avoid formatting issues
          const xml = zip.file("word/document.xml")?.asText();
          if (!xml) {
            throw new Error("Не удалось прочитать содержимое документа");
          }

          // Remove all XML tags to get plain text
          const plainText = xml.replace(/<[^>]*>/g, '');
          
          // Extract variables in format {{variable}}
          const variables = new Set<string>();
          const regex = /\{\{([^}]+)\}\}/g;
          let match;
          while ((match = regex.exec(plainText)) !== null) {
            const varName = match[1].trim();
            if (varName) {
              variables.add(varName);
            }
          }

          resolve(Array.from(variables));
        } catch (error) {
          console.error('Error extracting variables:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !templateName.trim()) {
      toast({
        title: "Ошибка",
        description: "Выберите файл и введите название шаблона",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Extract variables from the DOCX file
      let variables: string[] = [];
      try {
        variables = await extractVariablesFromDocx(uploadFile);
      } catch (extractError) {
        console.error('Error extracting variables:', extractError);
        toast({
          title: "Предупреждение",
          description: "Не удалось извлечь переменные из документа. Убедитесь, что метки {{переменная}} написаны без форматирования (одним стилем, без жирного/курсива внутри тега).",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Upload file to storage
      const fileName = `${companyId}/${Date.now()}_${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('document-templates')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('document-templates')
        .getPublicUrl(fileName);

      // Save template metadata to database
      const { error: dbError } = await supabase.from('document_templates').insert({
        company_id: companyId,
        name: templateName,
        template_type: 'contract',
        content: '', // We don't store content for file templates
        variables: variables,
        created_by: userId,
        file_url: urlData.publicUrl,
        is_file_template: true,
      });

      if (dbError) throw dbError;

      toast({
        title: "Успешно",
        description: `Шаблон "${templateName}" загружен. Найдено переменных: ${variables.length}`,
      });

      setTemplateName("");
      setUploadFile(null);
      setShowUploadForm(false);
      loadTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить шаблон",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    // Delete file from storage if exists
    if (template.file_url) {
      const fileName = template.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('document-templates')
          .remove([`${companyId}/${fileName}`]);
      }
    }

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

  const handleOpenFillForm = (template: Template) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.variables.forEach(v => {
      initialData[v] = '';
    });
    setFormData(initialData);
    setFillFormOpen(true);
  };

  const handleGenerateDocument = async () => {
    if (!selectedTemplate || !selectedTemplate.file_url) return;

    setIsProcessing(true);

    try {
      // Download the template file
      const response = await fetch(selectedTemplate.file_url);
      const arrayBuffer = await response.arrayBuffer();

      // Load the template
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Set the data
      doc.render(formData);

      // Generate the document
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Upload generated document to storage
      const fileName = `${companyId}/${Date.now()}_${selectedTemplate.name}.docx`;
      const { error: uploadError } = await supabase.storage
        .from('generated-documents')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('generated-documents')
        .getPublicUrl(fileName);

      // Save to generated_documents table
      const { error: dbError } = await supabase.from('generated_documents').insert({
        company_id: companyId,
        template_id: selectedTemplate.id,
        file_name: `${selectedTemplate.name}.docx`,
        file_url: urlData.publicUrl,
        filled_data: formData,
        created_by: userId,
        created_by_name: userName,
      });

      if (dbError) throw dbError;

      toast({
        title: "Успешно",
        description: "Документ сгенерирован и добавлен в список",
      });

      setFillFormOpen(false);
      setFormData({});
      loadGeneratedDocuments();
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать документ",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocument = async (doc: GeneratedDocument) => {
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      saveAs(blob, doc.file_name);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скачать документ",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGeneratedDocument = async (id: string) => {
    const doc = generatedDocs.find(d => d.id === id);
    if (!doc) return;

    // Delete file from storage
    const fileName = doc.file_url.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('generated-documents')
        .remove([`${companyId}/${fileName}`]);
    }

    const { error } = await supabase
      .from('generated_documents')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документ",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Документ удален",
      });
      loadGeneratedDocuments();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Система генерации документов</DialogTitle>
            <DialogDescription>
              Загружайте шаблоны .docx с метками и генерируйте готовые документы
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Upload Form */}
              {!showUploadForm && (
                <Button onClick={() => setShowUploadForm(true)} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Загрузить шаблон .docx
                </Button>
              )}

              {showUploadForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Загрузка шаблона</CardTitle>
                    <CardDescription>
                      Используйте метки формата {`{{название_поля}}`} в документе Word. 
                      <br />
                      <strong>Важно:</strong> Метки должны быть написаны одним стилем, без форматирования внутри (не разбивайте тег на части жирным шрифтом или курсивом).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Название шаблона</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Договор поставки"
                      />
                    </div>

                    <div>
                      <Label htmlFor="template-file">Файл шаблона (.docx)</Label>
                      <Input
                        id="template-file"
                        type="file"
                        accept=".docx"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleFileUpload} disabled={isProcessing}>
                        {isProcessing ? "Загрузка..." : "Загрузить"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Templates List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Шаблоны документов</h3>
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="outline">
                              Переменных: {template.variables.length}
                            </Badge>
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Поля для заполнения: </span>
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
                        <Button 
                          onClick={() => handleOpenFillForm(template)}
                          className="w-full"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Заполнить и сгенерировать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Generated Documents List */}
              {generatedDocs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Сгенерированные документы</h3>
                  {generatedDocs.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Создал: {doc.created_by_name} • {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadDocument(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteGeneratedDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Fill Form Dialog */}
      <Dialog open={fillFormOpen} onOpenChange={setFillFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Заполнение документа: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Заполните все поля для генерации документа
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedTemplate?.variables.map((variable) => (
                <div key={variable}>
                  <Label htmlFor={variable}>{variable}</Label>
                  <Input
                    id={variable}
                    value={formData[variable] || ''}
                    onChange={(e) => setFormData({ ...formData, [variable]: e.target.value })}
                    placeholder={`Введите ${variable}`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setFillFormOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleGenerateDocument} disabled={isProcessing}>
              {isProcessing ? "Генерация..." : "Сформировать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
