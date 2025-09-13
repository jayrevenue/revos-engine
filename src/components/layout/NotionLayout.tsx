import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PanelLeft, 
  Settings, 
  Search, 
  Bell, 
  User,
  BarChart3,
  Users,
  Bot,
  Target,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react";

interface NotionLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  items?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard"
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    href: "/analytics",
    items: [
      { title: "Overview", icon: BarChart3, href: "/analytics" },
      { title: "ROI Analysis", icon: DollarSign, href: "/analytics/roi" },
      { title: "Performance", icon: Target, href: "/analytics/performance" },
    ]
  },
  {
    title: "Engagements",
    icon: Target,
    href: "/engagements"
  },
  {
    title: "AI Agents",
    icon: Bot,
    href: "/ai-agents",
    badge: "5"
  },
  {
    title: "Clients",
    icon: Users,
    href: "/clients"
  },
  {
    title: "Projects",
    icon: FileText,
    href: "/projects"
  },
  {
    title: "Revenue",
    icon: DollarSign,
    href: "/revenue"
  },
  {
    title: "Scheduling",
    icon: Calendar,
    href: "/scheduling"
  }
];

export function NotionLayout({ children, sidebar, className }: NotionLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-sm bg-primary"></div>
              </div>
              <span className="font-semibold text-foreground">TRS RevOS</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-muted/5 transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden"
          )}
        >
          <ScrollArea className="h-full p-4">
            <nav className="space-y-2">
              {navigationItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <a
                    href={item.href}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                  
                  {item.items && (
                    <div className="ml-6 space-y-1">
                      {item.items.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.href}
                          className="flex items-center gap-3 w-full px-3 py-1.5 text-sm text-muted-foreground rounded-md hover:bg-muted/30 hover:text-foreground transition-colors"
                        >
                          <subItem.icon className="h-3 w-3" />
                          <span>{subItem.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            
            <Separator className="my-4" />
            
            {/* Additional Sidebar Content */}
            {sidebar}
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}