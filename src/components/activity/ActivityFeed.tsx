import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Users, 
  Target, 
  DollarSign, 
  Bot, 
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'engagement_created' | 'engagement_updated' | 'comment_added' | 'outcome_achieved' | 'agent_deployed' | 'user_mentioned' | 'milestone_reached' | 'document_shared';
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  entity_type: 'engagement' | 'outcome' | 'agent' | 'comment' | 'document';
  entity_id: string;
  metadata?: any;
  created_at: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ActivityFeedProps {
  engagementId?: string;
  showFilters?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export const ActivityFeed = ({ 
  engagementId, 
  showFilters = true, 
  maxItems = 50,
  compact = false 
}: ActivityFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchActivities();
    setupRealtimeSubscription();
  }, [engagementId, filter]);

  const fetchActivities = async () => {
    try {
      let query = (supabase as any)
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (engagementId) {
        query = query.eq('entity_id', engagementId);
      }

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedActivities: ActivityItem[] = (data || []).map((activity: any) => ({
        ...activity,
        user_name: activity.user_name || 'Unknown User',
        user_avatar: activity.user_avatar,
      }));

      setActivities(formattedActivities);
      setUnreadCount(formattedActivities.filter((a: any) => !a.is_read).length);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load activity feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        const newActivity = payload.new as ActivityItem;
        setActivities(prev => [newActivity, ...prev].slice(0, maxItems));
        setUnreadCount(prev => prev + 1);
        
        // Show toast for high priority activities
        if (newActivity.priority === 'high' && newActivity.user_id !== user?.id) {
          toast({
            title: newActivity.title,
            description: newActivity.description,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (activityId: string) => {
    try {
      await (supabase as any)
        .from('activities')
        .update({ is_read: true } as any)
        .eq('id', activityId);

      setActivities(prev => 
        prev.map(a => a.id === activityId ? { ...a, is_read: true } : a)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark activity as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await (supabase as any)
        .from('activities')
        .update({ is_read: true } as any)
        .eq('is_read', false);

      setActivities(prev => prev.map(a => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all activities as read:', error);
    }
  };

  const getActivityIcon = (type: string, priority: string) => {
    const iconClass = `h-4 w-4 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-gray-500'}`;
    
    switch (type) {
      case 'engagement_created':
      case 'engagement_updated':
        return <Target className={iconClass} />;
      case 'comment_added':
        return <MessageSquare className={iconClass} />;
      case 'outcome_achieved':
        return <CheckCircle className={iconClass} />;
      case 'agent_deployed':
        return <Bot className={iconClass} />;
      case 'user_mentioned':
        return <Users className={iconClass} />;
      case 'milestone_reached':
        return <TrendingUp className={iconClass} />;
      case 'document_shared':
        return <FileText className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'engagement_created', label: 'Engagements' },
    { value: 'comment_added', label: 'Comments' },
    { value: 'outcome_achieved', label: 'Outcomes' },
    { value: 'agent_deployed', label: 'AI Agents' },
    { value: 'user_mentioned', label: 'Mentions' }
  ];

  if (loading) {
    return (
      <Card className={compact ? 'h-96' : ''}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'h-96' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Activity Feed
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="flex gap-2 mt-4">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className={compact ? 'h-80' : 'h-96'}>
          <div className="p-4 space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities yet</p>
                <p className="text-sm">Activity will appear here as your team collaborates</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    !activity.is_read 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => !activity.is_read && markAsRead(activity.id)}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={activity.user_avatar} />
                    <AvatarFallback>
                      {activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type, activity.priority)}
                        <span className="font-medium text-sm">{activity.title}</span>
                        {!activity.is_read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user_name}</p>
                    
                    {activity.metadata && (
                      <div className="flex gap-2 mt-2">
                        {activity.metadata.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};