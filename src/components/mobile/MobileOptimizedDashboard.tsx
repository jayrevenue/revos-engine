import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Menu,
  Home,
  Users,
  BarChart3,
  Calendar,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Target,
  Activity,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Settings,
  User,
  LogOut
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  enabled: boolean;
}

interface MobileWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'activity' | 'progress';
  priority: number;
  size: 'small' | 'medium' | 'large';
  data: {
    value?: string | number;
    change?: number;
    items?: any[];
    progress?: number;
    target?: number;
  };
  refreshable: boolean;
  collapsible: boolean;
}

interface MobileLayout {
  columns: number;
  orientation: 'portrait' | 'landscape';
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  widgets: string[];
  customization: {
    compactMode: boolean;
    hideLabels: boolean;
    swipeGestures: boolean;
    pullToRefresh: boolean;
  };
}

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'left' | 'right' | 'up' | 'down';
  target: string;
  action: string;
  enabled: boolean;
}

interface MobileOptimizedDashboardProps {
  widgets: MobileWidget[];
  quickActions: QuickAction[];
  layout: MobileLayout;
  touchGestures: TouchGesture[];
  onWidgetAction?: (widgetId: string, action: string) => void;
  onLayoutChange?: (newLayout: MobileLayout) => void;
  onQuickAction?: (actionId: string) => void;
}

