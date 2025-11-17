import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  LineChart,
  Activity,
  ShoppingCart,
  Shield,
  Bell,
  User,
  BookOpen,
  HelpCircle,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Главная", href: "/", icon: LayoutDashboard },
  { name: "Реестр", href: "/registry", icon: Database },
  { name: "Аналитика и прогноз", href: "/analytics", icon: LineChart },
  { name: "Мониторинг урожая", href: "/monitoring", icon: Activity },
  { name: "Товарная биржа", href: "/exchange", icon: ShoppingCart },
  { name: "Страхование", href: "/insurance", icon: Shield },
  { name: "CRM", href: "/crm", icon: Users },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [companyName, setCompanyName] = useState<string>("Загрузка...");
  const [userRole, setUserRole] = useState<string>("Пользователь");
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Map navigation routes to module IDs
  const routeToModule: Record<string, string> = {
    "/": "dashboard",
    "/registry": "registry",
    "/analytics": "analytics",
    "/monitoring": "monitoring",
    "/exchange": "exchange",
    "/insurance": "insurance",
    "/crm": "crm",
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      // Load company name
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profile?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', profile.company_id)
          .single();

        if (company) {
          setCompanyName(company.name);
        }
      }

      // Load user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role === 'admin' ? 'Администратор' : 'Пользователь');
      }

      // Load permissions
      const { data: permissionsData } = await supabase
        .from('user_permissions')
        .select('module, access_level')
        .eq('user_id', user.id);

      const permissionsMap: Record<string, string> = {};
      
      // Default all modules to 'edit' (full access) for admins and when no permissions set
      Object.values(routeToModule).forEach(module => {
        permissionsMap[module] = 'edit';
      });

      // Override with actual permissions
      if (permissionsData && permissionsData.length > 0) {
        permissionsData.forEach(perm => {
          permissionsMap[perm.module] = perm.access_level;
        });
      }

      setPermissions(permissionsMap);
      setLoading(false);
    };

    loadUserData();
  }, [user]);

  // Filter navigation based on permissions (hide 'closed' modules)
  const filteredNavigation = navigation.filter(item => {
    const moduleId = routeToModule[item.href];
    return !moduleId || permissions[moduleId] !== 'closed';
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Activity className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-sidebar-foreground">
                Система мониторинга и прогнозирования
              </h1>
              <p className="text-xs text-sidebar-foreground/70">в сельском хозяйстве</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Company Info */}
        <div className="p-4 border-t border-sidebar-border">
          <Link to="/account">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {companyName}
                </p>
                <p className="text-xs text-sidebar-foreground/70">{userRole}</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">АгроМониторинг</span>
            </div>

            {/* Company Info - Desktop */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{companyName}</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Справочник">
                <BookOpen className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Помощь">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Уведомления">
                <Bell className="h-5 w-5" />
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="icon" title="Профиль">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" title="Выход" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="lg:hidden border-b border-border bg-card overflow-x-auto">
          <div className="flex items-center gap-2 px-4 py-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "gap-2 whitespace-nowrap",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
