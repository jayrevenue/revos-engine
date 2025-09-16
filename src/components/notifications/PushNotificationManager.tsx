import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  BellOff,
  Smartphone,
  Monitor,
  TabletSmartphone as Tablet,
  Globe,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Settings,
  Filter,
  Volume2,
  VolumeX,
  Zap,
  Calendar,
  Target,
  DollarSign,
  BarChart3,
  User,
  MessageSquare,
  Mail,
  Slack,
  Plus,
  Edit,
  Trash,
  Eye
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: 'engagement' | 'milestone' | 'alert' | 'reminder' | 'system';
  priority: 'low' | 'normal' | 'high' | 'critical';
  triggers: string[];
  channels: ('push' | 'email' | 'sms' | 'slack' | 'teams')[];
  audience: {
    roles: string[];
    users: string[];
    conditions: any[];
  };
  customization: {
    icon?: string;
    color?: string;
    sound?: string;
    vibration?: boolean;
    actions?: {
      id: string;
      title: string;
      action: string;
    }[];
  };
  isActive: boolean;
  createdAt: Date;
  stats: {
    sent: number;
    delivered: number;
    clicked: number;
    dismissed: number;
  };
}

interface PushSubscription {
  id: string;
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  endpoint: string;
  isActive: boolean;
  subscribedAt: Date;
  lastUsed?: Date;
  preferences: {
    enabled: boolean;
    categories: string[];
    quietHours?: {
      start: string;
      end: string;
      timezone: string;
    };
    frequency: 'immediate' | 'batched' | 'digest';
  };
}

interface NotificationLog {
  id: string;
  templateId: string;
  userId: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked' | 'dismissed';
  sentAt: Date;
  deliveredAt?: Date;
  interactedAt?: Date;
  errorMessage?: string;
  metadata: {
    deviceType?: string;
    browser?: string;
    location?: string;
    clickAction?: string;
  };
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    userIds?: string[];
    roles?: string[];
    segments?: string[];
    conditions?: any[];
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    scheduledAt?: Date;
    timezone: string;
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  results: {
    targeted: number;
    sent: number;
    delivered: number;
    clicked: number;
    errors: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface PushNotificationManagerProps {
  templates: NotificationTemplate[];
  subscriptions: PushSubscription[];
  logs: NotificationLog[];
  campaigns: NotificationCampaign[];
  onCreateTemplate?: (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'stats'>) => void;
  onUpdateTemplate?: (templateId: string, updates: Partial<NotificationTemplate>) => void;
  onSendNotification?: (templateId: string, targetUsers: string[], customData?: any) => void;
  onCreateCampaign?: (campaign: Omit<NotificationCampaign, 'id' | 'results' | 'createdAt'>) => void;
  onUpdateSubscription?: (subscriptionId: string, preferences: any) => void;
}

export const PushNotificationManager = ({
  templates,
  subscriptions,
  logs,
  campaigns,
  onCreateTemplate,
  onUpdateTemplate,
  onSendNotification,
  onCreateCampaign,
  onUpdateSubscription
}: PushNotificationManagerProps) => {
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [testNotificationData, setTestNotificationData] = useState({
    title: 'Test Notification',
    body: 'This is a test notification from RevOS',
    category: 'system' as const,
    priority: 'normal' as const
  });

  // Initialize push notifications
  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/push-sw.js')
        .then((registration) => {
          setServiceWorkerRegistration(registration);
          console.log('Push service worker registered:', registration);
        })
        .catch((error) => {
          console.error('Push service worker registration failed:', error);
        });
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for important updates",
        });
        
