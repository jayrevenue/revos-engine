import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, MessageSquare, BarChart3, Target, Users, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Engagement {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  description: string | null;
  org: {
    id: string;
    name: string;
  };
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface Dashboard {
  id: string;
  type: string;
  data: any;
}

const EngagementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && id) {
      fetchEngagementData();
    }
  }, [user, loading, navigate, id]);

  const fetchEngagementData = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      
      // Fetch engagement details
      const { data: engagementData, error: engagementError } = await supabase
        .from('engagements')
        .select(`
          id,
          name,
          status,
          start_date,
          end_date,
          budget,
          description,
          orgs:org_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (engagementError) throw engagementError;

      setEngagement({
        ...engagementData,
        org: engagementData.orgs as { id: string; name: string }
      });

      // Fetch agents for this engagement
      const { data: agentsData, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id, name, role, status')
        .eq('engagement_id', id);

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Fetch dashboards for this engagement
      const { data: dashboardsData, error: dashboardsError } = await supabase
        .from('dashboards')
        .select('id, type, data')
        .eq('engagement_id', id);

      if (dashboardsError) throw dashboardsError;
      setDashboards(dashboardsData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch engagement details",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'complete': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'clarity_audit': return <BarChart3 className="w-5 h-5" />;
      case 'gap_map': return <Target className="w-5 h-5" />;
      case 'executive_command': return <Users className="w-5 h-5" />;
      case 'agent_roi': return <Bot className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getDashboardTitle = (type: string) => {
    switch (type) {
      case 'clarity_audit': return 'Clarity Audit';
      case 'gap_map': return 'Gap Map';
      case 'executive_command': return 'Executive Command Center';
      case 'agent_roi': return 'Agent ROI Tracker';
      default: return type;
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user || !engagement) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/engagements')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engagements
          </Button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">{engagement.name}</h1>
            <p className="text-muted-foreground mt-2">{engagement.org?.name}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge className={getStatusColor(engagement.status)}>
                {engagement.status}
              </Badge>
              {engagement.budget && (
                <span className="text-2xl font-semibold">
                  ${engagement.budget.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => navigate(`/engagements/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagement.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{engagement.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Start Date</h4>
                    <p className="text-muted-foreground">
                      {engagement.start_date ? new Date(engagement.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">End Date</h4>
                    <p className="text-muted-foreground">
                      {engagement.end_date ? new Date(engagement.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Agents</h2>
              <Button onClick={() => navigate(`/agents/new?engagement=${id}`)}>
                <Bot className="w-4 h-4 mr-2" />
                Deploy Agent
              </Button>
            </div>

            {agents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No agents deployed</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy AI agents to assist with this engagement
                  </p>
                  <Button onClick={() => navigate(`/agents/new?engagement=${id}`)}>
                    <Bot className="w-4 h-4 mr-2" />
                    Deploy First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{agent.name}</span>
                        <Badge variant="outline">{agent.role}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/agents/${agent.id}/chat`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Revenue Dashboards</h2>
              <Button variant="outline">Generate Dashboards</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {['clarity_audit', 'gap_map', 'executive_command', 'agent_roi'].map((type) => {
                const existingDashboard = dashboards.find(d => d.type === type);
                return (
                  <Card key={type} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getDashboardIcon(type)}
                        {getDashboardTitle(type)}
                      </CardTitle>
                      <CardDescription>
                        {existingDashboard ? 'Dashboard available' : 'Not generated yet'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={existingDashboard ? "default" : "outline"} 
                        className="w-full"
                      >
                        {existingDashboard ? 'View Dashboard' : 'Generate Dashboard'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Outcomes & ROI</h2>
              <Button variant="outline">Track New Outcome</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Impact Tracking</CardTitle>
                <CardDescription>
                  Before/After analysis and intervention outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Outcome tracking will be available once interventions are implemented.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EngagementDetail;