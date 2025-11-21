import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

interface TemplateButtonProps {
  templateId: string;
  templateName: string;
  templateVariables: string[];
  companyId: string;
  userId: string;
  userName: string;
  onGenerated: () => void;
}

export function TemplateButton({
  templateId,
  templateName,
  templateVariables,
  companyId,
  userId,
  userName,
  onGenerated,
}: TemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Get template from database
      const { data: template, error: templateError } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError || !template) {
        throw new Error("Шаблон не найден");
      }

      if (!template.file_url) {
        throw new Error("У шаблона нет файла");
      }

      // Extract path from full URL if needed
      let templatePath = template.file_url;
      if (templatePath.includes('/object/public/document-templates/')) {
        templatePath = templatePath.split('/object/public/document-templates/')[1];
      }

      // Download template file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("document-templates")
        .download(templatePath);

      if (downloadError || !fileData) {
        throw new Error("Не удалось загрузить файл шаблона");
      }

      const arrayBuffer = await fileData.arrayBuffer();

      // Generate document using Docxtemplater
      const zip = new PizZip(arrayBuffer);
      
      // Fix broken tags in XML (Word splits tags across multiple XML elements)
      const fixBrokenTags = (text: string) => {
        // Remove XML tags between {{ and }}
        return text.replace(/\{\{([^}]*?)<[^>]+>([^}]*?)\}\}/g, (match, before, after) => {
          const cleaned = match.replace(/<[^>]+>/g, '');
          return cleaned;
        });
      };

      // Apply fix to all XML files in the document
      zip.file(/\.xml$/).forEach((file: any) => {
        const content = zip.file(file.name).asText();
        const fixed = fixBrokenTags(content);
        zip.file(file.name, fixed);
      });

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(formData);

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Upload generated document
      const fileName = `${Date.now()}_${templateName.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}.docx`;
      const filePath = `${companyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("generated-documents")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("generated-documents")
        .getPublicUrl(filePath);

      // Save to generated_documents database
      const { error: dbError } = await supabase
        .from("generated_documents")
        .insert({
          company_id: companyId,
          template_id: templateId,
          file_name: fileName,
          file_url: urlData.publicUrl,
          filled_data: formData,
          created_by: userId,
          created_by_name: userName,
        });

      if (dbError) throw dbError;

      // Also save a copy to crm_documents
      const { error: crmDocError } = await supabase
        .from("crm_documents")
        .insert({
          company_id: companyId,
          file_name: fileName,
          file_url: urlData.publicUrl,
          file_size: blob.size,
          file_type: blob.type,
          uploaded_by: userId,
          uploader_name: userName,
          description: `Сгенерирован из шаблона: ${templateName}`,
        });

      if (crmDocError) {
        console.error("Error saving to crm_documents:", crmDocError);
        // Don't throw - main document was saved successfully
      }

      toast({
        title: "Успешно",
        description: "Документ сформирован",
      });

      setOpen(false);
      setFormData({});
      onGenerated();
    } catch (error: any) {
      console.error("Error generating document:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сформировать документ",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        {templateName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Заполнение: {templateName}</DialogTitle>
            <DialogDescription>
              Заполните все поля для генерации документа
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {templateVariables.map((variable) => (
                <div key={variable}>
                  <Label htmlFor={variable}>{variable}</Label>
                  <Input
                    id={variable}
                    value={formData[variable] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [variable]: e.target.value })
                    }
                    placeholder={`Введите ${variable}`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
              Отмена
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерация...
                </>
              ) : (
                "Сформировать"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
