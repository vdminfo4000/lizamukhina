import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AddEmployeeDialogProps {
  companyId: string;
  onSuccess: () => void;
}

interface AvailableEmployee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  company_id: string | null;
}

export function AddEmployeeDialog({ companyId, onSuccess }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAvailableEmployees();
    }
  }, [open, companyId]);

  const loadAvailableEmployees = async () => {
    setLoading(true);
    try {
      // Get company INN
      const { data: companyData } = await supabase
        .from('companies')
        .select('inn')
        .eq('id', companyId)
        .single();

      if (!companyData?.inn) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные компании",
          variant: "destructive",
        });
        return;
      }

      // Get all users with the same INN who are not in this company
      const { data: employees, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, position, company_id')
        .eq('inn', companyData.inn);
      
      // Filter out employees already in this company (client-side to handle null values correctly)
      const filteredEmployees = employees?.filter(emp => emp.company_id !== companyId) || [];

      if (error) throw error;

      setAvailableEmployees(filteredEmployees);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: companyId })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Сотрудник добавлен в компанию",
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить сотрудника
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogDescription>
            Выберите зарегистрированного сотрудника с тем же ИНН для добавления в компанию
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : availableEmployees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет доступных сотрудников для добавления
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || '—'}</TableCell>
                  <TableCell>{employee.position || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.company_id ? "secondary" : "outline"}>
                      {employee.company_id ? 'В другой компании' : 'Без компании'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAddEmployee(employee.id)}
                      disabled={loading}
                    >
                      Добавить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
