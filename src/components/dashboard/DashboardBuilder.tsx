import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable,
  CSS,
} from '@dnd-kit/sortable';
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  Target, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  Save,
  Layout,
  Grid,
  Maximize2,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';

export interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'activity' | 'calendar';
  title: string;
  description?: string;
  data_source: string;
  config: {
    chart_type?: 'line' | 'bar' | 'pie' | 'area';
    size: 'small' | 'medium' | 'large' | 'full';
    position: { x: number; y: number };
    dimensions: { w: number; h: number };
    color?: string;
    refresh_rate?: number;
    filters?: any[];
    visible?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout_config: {
    columns: number;
    gap: number;
    responsive: boolean;
  };
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DashboardBuilderProps {
  dashboardId?: string;
  template?: DashboardLayout;
  onSave?: (dashboard: DashboardLayout) => void;
  readOnly?: boolean;
}

// Widget Templates
const WIDGET_TEMPLATES = [
  {
    id: 'revenue-chart',
    type: 'chart',
    title: 'Revenue Trend',
    description: 'Monthly revenue performance',
    data_source: 'revenue_data',
    config: {
      chart_type: 'line',
      size: 'large',
      position: { x: 0, y: 0 },
      dimensions: { w: 6, h: 4 },
      color: '#8884d8'
    },
    icon: TrendingUp
  },
  {
    id: 'engagement-stats',
    type: 'metric',
    title: 'Active Engagements',
    description: 'Current engagement count',
    data_source: 'engagement_data',
    config: {
      size: 'small',
      position: { x: 6, y: 0 },
      dimensions: { w: 3, h: 2 },
      color: '#82ca9d'
    },
    icon: Target
  },
  {
    id: 'client-distribution',
    type: 'chart',
    title: 'Client Distribution',
    description: 'Clients by industry',
    data_source: 'client_data',
    config: {
      chart_type: 'pie',
      size: 'medium',
      position: { x: 9, y: 0 },
      dimensions: { w: 3, h: 4 },
      color: '#ffc658'
    },
    icon: PieChart
  },
  {
    id: 'activity-feed',
    type: 'activity',
    title: 'Recent Activity',
    description: 'Latest team activities',
    data_source: 'activity_data',
    config: {
      size: 'medium',
      position: { x: 0, y: 4 },
      dimensions: { w: 4, h: 6 },
      refresh_rate: 30
    },
    icon: MessageSquare
  },
  {
    id: 'team-metrics',
    type: 'metric',
    title: 'Team Performance',
    description: 'Key team metrics',
    data_source: 'team_data',
    config: {
      size: 'small',
      position: { x: 4, y: 4 },
      dimensions: { w: 4, h: 2 }
    },
    icon: Users
  },
  {
    id: 'calendar-view',
    type: 'calendar',
    title: 'Upcoming Events',
    description: 'Schedule and deadlines',
    data_source: 'calendar_data',
    config: {
      size: 'medium',
      position: { x: 8, y: 4 },
      dimensions: { w: 4, h: 6 }
    },
    icon: Calendar
  }
] as const;

// Sortable Widget Component
const SortableWidget = ({ widget, onEdit, onDelete, isDragging }: {
  widget: Widget;
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: string) => void;
  isDragging: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return BarChart3;
      case 'metric': return Target;
      case 'activity': return MessageSquare;
      case 'calendar': return Calendar;
      case 'table': return Grid;
      default: return Layout;
    }
  };

  const Icon = getWidgetIcon(widget.type);
  const sizeClass = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-2',
    large: 'col-span-3 row-span-2',
    full: 'col-span-4 row-span-3'
  }[widget.config.size];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${sizeClass} relative group`}
    >
      <Card className="h-full border-2 border-dashed border-muted hover:border-primary transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
              >
                <Move className="h-4 w-4 text-muted-foreground" />
              </div>
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{widget.title}</span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(widget)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => onDelete(widget.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {widget.description && (
            <p className="text-xs text-muted-foreground">{widget.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-24 bg-muted/30 rounded border border-dashed">
            <Icon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground capitalize">
              {widget.type} Widget
            </span>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-xs">
              {widget.config.size}
            </Badge>
            <span className="text-muted-foreground">
              {widget.data_source.replace('_', ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardBuilder = ({
  dashboardId,
  template,
  onSave,
  readOnly = false
}: DashboardBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardLayout>(
    template || {
      id: dashboardId || '',
      name: 'New Dashboard',
      description: '',
      widgets: [],
      layout_config: {
        columns: 12,
        gap: 4,
        responsive: true
      },
      is_template: false,
      created_by: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );
  
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setDashboard(prev => {
        const oldIndex = prev.widgets.findIndex(w => w.id === active.id);
        const newIndex = prev.widgets.findIndex(w => w.id === over?.id);
        
        return {
          ...prev,
          widgets: arrayMove(prev.widgets, oldIndex, newIndex),
          updated_at: new Date().toISOString()
        };
      });
    }
    
    setActiveId(null);
  }, []);

  const addWidget = (template: typeof WIDGET_TEMPLATES[0]) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: template.type as Widget['type'],
      title: template.title,
      description: template.description,
      data_source: template.data_source,
      config: {
        ...template.config,
        visible: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updated_at: new Date().toISOString()
    }));

    toast({
      title: "Widget Added",
      description: `${template.title} has been added to your dashboard`
    });
  };

  const editWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsEditModalOpen(true);
  };

  const updateWidget = (updatedWidget: Widget) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w),
      updated_at: new Date().toISOString()
    }));
    setIsEditModalOpen(false);
    setSelectedWidget(null);
  };

  const deleteWidget = (widgetId: string) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      updated_at: new Date().toISOString()
    }));

    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard"
    });
  };

  const saveDashboard = async () => {
    try {
      if (dashboardId) {
        // Update existing dashboard
        const { error } = await supabase
          .from('dashboards')
          .update({
            name: dashboard.name,
            description: dashboard.description,
            widgets: dashboard.widgets,
            layout_config: dashboard.layout_config,
            updated_at: new Date().toISOString()
          })
          .eq('id', dashboardId);

        if (error) throw error;
      } else {
        // Create new dashboard
        const { data, error } = await supabase
          .from('dashboards')
          .insert({
            ...dashboard,
            created_by: user?.id
          })
          .select()
          .single();

        if (error) throw error;
        setDashboard(data);
      }

      onSave?.(dashboard);
      
      toast({
        title: "Dashboard Saved",
        description: "Your dashboard has been saved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save dashboard",
        variant: "destructive"
      });
    }
  };

  const dragOverlay = useMemo(() => {
    if (!activeId) return null;
    
    const widget = dashboard.widgets.find(w => w.id === activeId);
    if (!widget) return null;
    
    return (
      <div className="rotate-12 scale-105">
        <SortableWidget
          widget={widget}
          onEdit={editWidget}
          onDelete={deleteWidget}
          isDragging={true}
        />
      </div>
    );
  }, [activeId, dashboard.widgets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Dashboard Builder</h2>
          <p className="text-muted-foreground">
            Drag and drop widgets to create your custom dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          
          {!readOnly && (
            <Button onClick={saveDashboard}>
              <Save className="h-4 w-4 mr-2" />
              Save Dashboard
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Widget Library */}
        {!previewMode && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Widget Library</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {WIDGET_TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      return (
                        <Button
                          key={template.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => addWidget(template)}
                          disabled={readOnly}
                        >
                          <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium text-sm">{template.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className={previewMode ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <Card className="min-h-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Input
                    value={dashboard.name}
                    onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                    placeholder="Dashboard Name"
                    disabled={readOnly}
                  />
                  <Input
                    value={dashboard.description || ''}
                    onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0 mt-1"
                    placeholder="Dashboard description..."
                    disabled={readOnly}
                  />
                </div>
                
                <Badge variant="secondary">
                  {dashboard.widgets.length} widgets
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className={`grid gap-4 grid-cols-12 min-h-96 ${previewMode ? 'pointer-events-none' : ''}`}>
                  <SortableContext items={dashboard.widgets.map(w => w.id)} strategy={rectSortingStrategy}>
                    {dashboard.widgets.map((widget) => (
                      <SortableWidget
                        key={widget.id}
                        widget={widget}
                        onEdit={editWidget}
                        onDelete={deleteWidget}
                        isDragging={widget.id === activeId}
                      />
                    ))}
                  </SortableContext>
                  
                  {dashboard.widgets.length === 0 && (
                    <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                      <Layout className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Your dashboard is empty</h3>
                      <p className="text-muted-foreground mb-4">
                        Add widgets from the library to get started
                      </p>
                    </div>
                  )}
                </div>
                
                <DragOverlay>{dragOverlay}</DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Widget Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
          </DialogHeader>
          
          {selectedWidget && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={selectedWidget.title}
                  onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Input
                  value={selectedWidget.description || ''}
                  onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label>Size</Label>
                <Select
                  value={selectedWidget.config.size}
                  onValueChange={(value) => setSelectedWidget(prev => prev ? {
                    ...prev,
                    config: { ...prev.config, size: value as 'small' | 'medium' | 'large' | 'full' }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1x1)</SelectItem>
                    <SelectItem value="medium">Medium (2x2)</SelectItem>
                    <SelectItem value="large">Large (3x2)</SelectItem>
                    <SelectItem value="full">Full Width (4x3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedWidget.type === 'chart' && (
                <div>
                  <Label>Chart Type</Label>
                  <Select
                    value={selectedWidget.config.chart_type}
                    onValueChange={(value) => setSelectedWidget(prev => prev ? {
                      ...prev,
                      config: { ...prev.config, chart_type: value as 'line' | 'bar' | 'pie' | 'area' }
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => updateWidget(selectedWidget)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};