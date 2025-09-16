import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AtSign, 
  MessageSquare, 
  Users, 
  Target, 
  Bot,
  X,
  Settings,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'comment' | 'engagement_update' | 'outcome_achieved' | 'agent_deployed' | 'assignment';
  title: string;
  message: string;
  entity_type?: 'engagement' | 'outcome' | 'agent' | 'comment';
  entity_id?: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  metadata?: any;
  created_at: string;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchNotifications();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formatted = (data || []).map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        type: (a.type as Notification['type']) || 'comment',
        title: a.title,
        message: a.description,
        entity_type: (a.entity_type as Notification['entity_type']) || undefined,
        entity_id: a.entity_id || undefined,
        sender_id: undefined,
        sender_name: a.metadata?.sender_name || 'System',
        sender_avatar: a.metadata?.sender_avatar || undefined,
        is_read: a.is_read,
        priority: (a.priority as Notification['priority']) || 'medium',
        action_url: a.metadata?.action_url || undefined,
        metadata: a.metadata || {},
        created_at: a.created_at,
      })) as Notification[];

      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => !n.is_read).length);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`activities-${user?.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        const a: any = payload.new;
        const newNotification: Notification = {
          id: a.id,
          user_id: a.user_id,
          type: (a.type as Notification['type']) || 'comment',
          title: a.title,
          message: a.description,
          entity_type: (a.entity_type as Notification['entity_type']) || undefined,
          entity_id: a.entity_id || undefined,
          sender_id: undefined,
          sender_name: a.metadata?.sender_name || 'System',
          sender_avatar: a.metadata?.sender_avatar || undefined,
          is_read: a.is_read,
          priority: (a.priority as Notification['priority']) || 'medium',
          action_url: a.metadata?.action_url || undefined,
          metadata: a.metadata || {},
          created_at: a.created_at,
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        if (newNotification.priority === 'high' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico'
          });
        }

        if (newNotification.type === 'mention') {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('activities')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('activities')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('activities')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'engagement_update':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'agent_deployed':
        return <Bot className="h-4 w-4 text-purple-500" />;
      case 'assignment':
        return <Users className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'mention', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length },
    { value: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { value: 'engagement_update', label: 'Updates', count: notifications.filter(n => n.type === 'engagement_update').length }
  ];

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                {filterOptions.map(option => (
                  <TabsTrigger key={option.value} value={option.value} className="text-xs">
                    {option.label}
                    {option.count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={filter} className="mt-0">
                <ScrollArea className="h-96">
                  <div className="p-2">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                              !notification.is_read 
                                ? getPriorityColor(notification.priority)
                                : 'border-l-transparent hover:border-l-gray-200'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </span>
                                  {!notification.is_read && (
                                    <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                {notification.sender_name && notification.sender_name !== 'System' && (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={notification.sender_avatar} />
                                      <AvatarFallback className="text-xs">
                                        {notification.sender_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{notification.sender_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
