import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PermissionsDialog } from "@/components/forms/PermissionsDialog";
import { AddEmployeeDialog } from "@/components/forms/AddEmployeeDialog";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  role: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      toast({
        title: "Доступ запрещен",
        description: "Только администраторы могут управлять сотрудниками",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    await loadData();
  };

  const loadData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get company_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    setCompanyId(profile.company_id);
    await loadEmployees(profile.company_id);
    setLoading(false);
  };

  const loadEmployees = async (compId: string) => {
    // Get all employees in the company
    const { data: employeesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, position')
      .eq('company_id', compId);

    if (profilesError) {
      console.error('Error loading employees:', profilesError);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список сотрудников",
        variant: "destructive",
      });
      return;
    }

    if (!employeesData || employeesData.length === 0) {
      setEmployees([]);
      return;
    }

    // Get roles for all employees
    const employeeIds = employeesData.map(emp => emp.id);
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', employeeIds);

    // Map roles to employees
    const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);
    
    const formattedEmployees = employeesData.map(emp => ({
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      role: rolesMap.get(emp.id) || 'user',
    }));
    
    setEmployees(formattedEmployees);
  };


  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPermissionsDialogOpen(true);
  };

  const handlePermissionsDialogClose = () => {
    setPermissionsDialogOpen(false);
    setSelectedEmployee(null);
    loadData(); // Reload to get updated roles
  };

  const removeEmployeeFromCompany = async () => {
    if (!employeeToRemove) return;

    // Set the user's company_id to null to remove them from this company
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: null })
      .eq('id', employeeToRemove.id);

    if (error) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Успешно',
      description: 'Сотрудник удален из компании',
    });

    setEmployeeToRemove(null);
    await loadData();
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const email = emp.email?.toLowerCase() || '';
    const position = emp.position?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query) || position.includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Управление сотрудниками</h1>
          <p className="text-muted-foreground mt-2">
            Добавляйте сотрудников и управляйте их правами доступа
          </p>
        </div>
        {companyId && (
          <AddEmployeeDialog 
            companyId={companyId} 
            onSuccess={loadData} 
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>
            Нажмите на сотрудника для управления правами доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email или должности..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell
                    className="cursor-pointer hover:underline"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || '—'}</TableCell>
                  <TableCell>{employee.position || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                      {employee.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmployeeToRemove(employee);
                      }}
                    >
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedEmployee && (
        <PermissionsDialog
          userId={selectedEmployee.id}
          userName={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
          userRole={selectedEmployee.role}
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          onRoleChange={handlePermissionsDialogClose}
        />
      )}

      <AlertDialog open={!!employeeToRemove} onOpenChange={(open) => !open && setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника из компании?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {employeeToRemove?.first_name} {employeeToRemove?.last_name} из компании?
              Это действие отвяжет пользователя от компании, но не удалит учетную запись.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={removeEmployeeFromCompany}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
