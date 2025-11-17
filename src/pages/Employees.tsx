import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PermissionsDialog } from "@/components/forms/PermissionsDialog";
import { useNavigate } from "react-router-dom";

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  role: string;
}

interface AvailableUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyInn, setCompanyInn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
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

    // Get company_id and INN
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id, inn')
      .eq('id', profile.company_id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    setCompanyId(company.id);
    setCompanyInn(company.inn);

    await Promise.all([
      loadEmployees(company.id),
      loadAvailableUsers(company.inn, company.id)
    ]);

    setLoading(false);
  };

  const loadEmployees = async (compId: string) => {
    // Get all employees in the company with their roles
    const { data: employeesData } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        position,
        user_roles (role)
      `)
      .eq('company_id', compId);

    if (employeesData) {
      const formattedEmployees = employeesData.map(emp => ({
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        role: (emp.user_roles as any)?.[0]?.role || 'user',
      }));
      setEmployees(formattedEmployees);
    }
  };

  const loadAvailableUsers = async (inn: string | null, currentCompanyId: string) => {
    if (!inn) return;

    // Get all users registered with this INN who are not yet in this company
    const { data: companiesWithInn } = await supabase
      .from('companies')
      .select('id')
      .eq('inn', inn);

    if (!companiesWithInn || companiesWithInn.length === 0) return;

    const companyIds = companiesWithInn.map(c => c.id);

    // Get all profiles from companies with this INN
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, company_id')
      .in('company_id', companyIds);

    if (allProfiles) {
      // Filter out users who are already in the current company
      const available = allProfiles
        .filter(p => p.company_id !== currentCompanyId)
        .map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
        }));
      
      setAvailableUsers(available);
    }
  };

  const addEmployeeToCompany = async (userId: string) => {
    if (!companyId) return;

    // Update the user's company_id to add them to this company
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', userId);

    if (profileError) {
      toast({
        title: 'Ошибка',
        description: profileError.message,
        variant: 'destructive',
      });
      return;
    }

    // Check if user has a role, if not create one
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingRole) {
      await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'user' });
    }

    toast({
      title: 'Успешно',
      description: 'Сотрудник добавлен в компанию',
    });

    setOpenCombobox(false);
    await loadData();
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
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Поиск сотрудника..." />
              <CommandEmpty>Сотрудники не найдены</CommandEmpty>
              <CommandGroup>
                {availableUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.first_name} ${user.last_name}`}
                    onSelect={() => addEmployeeToCompany(user.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>
            Нажмите на сотрудника для управления правами доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Роль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <TableCell>
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
    </div>
  );
}
