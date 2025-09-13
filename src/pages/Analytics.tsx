import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Users, Bot, Target, Calendar, Download, Filter, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import GapMapDashboard from '@/components/dashboards/GapMapDashboard';
import ClarityAuditDashboard from '@/components/dashboards/ClarityAuditDashboard';
import AgentROIDashboard from '@/components/dashboards/AgentROIDashboard';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  engagements: any[];
  outcomes: any[];
  agents: any[];
  interventions: any[];
  orgs: any[];
  prompts: any[];
  playbooks: any[];
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [data, setData] = useState<AnalyticsData>({
    engagements: [],
    outcomes: [],
    agents: [],
    interventions: [],
    orgs: [],
    prompts: [],
    playbooks: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, loading, navigate, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoadingData(true);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

      // Fetch all analytics data in parallel
      const [
        { data: engagements, error: engagementsError },
        { data: outcomes, error: outcomesError },
        { data: agents, error: agentsError },
        { data: interventions, error: interventionsError },
        { data: orgs, error: orgsError },
        { data: prompts, error: promptsError },
        { data: playbooks, error: playbooksError }
      ] = await Promise.all([
        supabase.from('engagements').select(`
          *,
          orgs:org_id (name)
        `).gte('created_at', cutoffDate.toISOString()),
        supabase.from('outcomes').select('*').gte('created_at', cutoffDate.toISOString()),
        supabase.from('ai_agents').select('*').gte('created_at', cutoffDate.toISOString()),
        supabase.from('interventions').select('*').gte('created_at', cutoffDate.toISOString()),
        supabase.from('orgs').select('*'),
        supabase.from('prompt_library').select('*').gte('created_at', cutoffDate.toISOString()),
        supabase.from('playbooks').select('*').gte('created_at', cutoffDate.toISOString())
      ]);

      if (engagementsError) throw engagementsError;
      if (outcomesError) throw outcomesError;
      if (agentsError) throw agentsError;
      if (interventionsError) throw interventionsError;
      if (orgsError) throw orgsError;
      if (promptsError) throw promptsError;
      if (playbooksError) throw playbooksError;

      setData({
        engagements: engagements || [],
        outcomes: outcomes || [],
        agents: agents || [],
        interventions: interventions || [],
        orgs: orgs || [],
        prompts: prompts || [],
        playbooks: playbooks || []
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const calculateMetrics = (): MetricCard[] => {
    const totalRevenue = data.engagements.reduce((sum, eng) => sum + (eng.budget || 0), 0);
    const activeEngagements = data.engagements.filter(eng => eng.status === 'active').length;
    const totalOutcomes = data.outcomes.length;
    const activeAgents = data.agents.filter(agent => agent.status === 'active').length;
    
    const completedInterventions = data.interventions.filter(int => int.status === 'completed').length;
    const totalInterventions = data.interventions.length;
    const completionRate = totalInterventions > 0 ? (completedInterventions / totalInterventions * 100).toFixed(1) : '0';

    return [
      {
        title: 'Total Revenue Pipeline',
        value: `$${totalRevenue.toLocaleString()}`,
        change: '+12%',
        icon: <DollarSign className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Active Engagements',
        value: activeEngagements.toString(),
        change: '+3',
        icon: <Target className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Tracked Outcomes',
        value: totalOutcomes.toString(),
        change: `+${Math.round(totalOutcomes * 0.1)}`,
        icon: <BarChart3 className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'AI Agent Deployments',
        value: activeAgents.toString(),
        change: '+2',
        icon: <Bot className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Intervention Success Rate',
        value: `${completionRate}%`,
        change: '+5%',
        icon: <TrendingUp className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Client Organizations',
        value: data.orgs.length.toString(),
        change: '+1',
        icon: <Users className="w-5 h-5" />,
        trend: 'up'
      }
    ];
  };

  const getEngagementTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        engagements: data.engagements.filter(eng => 
          eng.created_at.split('T')[0] === date.toISOString().split('T')[0]
        ).length,
        revenue: data.engagements
          .filter(eng => eng.created_at.split('T')[0] === date.toISOString().split('T')[0])
          .reduce((sum, eng) => sum + (eng.budget || 0), 0)
      };
    });
    return last7Days;
  };

  const getStatusDistribution = () => {
    const statusCounts = data.engagements.reduce((acc, eng) => {
      acc[eng.status] = (acc[eng.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'active' ? '#10b981' : status === 'paused' ? '#f59e0b' : '#3b82f6'
    }));
  };

  const getAgentUsageData = () => {
    const agentRoles = data.agents.reduce((acc, agent) => {
      acc[agent.role] = (acc[agent.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agentRoles).map(([role, count]) => ({
      role,
      count,
      usage: Math.floor(Math.random() * 100) + 20 // Simulated usage data
    }));
  };

  const getIPUtilizationData = () => {
    const totalPrompts = data.prompts.length;
    const totalPlaybooks = data.playbooks.length;
    const totalUsage = data.prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0) +
                      data.playbooks.reduce((sum, p) => sum + (p.usage_count || 0), 0);

    return [
      { name: 'Prompts', value: totalPrompts, usage: data.prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0) },
      { name: 'Playbooks', value: totalPlaybooks, usage: data.playbooks.reduce((sum, p) => sum + (p.usage_count || 0), 0) },
      { name: 'Total Usage', value: totalUsage, usage: totalUsage }
    ];
  };

  const metrics = calculateMetrics();
  const trendData = getEngagementTrendData();
  const statusData = getStatusDistribution();
  const agentData = getAgentUsageData();
  const ipData = getIPUtilizationData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading Analytics...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into your revenue operations performance
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`inline-flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change} from last period
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagements">Engagements</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="ip">IP Analytics</TabsTrigger>
            <TabsTrigger value="gap-map">Gap Map</TabsTrigger>
            <TabsTrigger value="clarity-audit">Clarity Audit</TabsTrigger>
            <TabsTrigger value="agent-roi">Agent ROI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue pipeline growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Status Distribution</CardTitle>
                  <CardDescription>Current engagement status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Performance</CardTitle>
                <CardDescription>Track engagement creation and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="engagements" fill="#8884d8" name="New Engagements" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Deployment Analytics</CardTitle>
                <CardDescription>Agent usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={agentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Agent Count" />
                    <Bar dataKey="usage" fill="#82ca9d" name="Usage Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Outcome Performance</CardTitle>
                <CardDescription>Revenue impact and outcome achievement rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.outcomes.filter(o => o.current_value >= o.target_value).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Targets Achieved</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.outcomes.filter(o => o.current_value < o.target_value && o.current_value > o.baseline_value).length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {data.outcomes.filter(o => o.current_value <= o.baseline_value).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Below Baseline</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>IP Asset Utilization</CardTitle>
                  <CardDescription>Usage statistics for prompts and playbooks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" name="Count" />
                      <Bar dataKey="usage" fill="#82ca9d" name="Usage" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing IP Assets</CardTitle>
                  <CardDescription>Most used prompts and playbooks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...data.prompts, ...data.playbooks]
                      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
                      .slice(0, 5)
                      .map((asset, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{asset.name || asset.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {'category' in asset ? asset.category : 'Playbook'}
                            </div>
                          </div>
                          <Badge variant="outline">{asset.usage_count || 0} uses</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Specialized Dashboards */}
          <TabsContent value="gap-map" className="space-y-6">
            <GapMapDashboard />
          </TabsContent>

          <TabsContent value="clarity-audit" className="space-y-6">
            <ClarityAuditDashboard />
          </TabsContent>

          <TabsContent value="agent-roi" className="space-y-6">
            <AgentROIDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;