        // Subscribe to push notifications
        await subscribeToPush();
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Enable notifications in your browser settings to receive updates",
          variant: "destructive"
        });
      }
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!serviceWorkerRegistration) return;

    try {
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // Would be configured
      });

      // Send subscription to server
      console.log('Push subscription:', subscription);
      
      toast({
        title: "Push Notifications Active",
        description: "You're now subscribed to receive push notifications",
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not subscribe to push notifications",
        variant: "destructive"
      });
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      await requestPermission();
      return;
    }

    // Send browser notification for immediate testing
  const notification = new Notification(testNotificationData.title, {
    body: testNotificationData.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'test-notification',
    requireInteraction: testNotificationData.priority !== 'normal'
  });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);

    toast({
      title: "Test Notification Sent",
      description: "Check your notification panel",
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.isActive).length;
    const recentLogs = logs.filter(l => 
      l.sentAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const deliveryRate = logs.length > 0 
      ? (logs.filter(l => l.status === 'delivered').length / logs.length) * 100 
      : 0;
    
    const clickRate = logs.filter(l => l.status === 'delivered').length > 0 
      ? (logs.filter(l => l.status === 'clicked').length / logs.filter(l => l.status === 'delivered').length) * 100 
      : 0;

    const categoryBreakdown = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      activeSubscriptions,
      totalTemplates: templates.filter(t => t.isActive).length,
      recentNotifications: recentLogs.length,
      activeCampaigns: campaigns.filter(c => c.status === 'running').length,
      deliveryRate: Math.round(deliveryRate),
      clickRate: Math.round(clickRate),
      categoryBreakdown
    };
  }, [subscriptions, templates, logs, campaigns]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Target className="h-4 w-4" />;
      case 'milestone': return <CheckCircle className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'clicked': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'dismissed': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Smartphone className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <MessageSquare className="h-3 w-3" />;
      case 'slack': return <Slack className="h-3 w-3" />;
      case 'teams': return <Users className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Push Notification Manager</h2>
          <p className="text-muted-foreground">
            Manage critical updates and real-time notifications across all channels
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {notificationPermission === 'granted' ? 
              <Bell className="h-4 w-4 text-green-600" /> : 
              <BellOff className="h-4 w-4 text-red-600" />
            }
            <span className="text-sm">
              {notificationPermission === 'granted' ? 'Enabled' : 
               notificationPermission === 'denied' ? 'Blocked' : 'Not enabled'}
            </span>
          </div>
          {notificationPermission !== 'granted' && (
            <Button onClick={requestPermission}>
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </div>

      {/* Permission Alert */}
      {notificationPermission === 'denied' && (
        <Alert className="border-red-200 bg-red-50">
          <BellOff className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Notifications Blocked</AlertTitle>
          <AlertDescription className="text-red-700">
            Notifications are currently blocked. Enable them in your browser settings to receive important updates about engagements, deadlines, and system alerts.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Across all devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              User engagement
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="test">Test & Send</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send test notifications to verify setup and preview content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-title">Title</Label>
                    <Input
                      id="test-title"
                      value={testNotificationData.title}
                      onChange={(e) => setTestNotificationData(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="test-body">Message</Label>
                    <Textarea
                      id="test-body"
                      value={testNotificationData.body}
                      onChange={(e) => setTestNotificationData(prev => ({
                        ...prev,
                        body: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={testNotificationData.category} 
                        onValueChange={(value: any) => setTestNotificationData(prev => ({
                          ...prev,
                          category: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={testNotificationData.priority} 
                        onValueChange={(value: any) => setTestNotificationData(prev => ({
                          ...prev,
                          priority: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={sendTestNotification} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Notification
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{testNotificationData.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {testNotificationData.body}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {getCategoryIcon(testNotificationData.category)}
                            <Badge className={getPriorityColor(testNotificationData.priority)} size="sm">
                              {testNotificationData.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Browser Support</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Push API</span>
                        <Badge variant={'PushManager' in window ? 'default' : 'destructive'} size="sm">
                          {'PushManager' in window ? 'Supported' : 'Not Supported'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service Worker</span>
                        <Badge variant={'serviceWorker' in navigator ? 'default' : 'destructive'} size="sm">
                          {'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <Badge variant={'Notification' in window ? 'default' : 'destructive'} size="sm">
                          {'Notification' in window ? 'Supported' : 'Not Supported'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Send common notifications instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <span className="font-medium">System Alert</span>
                  <span className="text-xs text-muted-foreground">Critical system update</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Deadline Reminder</span>
                  <span className="text-xs text-muted-foreground">Upcoming milestones</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Milestone Complete</span>
                  <span className="text-xs text-muted-foreground">Achievement notification</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Notification Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-configured notification templates for different scenarios
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(template => (
              <Card key={template.id} className={!template.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(template.priority)} size="sm">
                        {template.priority}
                      </Badge>
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) => 
                          onUpdateTemplate?.(template.id, { isActive: checked })
                        }
                      />
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {template.body}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sent:</span>
                      <div className="font-medium">{template.stats.sent}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivered:</span>
                      <div className="font-medium">{template.stats.delivered}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicked:</span>
                      <div className="font-medium">{template.stats.clicked}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <div className="font-medium">
                        {template.stats.delivered > 0 ? 
                          Math.round((template.stats.clicked / template.stats.delivered) * 100) : 0}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Channels:</div>
                    <div className="flex gap-1">
                      {template.channels.map(channel => (
                        <Badge key={channel} variant="outline" size="sm" className="flex items-center gap-1">
                          {getChannelIcon(channel)}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onSendNotification?.(template.id, [], {})}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Notification Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Scheduled and automated notification campaigns
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                    </div>
                    <Badge variant={
                      campaign.status === 'running' ? 'default' :
                      campaign.status === 'completed' ? 'secondary' :
                      campaign.status === 'scheduled' ? 'outline' :
                      'destructive'
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Targeted:</span>
                      <div className="font-medium">{campaign.results.targeted}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sent:</span>
                      <div className="font-medium">{campaign.results.sent}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivered:</span>
                      <div className="font-medium">{campaign.results.delivered}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicked:</span>
                      <div className="font-medium">{campaign.results.clicked}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>
                      <div className="font-medium text-red-600">{campaign.results.errors}</div>
                    </div>
                  </div>

                  {campaign.schedule.type === 'scheduled' && campaign.schedule.scheduledAt && (
                    <div className="text-sm text-muted-foreground mb-4">
                      Scheduled for: {campaign.schedule.scheduledAt.toLocaleString()}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    {campaign.status === 'draft' && (
                      <Button size="sm">
                        <Send className="h-3 w-3 mr-1" />
                        Launch
                      </Button>
                    )}
                    {campaign.status === 'running' && (
                      <Button size="sm" variant="outline">
                        Pause
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Push Subscribers ({stats.activeSubscriptions})</CardTitle>
              <CardDescription>
                Manage user notification preferences and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {subscriptions.map(subscription => (
                    <div key={subscription.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {subscription.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> :
                         subscription.deviceType === 'tablet' ? <Tablet className="h-4 w-4" /> :
                         <Monitor className="h-4 w-4" />}
                        {subscription.isActive ? 
                          <Bell className="h-4 w-4 text-green-600" /> : 
                          <BellOff className="h-4 w-4 text-red-600" />
                        }
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">User {subscription.userId}</span>
                          <Badge variant="outline" size="sm">{subscription.browser}</Badge>
                          <Badge variant="outline" size="sm">{subscription.deviceType}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Subscribed: {subscription.subscribedAt.toLocaleDateString()}
                          {subscription.lastUsed && ` • Last used: ${subscription.lastUsed.toLocaleDateString()}`}
                        </div>
                        {subscription.preferences.quietHours && (
                          <div className="text-xs text-muted-foreground">
                            Quiet hours: {subscription.preferences.quietHours.start} - {subscription.preferences.quietHours.end}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={subscription.preferences.frequency === 'immediate' ? 'bg-green-100 text-green-800' :
                                         subscription.preferences.frequency === 'batched' ? 'bg-blue-100 text-blue-800' :
                                         'bg-yellow-100 text-yellow-800'} size="sm">
                          {subscription.preferences.frequency}
                        </Badge>
                        
                        <Switch
                          checked={subscription.preferences.enabled}
                          onCheckedChange={(checked) => 
                            onUpdateSubscription?.(subscription.id, {
                              ...subscription.preferences,
                              enabled: checked
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Activity</CardTitle>
              <CardDescription>
                Real-time log of all notification delivery and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {logs.slice(0, 50).map(log => (
                    <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category)}
                        {getStatusIcon(log.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{log.title}</span>
                          <Badge className={getPriorityColor(log.priority)} size="sm">
                            {log.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {log.body}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sent: {log.sentAt.toLocaleString()}
                          {log.deliveredAt && ` • Delivered: ${log.deliveredAt.toLocaleString()}`}
                          {log.metadata.deviceType && ` • ${log.metadata.deviceType}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {log.channels.map(channel => (
                            <div key={channel} className="flex items-center">
                              {getChannelIcon(channel)}
                            </div>
                          ))}
                        </div>
                        <Badge className={
                          log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          log.status === 'clicked' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        } size="sm">
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};