export const MobileOptimizedDashboard = ({
  widgets,
  quickActions,
  layout,
  touchGestures,
  onWidgetAction,
  onLayoutChange,
  onQuickAction
}: MobileOptimizedDashboardProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedWidgets, setExpandedWidgets] = useState<string[]>([]);
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Detect device and orientation
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect device type
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      // Detect orientation
      setDeviceOrientation(width < height ? 'portrait' : 'landscape');
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Touch gesture handling
  useEffect(() => {
    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = startY - currentY;
      const deltaX = startX - currentX;

      // Pull to refresh
      if (layout.customization.pullToRefresh && deltaY < -100 && Math.abs(deltaX) < 50) {
        if (!isRefreshing) {
          handleRefresh();
        }
      }

      // Horizontal swipes for navigation
      if (layout.customization.swipeGestures) {
        if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
          const direction = deltaX > 0 ? 'left' : 'right';
          const gesture = touchGestures.find(g => 
            g.type === 'swipe' && g.direction === direction && g.enabled
          );
          
          if (gesture) {
            handleGestureAction(gesture.action);
          }
        }
      }
    };

    if (deviceType === 'mobile' || deviceType === 'tablet') {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [deviceType, isRefreshing, layout.customization, touchGestures]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated",
      });
    }, 1500);
  };

  const handleGestureAction = (action: string) => {
    switch (action) {
      case 'open-sidebar':
        setSidebarOpen(true);
        break;
      case 'open-search':
        setSearchOpen(true);
        break;
      case 'refresh':
        handleRefresh();
        break;
      default:
        console.log('Unknown gesture action:', action);
    }
  };

  const toggleWidgetExpansion = (widgetId: string) => {
    setExpandedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  // Sort widgets by priority for mobile layout
  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => a.priority - b.priority);
  }, [widgets]);

  // Get grid classes based on device and layout
  const getGridClasses = () => {
    const { columns, orientation } = layout;
    const cols = deviceType === 'mobile' ? 1 : 
                 deviceType === 'tablet' ? (orientation === 'portrait' ? 2 : 3) : columns;
    
    return `grid grid-cols-${cols} gap-4`;
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'metric': return <BarChart3 className="h-4 w-4" />;
      case 'chart': return <TrendingUp className="h-4 w-4" />;
      case 'list': return <Users className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'progress': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderWidget = (widget: MobileWidget) => {
    const isExpanded = expandedWidgets.includes(widget.id);
    const isCompact = layout.customization.compactMode;

    return (
      <Card 
        key={widget.id} 
        className={`${widget.size === 'large' && deviceType !== 'mobile' ? 'col-span-2' : ''} 
                   ${isCompact ? 'p-2' : ''} transition-all duration-200 hover:shadow-md`}
      >
        <CardHeader className={`${isCompact ? 'pb-2' : 'pb-4'} ${layout.customization.hideLabels && isCompact ? 'sr-only' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWidgetIcon(widget.type)}
              <CardTitle className={`${isCompact ? 'text-sm' : 'text-base'}`}>
                {widget.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {widget.refreshable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onWidgetAction?.(widget.id, 'refresh')}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              {widget.collapsible && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleWidgetExpansion(widget.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                  }
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {(!widget.collapsible || isExpanded) && (
          <CardContent className={isCompact ? 'pt-0' : ''}>
            {widget.type === 'metric' && (
              <div className="space-y-2">
                <div className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {widget.data.value}
                </div>
                {widget.data.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm ${
                    widget.data.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {widget.data.change > 0 ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    }
                    {Math.abs(widget.data.change)}%
                  </div>
                )}
              </div>
            )}

            {widget.type === 'progress' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{widget.data.progress}%</span>
                </div>
                <Progress value={widget.data.progress} className="h-2" />
                {widget.data.target && (
                  <div className="text-xs text-muted-foreground">
                    Target: {widget.data.target}
                  </div>
                )}
              </div>
            )}

            {widget.type === 'list' && widget.data.items && (
              <div className="space-y-2">
                {widget.data.items.slice(0, isCompact ? 3 : 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      <span className="text-sm truncate">{item.name}</span>
                    </div>
                    {item.value && (
                      <span className="text-sm font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
                {widget.data.items.length > (isCompact ? 3 : 5) && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    +{widget.data.items.length - (isCompact ? 3 : 5)} more
                  </div>
                )}
              </div>
            )}

            {widget.type === 'activity' && widget.data.items && (
              <div className="space-y-3">
                {widget.data.items.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'chart' && (
              <div className="h-32 flex items-center justify-center bg-muted/20 rounded">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chart visualization</p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>RevOS</SheetTitle>
                  <SheetDescription>Revenue Operations System</SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Home className="h-4 w-4 mr-3" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-3" />
                      Engagements
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Analytics
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-3" />
                      Scheduling
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                  </nav>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">John Doe</div>
                      <div className="text-xs text-muted-foreground">john@example.com</div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center py-2 bg-primary/10">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Refreshing...</span>
          </div>
        )}
      </header>

      {/* Quick Actions Bar */}
      <div className="p-4 pb-2">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {quickActions.filter(action => action.enabled).map(action => (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                onClick={() => {
                  onQuickAction?.(action.id);
                  action.action();
                }}
                className="flex-shrink-0 gap-2"
                style={{ borderColor: action.color }}
              >
                {action.icon}
                <span className="whitespace-nowrap">{action.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Device Info Badge (Development Only) */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="flex items-center gap-1">
            {deviceType === 'mobile' ? <Smartphone className="h-3 w-3" /> :
             deviceType === 'tablet' ? <Tablet className="h-3 w-3" /> :
             <Monitor className="h-3 w-3" />}
            {deviceType} • {deviceOrientation}
          </Badge>
          {layout.customization.compactMode && (
            <Badge variant="secondary">Compact Mode</Badge>
          )}
          {layout.customization.swipeGestures && (
            <Badge variant="secondary">Gestures Enabled</Badge>
          )}
        </div>

        {/* Widgets Grid */}
        <div className={getGridClasses()}>
          {sortedWidgets.map(renderWidget)}
        </div>

        {/* FAB for mobile */}
        {deviceType === 'mobile' && (
          <div className="fixed bottom-6 right-6">
            <Drawer>
              <DrawerTrigger asChild>
                <Button size="lg" className="rounded-full h-14 w-14">
                  <Plus className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Quick Actions</DrawerTitle>
                  <DrawerDescription>Choose an action to perform</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-2">
                  {quickActions.map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        onQuickAction?.(action.id);
                        action.action();
                      }}
                    >
                      {action.icon}
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </main>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed top-0 left-0 right-0 bg-background border-b p-4">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={() => setSearchOpen(false)}>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <div className="pt-20 p-4">
            <div className="text-center text-muted-foreground py-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search...</p>
            </div>
          </div>
        </div>
      )}

      {/* Gesture Helper (Development Only) */}
      {layout.customization.swipeGestures && (
        <div className="fixed bottom-2 left-2 bg-black/80 text-white p-2 rounded text-xs">
          <div>← → Navigate</div>
          <div>↓ Refresh</div>
        </div>
      )}
    </div>
  );
};