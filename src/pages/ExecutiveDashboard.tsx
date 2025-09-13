import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Target, Bot, Calendar, ExternalLink, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Page from "@/components/layout/Page";

interface DashboardMetrics {
  totalRevenue: number;
  activeEngagements: number;
  deployedAgents: number;
  completedOutcomes: number;
  revenueGrowth: number;
  engagementGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'engagement' | 'outcome' | 'agent' | 'intervention';
  title: string;
  description: string;
  date: string;
  status?: string;
}

interface PerformanceData {
  date: string;
  revenue: number;
  engagements: number;
  outcomes: number;
}

const ExecutiveDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    activeEngagements: 0,
    deployedAgents: 0,
    completedOutcomes: 0,
    revenueGrowth: 0,
    engagementGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch dashboard metrics
      const [
        { data: engagements, error: engagementsError },
        { data: outcomes, error: outcomesError },
        { data: agents, error: agentsError },
        { data: interventions, error: interventionsError }
      ] = await Promise.all([
        supabase.from('engagements').select('*'),
        supabase.from('outcomes').select('*'),
        supabase.from('ai_agents').select('*'),
        supabase.from('interventions').select('*')
      ]);

      if (engagementsError) throw engagementsError;
      if (outcomesError) throw outcomesError;
      if (agentsError) throw agentsError;
      if (interventionsError) throw interventionsError;

      // Calculate metrics
      const totalRevenue = engagements?.reduce((sum, eng) => sum + (eng.budget || 0), 0) || 0;
      const activeEngagements = engagements?.filter(eng => eng.status === 'active').length || 0;
      const deployedAgents = agents?.filter(agent => agent.status === 'active').length || 0;
      const completedOutcomes = outcomes?.filter(outcome => 
        outcome.current_value >= outcome.target_value
      ).length || 0;

      setMetrics({
        totalRevenue,
        activeEngagements,
        deployedAgents,
        completedOutcomes,
        revenueGrowth: 12.5, // Simulated
        engagementGrowth: 8.3 // Simulated
      });

      // Generate recent activity
      const activities: RecentActivity[] = [
        ...(engagements?.slice(0, 3).map(eng => ({
          id: eng.id,
          type: 'engagement' as const,
          title: `New Engagement: ${eng.name}`,
          description: `Started engagement with budget of $${eng.budget?.toLocaleString() || 0}`,
          date: eng.created_at,
          status: eng.status
        })) || []),
        ...(outcomes?.slice(0, 2).map(outcome => ({
          id: outcome.id,
          type: 'outcome' as const,
          title: `Outcome Updated: ${outcome.metric_name}`,
          description: `Current value: ${outcome.current_value}, Target: ${outcome.target_value}`,
          date: outcome.updated_at || outcome.created_at
        })) || []),
        ...(agents?.slice(0, 2).map(agent => ({
          id: agent.id,
          type: 'agent' as const,
          title: `Agent Deployed: ${agent.name}`,
          description: `${agent.role} agent is now active`,
          date: agent.created_at,
          status: agent.status
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

      setRecentActivity(activities);

      // Generate performance data for the last 7 days
      const performanceData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 50000) + 100000,
          engagements: Math.floor(Math.random() * 5) + 1,
          outcomes: Math.floor(Math.random() * 3) + 1
        };
      });

      setPerformanceData(performanceData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'engagement': return <Target className="w-4 h-4" />;
      case 'outcome': return <TrendingUp className="w-4 h-4" />;
      case 'agent': return <Bot className="w-4 h-4" />;
      case 'intervention': return <BarChart3 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'text-blue-600';
      case 'outcome': return 'text-green-600';
      case 'agent': return 'text-purple-600';
      case 'intervention': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading Executive Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Page
      title="Executive Command Center"
      description="Real-time insights into your revenue operations performance"
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Full Analytics
          </Button>
          <Button onClick={() => navigate('/engagements/new')}>
            <Target className="w-4 h-4 mr-2" />
            New Engagement
          </Button>
        </>
      }
    >

        {/* Key Performance Indicators */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{metrics.revenueGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Engagements</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeEngagements}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{metrics.engagementGrowth}%</span> growth rate
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agents Deployed</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.deployedAgents}</div>
              <p className="text-xs text-muted-foreground">
                Across {metrics.activeEngagements} engagements
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Outcomes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedOutcomes}</div>
              <p className="text-xs text-muted-foreground">
                Targets achieved this period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Performance Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>7-Day Performance Trend</CardTitle>
              <CardDescription>Revenue and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Count'
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagements" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common RevOS operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate('/engagements/new')}
              >
                <div className="text-left">
                  <div className="font-medium">Start New Engagement</div>
                  <div className="text-sm text-muted-foreground">Create a new client engagement</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate('/agents/new')}
              >
                <div className="text-left">
                  <div className="font-medium">Deploy AI Agent</div>
                  <div className="text-sm text-muted-foreground">Launch specialized AI agent</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate('/library')}
              >
                <div className="text-left">
                  <div className="font-medium">Access IP Library</div>
                  <div className="text-sm text-muted-foreground">Browse prompts and playbooks</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate('/analytics')}
              >
                <div className="text-left">
                  <div className="font-medium">View Full Analytics</div>
                  <div className="text-sm text-muted-foreground">Comprehensive performance insights</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all engagements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.status && (
                        <Badge variant="outline" className="mt-1">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
    </Page>
  );
};

export default ExecutiveDashboard;
