import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { CommentSystem } from '@/components/collaboration/CommentSystem';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Share, 
  Eye, 
  EyeOff, 
  Link, 
  Download, 
  Calendar, 
  Users,
  Target,
  TrendingUp,
  FileText,
  Settings,
  Lock,
  Unlock,
  Copy,
  Send,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface SharedWorkspaceProps {
  engagementId: string;
  isClientView?: boolean;
}

interface WorkspaceSettings {
  id: string;
  engagement_id: string;
  is_public: boolean;
  share_url: string;
  client_access_level: 'view_only' | 'comment' | 'collaborate';
  visible_sections: string[];
  allow_downloads: boolean;
  show_team_activity: boolean;
  show_internal_comments: boolean;
  custom_branding: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface Engagement {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
  budget: number;
  progress: number;
  org: {
    name: string;
    logo?: string;
  };
  outcomes: Array<{
    id: string;
    name: string;
    target_value: number;
    current_value: number;
    unit: string;
    progress: number;
  }>;
  deliverables: Array<{
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    due_date: string;
    completion_percentage: number;
  }>;
  team_members: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
}

export const SharedWorkspace = ({ engagementId, isClientView = false }: SharedWorkspaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharingModal, setSharingModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    client_access_level: 'view_only' as const,
    visible_sections: ['overview', 'progress', 'outcomes', 'timeline'],
    allow_downloads: false,
    show_team_activity: true,
    show_internal_comments: false,
    expires_in_days: 30
  });

  useEffect(() => {
    fetchEngagementData();
    fetchWorkspaceSettings();
  }, [engagementId]);

  const fetchEngagementData = async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          orgs:org_id (name, logo_url),
          outcomes (id, name, target_value, current_value, unit),
          deliverables (id, name, status, due_date, completion_percentage)
        `)
        .eq('id', engagementId)
        .single();

      if (error) throw error;

      // Calculate overall progress
      const totalDeliverables = data.deliverables?.length || 0;
      const completedDeliverables = data.deliverables?.filter(d => d.status === 'completed').length || 0;
      const progress = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

      // Format outcomes with progress
      const outcomes = data.outcomes?.map(outcome => ({
        ...outcome,
        progress: outcome.target_value > 0 ? (outcome.current_value / outcome.target_value) * 100 : 0
      })) || [];

      // Mock team members (in production, this would come from a junction table)
      const team_members = [
        { id: '1', name: 'Sarah Johnson', role: 'Revenue Scientist', avatar: '' },
        { id: '2', name: 'Mike Chen', role: 'Data Analyst', avatar: '' },
        { id: '3', name: 'Lisa Park', role: 'Project Manager', avatar: '' }
      ];

      setEngagement({
        ...data,
        org: data.orgs,
        progress,
        outcomes,
        team_members
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load engagement data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('*')
        .eq('engagement_id', engagementId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWorkspaceSettings(data);
        setShareSettings({
          client_access_level: data.client_access_level,
          visible_sections: data.visible_sections,
          allow_downloads: data.allow_downloads,
          show_team_activity: data.show_team_activity,
          show_internal_comments: data.show_internal_comments,
          expires_in_days: 30
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch workspace settings:', error);
    }
  };

  const generateShareUrl = async () => {
    try {
      const shareId = Math.random().toString(36).substr(2, 9);
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + shareSettings.expires_in_days);

      const { data, error } = await supabase
        .from('workspace_settings')
        .upsert({
          engagement_id: engagementId,
          is_public: true,
          share_url: shareUrl,
          client_access_level: shareSettings.client_access_level,
          visible_sections: shareSettings.visible_sections,
          allow_downloads: shareSettings.allow_downloads,
          show_team_activity: shareSettings.show_team_activity,
          show_internal_comments: shareSettings.show_internal_comments,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaceSettings(data);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Share URL Generated",
        description: "Share URL has been copied to clipboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate share URL",
        variant: "destructive"
      });
    }
  };

  const togglePublicAccess = async () => {
    if (!workspaceSettings) return;

    try {
      const { error } = await supabase
        .from('workspace_settings')
        .update({ is_public: !workspaceSettings.is_public })
        .eq('id', workspaceSettings.id);

      if (error) throw error;

      setWorkspaceSettings(prev => prev ? { ...prev, is_public: !prev.is_public } : null);
      
      toast({
        title: workspaceSettings.is_public ? "Workspace Made Private" : "Workspace Made Public",
        description: workspaceSettings.is_public 
          ? "Clients can no longer access this workspace"
          : "Clients can now access this workspace via share link"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update workspace access",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Engagement not found or access denied</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={isClientView ? 'border-2 border-primary/20' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {engagement.org.logo && (
                  <img src={engagement.org.logo} alt={engagement.org.name} className="h-8 w-8 rounded" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{engagement.name}</h1>
                  <p className="text-muted-foreground">{engagement.org.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(engagement.status)}>
                  {engagement.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(engagement.start_date), 'MMM dd')} - {format(new Date(engagement.end_date), 'MMM dd, yyyy')}
                </span>
                <div className="flex items-center gap-2">
                  <Progress value={engagement.progress} className="w-20" />
                  <span className="text-sm font-medium">{Math.round(engagement.progress)}%</span>
                </div>
              </div>
            </div>
            
            {!isClientView && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSharingModal(true)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {workspaceSettings && (
                  <Button
                    variant={workspaceSettings.is_public ? "default" : "outline"}
                    size="sm"
                    onClick={togglePublicAccess}
                  >
                    {workspaceSettings.is_public ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {workspaceSettings.is_public ? 'Public' : 'Private'}
                  </Button>
                )}
              </div>
            )}
            
            {isClientView && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                <Eye className="h-3 w-3 mr-1" />
                Client View
              </Badge>
            )}
          </div>
          
          {engagement.description && (
            <p className="text-muted-foreground mt-4">{engagement.description}</p>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${engagement.budget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Allocated for this engagement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(engagement.progress)}%</div>
                <Progress value={engagement.progress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement.team_members.length}</div>
                <p className="text-xs text-muted-foreground">Active team members</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          {engagement.outcomes.map((outcome) => (
            <Card key={outcome.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{outcome.name}</h3>
                  <Badge variant="outline">
                    {outcome.current_value} / {outcome.target_value} {outcome.unit}
                  </Badge>
                </div>
                <Progress value={outcome.progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(outcome.progress)}% of target achieved
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deliverables" className="space-y-4">
          {engagement.deliverables.map((deliverable) => (
            <Card key={deliverable.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{deliverable.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(deliverable.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={getDeliverableStatusColor(deliverable.status)}>
                    {deliverable.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Progress value={deliverable.completion_percentage} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {deliverable.completion_percentage}% complete
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Project Kickoff</h4>
                    <p className="text-sm text-muted-foreground">{format(new Date(engagement.start_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                
                {engagement.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`h-2 w-2 rounded-full ${
                      deliverable.status === 'completed' ? 'bg-green-500' :
                      deliverable.status === 'in_progress' ? 'bg-blue-500' :
                      deliverable.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium">{deliverable.name}</h4>
                      <p className="text-sm text-muted-foreground">Due: {format(new Date(deliverable.due_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <Badge className={getDeliverableStatusColor(deliverable.status)}>
                      {deliverable.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {engagement.team_members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityFeed engagementId={engagementId} compact />
            <CommentSystem 
              entityType="engagement" 
              entityId={engagementId}
              title="Discussion"
              maxHeight="400px"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Sharing Modal */}
      {sharingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Share Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Client Access Level</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: 'view_only', label: 'View Only', desc: 'Can only view content' },
                      { value: 'comment', label: 'Comment', desc: 'Can view and add comments' },
                      { value: 'collaborate', label: 'Collaborate', desc: 'Can view, comment, and edit' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={option.value}
                          name="access_level"
                          checked={shareSettings.client_access_level === option.value}
                          onChange={() => setShareSettings(prev => ({ ...prev, client_access_level: option.value as any }))}
                        />
                        <div>
                          <Label htmlFor={option.value}>{option.label}</Label>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Allow Downloads</Label>
                      <Switch 
                        checked={shareSettings.allow_downloads}
                        onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allow_downloads: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Team Activity</Label>
                      <Switch 
                        checked={shareSettings.show_team_activity}
                        onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, show_team_activity: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {workspaceSettings?.share_url && (
                  <div>
                    <Label>Share URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={workspaceSettings.share_url} readOnly />
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(workspaceSettings.share_url)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={generateShareUrl} className="flex-1">
                  <Link className="h-4 w-4 mr-2" />
                  Generate Share Link
                </Button>
                <Button variant="outline" onClick={() => setSharingModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};