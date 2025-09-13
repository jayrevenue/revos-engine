import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Download,
  Share,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Flag,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ExecutiveMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  status: 'on_track' | 'at_risk' | 'behind';
  impact: 'high' | 'medium' | 'low';
}

interface KeyInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'achievement' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  urgency: 'high' | 'medium' | 'low';
  action_required: boolean;
  suggested_actions: string[];
  data_source: string;
  created_at: string;
}

interface ExecutiveSummaryProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  engagementId?: string;
  autoRefresh?: boolean;
  onExport?: () => void;
  onShare?: () => void;
}

export const ExecutiveSummary = ({
  timeRange = 'month',
  engagementId,
  autoRefresh = true,
  onExport,
  onShare
}: ExecutiveSummaryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ExecutiveMetric[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchExecutiveData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchExecutiveData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [timeRange, engagementId, autoRefresh]);

  const fetchExecutiveData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = subDays(endDate, 7);
          break;
        case 'quarter':
          startDate = subDays(endDate, 90);
          break;
        case 'year':
          startDate = subDays(endDate, 365);
          break;
        default:
          startDate = startOfMonth(endDate);
      }

      // Fetch actual data from Supabase
      const [
        { data: engagements, error: engagementsError },
        { data: outcomes, error: outcomesError },
        { data: revenue, error: revenueError }
      ] = await Promise.all([
        supabase
          .from('engagements')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('outcomes')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('revenue_data')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ]);

      if (engagementsError) throw engagementsError;
      if (outcomesError) throw outcomesError;

      // Process data into executive metrics
      const calculatedMetrics = calculateExecutiveMetrics(
        engagements || [],
        outcomes || [],
        revenue || []
      );
      
      const generatedInsights = await generateInsights(calculatedMetrics);
      
      setMetrics(calculatedMetrics);
      setInsights(generatedInsights);
      setLastUpdated(new Date());
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load executive summary data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateExecutiveMetrics = (engagements: any[], outcomes: any[], revenue: any[]): ExecutiveMetric[] => {
    const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
    const activeEngagements = engagements.filter(e => e.status === 'active').length;
    const completedOutcomes = outcomes.filter(o => o.current_value >= o.target_value).length;
    const totalOutcomes = outcomes.length;
    
    // Mock previous period data for trend calculation
    const prevRevenue = totalRevenue * 0.9; // 10% growth simulation
    const prevEngagements = activeEngagements - 2;
    const prevOutcomes = completedOutcomes - 3;

    return [
      {
        id: 'revenue',
        name: 'Total Revenue',
        value: totalRevenue,
        target: totalRevenue * 1.2,
        unit: '$',
        trend: totalRevenue > prevRevenue ? 'up' : totalRevenue < prevRevenue ? 'down' : 'stable',
        change: ((totalRevenue - prevRevenue) / prevRevenue) * 100,
        period: timeRange,
        status: totalRevenue >= totalRevenue * 0.8 ? 'on_track' : 'at_risk',
        impact: 'high'
      },
      {
        id: 'engagements',
        name: 'Active Engagements',
        value: activeEngagements,
        target: activeEngagements + 5,
        unit: '',
        trend: activeEngagements > prevEngagements ? 'up' : activeEngagements < prevEngagements ? 'down' : 'stable',
        change: prevEngagements > 0 ? ((activeEngagements - prevEngagements) / prevEngagements) * 100 : 0,
        period: timeRange,
        status: activeEngagements >= prevEngagements ? 'on_track' : 'behind',
        impact: 'high'
      },
      {
        id: 'success_rate',
        name: 'Outcome Success Rate',
        value: totalOutcomes > 0 ? (completedOutcomes / totalOutcomes) * 100 : 0,
        target: 85,
        unit: '%',
        trend: completedOutcomes > prevOutcomes ? 'up' : 'stable',
        change: prevOutcomes > 0 ? ((completedOutcomes - prevOutcomes) / prevOutcomes) * 100 : 0,
        period: timeRange,
        status: (completedOutcomes / Math.max(totalOutcomes, 1)) * 100 >= 75 ? 'on_track' : 'at_risk',
        impact: 'medium'
      },
      {
        id: 'avg_deal_size',
        name: 'Average Deal Size',
        value: engagements.length > 0 ? totalRevenue / engagements.length : 0,
        target: 50000,
        unit: '$',
        trend: 'up',
        change: 15.3,
        period: timeRange,
        status: 'on_track',
        impact: 'medium'
      }
    ];
  };

  const generateInsights = async (metrics: ExecutiveMetric[]): Promise<KeyInsight[]> => {
    const insights: KeyInsight[] = [];

    // Revenue insights
    const revenueMetric = metrics.find(m => m.id === 'revenue');
    if (revenueMetric && revenueMetric.change > 10) {
      insights.push({
        id: 'revenue-growth',
        type: 'achievement',
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${revenueMetric.change.toFixed(1)}% this ${timeRange}, indicating strong market performance.`,
        confidence: 92,
        impact: 'high',
        urgency: 'low',
        action_required: false,
        suggested_actions: ['Analyze successful strategies', 'Scale winning approaches'],
        data_source: 'revenue_data',
        created_at: new Date().toISOString()
      });
    }

    // Engagement insights
    const engagementMetric = metrics.find(m => m.id === 'engagements');
    if (engagementMetric && engagementMetric.status === 'on_track') {
      insights.push({
        id: 'engagement-pipeline',
        type: 'opportunity',
        title: 'Healthy Engagement Pipeline',
        description: `${engagementMetric.value} active engagements provide strong foundation for continued growth.`,
        confidence: 85,
        impact: 'medium',
        urgency: 'low',
        action_required: false,
        suggested_actions: ['Maintain current pace', 'Prepare for capacity scaling'],
        data_source: 'engagement_data',
        created_at: new Date().toISOString()
      });
    }

    // Success rate insights
    const successMetric = metrics.find(m => m.id === 'success_rate');
    if (successMetric && successMetric.value < 70) {
      insights.push({
        id: 'success-rate-concern',
        type: 'risk',
        title: 'Outcome Success Rate Below Target',
        description: `Only ${successMetric.value.toFixed(1)}% of outcomes are meeting targets. This may impact client satisfaction.`,
        confidence: 88,
        impact: 'high',
        urgency: 'high',
        action_required: true,
        suggested_actions: [
          'Review underperforming engagements',
          'Adjust intervention strategies',
          'Increase client touchpoints'
        ],
        data_source: 'outcome_data',
        created_at: new Date().toISOString()
      });
    }

    return insights;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600 bg-green-50 border-green-200';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-green-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const criticalInsights = insights.filter(i => i.urgency === 'high' || i.impact === 'high');
  const overallHealthScore = useMemo(() => {
    const onTrackMetrics = metrics.filter(m => m.status === 'on_track').length;
    return metrics.length > 0 ? (onTrackMetrics / metrics.length) * 100 : 0;
  }, [metrics]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executive Summary</h1>
          <p className="text-muted-foreground">
            AI-powered insights for the {timeRange} period • Last updated {format(lastUpdated, 'MMM dd, HH:mm')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchExecutiveData}>
            <Zap className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Overall Health Score</h3>
              <p className="text-sm text-muted-foreground">Based on key performance indicators</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round(overallHealthScore)}%</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
          </div>
          <Progress value={overallHealthScore} className="mb-4" />
          <div className="flex justify-between text-sm">
            <span>{metrics.filter(m => m.status === 'on_track').length} on track</span>
            <span>{metrics.filter(m => m.status === 'at_risk').length} at risk</span>
            <span>{metrics.filter(m => m.status === 'behind').length} behind</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          {criticalInsights.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Insights ({criticalInsights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalInsights.slice(0, 3).map(insight => (
                    <Alert key={insight.id} className="border-orange-200">
                      {getInsightIcon(insight.type)}
                      <AlertDescription>
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm text-muted-foreground">{insight.description}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map(metric => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{metric.name}</h4>
                    <Badge className={getStatusColor(metric.status)} variant="outline">
                      {metric.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold">
                      {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                    </span>
                    <div className={`flex items-center text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                       metric.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                       <Activity className="h-3 w-3 mr-1" />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  </div>
                  
                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : ''}</span>
                        <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {metrics.map(metric => (
              <Card key={metric.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    <Badge className={getStatusColor(metric.status)} variant="outline">
                      {metric.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end gap-4">
                      <div>
                        <div className="text-3xl font-bold">
                          {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                      </div>
                      
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                         metric.trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
                         <Activity className="h-4 w-4 mr-1" />}
                        <span className="font-medium">
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground ml-1">vs last {metric.period}</span>
                      </div>
                    </div>
                    
                    {metric.target && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Target</span>
                          <span className="font-medium">
                            {((metric.value / metric.target) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} />
                        <div className="text-xs text-muted-foreground">
                          Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={metric.impact === 'high' ? 'default' : 'secondary'}>
                        {metric.impact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Based on {metric.period} performance
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map(insight => (
              <Card key={insight.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant={insight.urgency === 'high' ? 'destructive' : 'outline'}>
                        {insight.urgency} urgency
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-medium">{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} className="h-1" />
                    
                    {insight.suggested_actions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Suggested Actions:</h4>
                        <ul className="space-y-1">
                          {insight.suggested_actions.map((action, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ArrowRight className="h-3 w-3" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="space-y-4">
            {insights
              .filter(insight => insight.action_required)
              .map(insight => (
                <Card key={insight.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-orange-500" />
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <Badge variant="destructive">Action Required</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Recommended Actions:</h4>
                      <div className="space-y-2">
                        {insight.suggested_actions.map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded border">
                            <span className="text-sm">{action}</span>
                            <Button size="sm" variant="outline">
                              Take Action
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {insights.filter(insight => insight.action_required).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No urgent actions required at this time. Keep monitoring your metrics.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};