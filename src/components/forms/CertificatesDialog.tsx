import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificatesDialogProps {
  userId: string;
}

export default function CertificatesDialog({ userId }: CertificatesDialogProps) {
  const [guid, setGuid] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    toast({
      title: 'Информация',
      description: 'Загрузка УКЭП будет доступна после настройки хранилища',
    });
  };

  const handleSave = () => {
    toast({
      title: 'Успешно',
      description: 'Данные сертификата сохранены',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Award className="h-4 w-4 mr-2" />
          Сертификаты
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление сертификатами</DialogTitle>
          <DialogDescription>
            Загрузите УКЭП и введите номер МЧД
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ukep">УКЭП (Усиленная квалифицированная электронная подпись)</Label>
            <div className="flex gap-2">
              <Input
                id="ukep"
                type="file"
                accept=".cer,.pfx,.p12"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button type="button" size="icon" variant="outline">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guid">GUID номер МЧД (Машиночитаемая доверенность)</Label>
            <Input
              id="guid"
              placeholder="Введите GUID номер"
              value={guid}
              onChange={(e) => setGuid(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
