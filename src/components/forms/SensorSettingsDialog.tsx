import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SensorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    apiUrl: string;
    apiKey: string;
    apiMethod: string;
    thresholdMin: string;
    thresholdMax: string;
    alertEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
  onSave: () => void;
}

export function SensorSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onSave
}: SensorSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Настройки датчика</DialogTitle>
          <DialogDescription>
            Настройте подключение API и пороговые значения для уведомлений
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API URL</Label>
            <Input
              placeholder="https://api.example.com/sensor/data"
              value={settings.apiUrl}
              onChange={(e) => onSettingsChange({ ...settings, apiUrl: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>API ключ (опционально)</Label>
            <Input
              type="password"
              placeholder="your-api-key"
              value={settings.apiKey}
              onChange={(e) => onSettingsChange({ ...settings, apiKey: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Метод запроса</Label>
            <Select
              value={settings.apiMethod}
              onValueChange={(value) => onSettingsChange({ ...settings, apiMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Пороговые значения и уведомления</h4>
            
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="alert-enabled"
                checked={settings.alertEnabled}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, alertEnabled: checked })}
              />
              <Label htmlFor="alert-enabled">Включить уведомления</Label>
            </div>

            {settings.alertEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Минимальное значение</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={settings.thresholdMin}
                    onChange={(e) => onSettingsChange({ ...settings, thresholdMin: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Максимальное значение</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={settings.thresholdMax}
                    onChange={(e) => onSettingsChange({ ...settings, thresholdMax: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={onSave}>
              Сохранить настройки
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
