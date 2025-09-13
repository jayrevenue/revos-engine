import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Search,
  Menu,
  X,
  Home,
  Users,
  Briefcase,
  DollarSign,
  Bot,
  UserIcon,
  Calendar,
  Settings,
  BarChart3,
  Building,
  BookOpen,
  Zap,
  Target,
  Shield,
  ChevronRight,
  ChevronDown,
  FileText,
  Database,
  TrendingUp,
  Globe,
  User
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const sidebarItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { 
    name: "Engagements", 
    href: "/engagements", 
    icon: Briefcase,
    children: [
      { name: "All Engagements", href: "/engagements", icon: Briefcase },
      { name: "New Engagement", href: "/engagements/new", icon: Target },
    ]
  },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Executive", href: "/executive", icon: TrendingUp },
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "IP Library", href: "/library", icon: BookOpen },
  { name: "Empire", href: "/empire", icon: Globe },
  { 
    name: "Client Management", 
    href: "/clients", 
    icon: Building,
    children: [
      { name: "All Clients", href: "/clients", icon: Building },
      { name: "Add Client", href: "/clients/new", icon: Target },
    ]
  },
  { 
    name: "Revenue Operations", 
    href: "/revenue", 
    icon: DollarSign,
    children: [
      { name: "Revenue Dashboard", href: "/revenue", icon: DollarSign },
      { name: "New Revenue Entry", href: "/revenue/new", icon: Target },
    ]
  },
  { 
    name: "AI Agents", 
    href: "/agents", 
    icon: Bot,
    children: [
      { name: "Agent Dashboard", href: "/agents", icon: Bot },
      { name: "Deploy New Agent", href: "/agents/new", icon: Zap },
    ]
  },
  { 
    name: "User Management", 
    href: "/users", 
    icon: Users,
    children: [
      { name: "All Users", href: "/users", icon: Users },
      { name: "Invite User", href: "/users/new", icon: UserIcon },
    ]
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-expand sidebar item that contains current route
  useEffect(() => {
    const currentPath = location.pathname;
    const parentItem = sidebarItems.find(item => 
      item.children?.some(child => child.href === currentPath)
    );
    if (parentItem && !expandedItems.includes(parentItem.name)) {
      setExpandedItems(prev => [...prev, parentItem.name]);
    }
  }, [location.pathname, expandedItems]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/dashboard' && location.pathname.startsWith(href));
  };

  const isParentActive = (item: NavItem) => {
    return item.children?.some(child => isActive(child.href)) || isActive(item.href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemIsActive = isActive(item.href);
    const parentIsActive = isParentActive(item);

    if (hasChildren) {
      return (
        <div key={item.name} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              parentIsActive
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            <item.icon className={`mr-3 h-4 w-4 ${parentIsActive ? 'text-primary' : ''}`} />
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
          itemIsActive
            ? 'bg-primary/10 text-primary border-l-2 border-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className={`mr-3 h-4 w-4 ${itemIsActive ? 'text-primary' : ''}`} />
        <span>{item.name}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TRS RevOS
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {sidebarItems.map(item => renderNavItem(item))}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Revenue Scientist
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search */}
              <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search engagements, clients, agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500" />
              </Button>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-auto ${className || ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;