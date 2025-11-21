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

      // Download template file
      const response = await fetch(template.file_url);
      const arrayBuffer = await response.arrayBuffer();

      // Generate document using Docxtemplater
      const zip = new PizZip(arrayBuffer);
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

      // Save to database
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
