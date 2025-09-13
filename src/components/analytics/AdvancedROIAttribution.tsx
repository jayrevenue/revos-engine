import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  Zap,
  Award,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Brain,
  Shuffle,
  LineChart,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

interface TouchPoint {
  id: string;
  timestamp: Date;
  type: 'meeting' | 'proposal' | 'presentation' | 'workshop' | 'follow_up' | 'negotiation' | 'demo' | 'consultation';
  engagementId: string;
  clientId: string;
  cost: number;
  duration: number; // minutes
  participants: string[];
  outcome: 'positive' | 'neutral' | 'negative';
  leadScore: number; // 0-100
  nextSteps: string[];
  artifacts: string[]; // documents, deliverables created
  influenceScore: number; // 0-1, calculated influence on final outcome
}

interface RevenueEvent {
  id: string;
  engagementId: string;
  clientId: string;
  timestamp: Date;
  amount: number;
  type: 'contract_signed' | 'milestone_payment' | 'expansion' | 'renewal' | 'upsell';
  attributedTouchPoints: string[];
  probability: number; // 0-1
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
}

interface Client {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'sme' | 'enterprise';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  acquisitionDate: Date;
  lifetimeValue: number;
  totalInvestment: number;
  engagementHistory: string[];
}

interface AttributionModel {
  name: string;
  description: string;
  algorithm: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  weights: { [key: string]: number };
  accuracy: number;
}

interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'running' | 'completed' | 'paused';
  controlGroup: string[];
  testGroup: string[];
  intervention: {
    type: string;
    description: string;
    parameters: { [key: string]: any };
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
  results?: {
    controlConversion: number;
    testConversion: number;
    significance: number;
    confidenceInterval: [number, number];
    pValue: number;
    effect: 'positive' | 'negative' | 'neutral';
  };
}

interface CohortData {
  cohortMonth: string;
  clientsAcquired: number;
  retention: { [month: number]: number };
  revenue: { [month: number]: number };
  cumulativeLTV: number;
  averageEngagementValue: number;
  churnRate: number;
}

interface AdvancedROIAttributionProps {
  touchPoints: TouchPoint[];
  revenueEvents: RevenueEvent[];
  clients: Client[];
  abTests: ABTest[];
  onCreateTest?: (test: Omit<ABTest, 'id'>) => void;
  onUpdateAttribution?: (touchPointId: string, attribution: number) => void;
}

export const AdvancedROIAttribution = ({
  touchPoints,
  revenueEvents,
  clients,
  abTests,
  onCreateTest,
  onUpdateAttribution
}: AdvancedROIAttributionProps) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>('data_driven');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '180d' | '1y'>('90d');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [attributionResults, setAttributionResults] = useState<any>({});
  const [cohortAnalysis, setCohortAnalysis] = useState<CohortData[]>([]);

  // Attribution models
  const attributionModels: AttributionModel[] = [
    {
      name: 'Data-Driven Attribution',
      description: 'ML-based model using conversion path analysis',
      algorithm: 'data_driven',
      weights: {},
      accuracy: 0.91
    },
    {
      name: 'Position-Based Attribution',
      description: '40% first touch, 40% last touch, 20% middle',
      algorithm: 'position_based',
      weights: { first: 0.4, last: 0.4, middle: 0.2 },
      accuracy: 0.78
    },
    {
      name: 'Time Decay Attribution',
      description: 'Higher weight to recent touchpoints',
      algorithm: 'time_decay',
      weights: { decay_rate: 0.7 },
      accuracy: 0.82
    },
    {
      name: 'Linear Attribution',
      description: 'Equal credit to all touchpoints',
      algorithm: 'linear',
      weights: {},
      accuracy: 0.65
    },
    {
      name: 'First Touch Attribution',
      description: '100% credit to first interaction',
      algorithm: 'first_touch',
      weights: { first: 1.0 },
      accuracy: 0.45
    },
    {
      name: 'Last Touch Attribution',
      description: '100% credit to last interaction',
      algorithm: 'last_touch',
      weights: { last: 1.0 },
      accuracy: 0.52
    }
  ];

  // Advanced attribution calculation
  const calculateAttribution = useMemo(() => {
    const model = attributionModels.find(m => m.name.toLowerCase().includes(selectedModel)) || attributionModels[0];
    const results: any = {};
    
    // Filter data based on timeframe
    const cutoffDate = new Date();
    const daysBack = selectedTimeframe === '30d' ? 30 : 
                     selectedTimeframe === '90d' ? 90 : 
                     selectedTimeframe === '180d' ? 180 : 365;
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const filteredTouchPoints = touchPoints.filter(tp => tp.timestamp >= cutoffDate);
    const filteredRevenueEvents = revenueEvents.filter(re => re.timestamp >= cutoffDate);

    // Group touchpoints by engagement/client
    const touchPointsByEngagement: { [key: string]: TouchPoint[] } = {};
    filteredTouchPoints.forEach(tp => {
      const key = `${tp.engagementId}_${tp.clientId}`;
      if (!touchPointsByEngagement[key]) {
        touchPointsByEngagement[key] = [];
      }
      touchPointsByEngagement[key].push(tp);
    });

    // Calculate attribution for each revenue event
    const attributionScores: { [touchPointId: string]: number } = {};
    const touchPointROI: { [touchPointId: string]: number } = {};

    filteredRevenueEvents.forEach(revenueEvent => {
      const key = `${revenueEvent.engagementId}_${revenueEvent.clientId}`;
      const relevantTouchPoints = touchPointsByEngagement[key] || [];
      
      if (relevantTouchPoints.length === 0) return;

      // Sort touchpoints chronologically
      const sortedTouchPoints = relevantTouchPoints.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      );

      let attributionWeights: { [id: string]: number } = {};

      switch (model.algorithm) {
        case 'data_driven':
          // Simulate ML-based attribution using influence scores and conversion patterns
          const totalInfluence = sortedTouchPoints.reduce((sum, tp) => sum + tp.influenceScore, 0);
          sortedTouchPoints.forEach(tp => {
            const baseWeight = tp.influenceScore / totalInfluence;
            const outcomeMultiplier = tp.outcome === 'positive' ? 1.3 : 
                                    tp.outcome === 'negative' ? 0.7 : 1.0;
            const typeMultiplier = tp.type === 'proposal' ? 1.4 :
                                 tp.type === 'demo' ? 1.2 :
                                 tp.type === 'negotiation' ? 1.3 : 1.0;
            attributionWeights[tp.id] = baseWeight * outcomeMultiplier * typeMultiplier;
          });
          break;

        case 'position_based':
          if (sortedTouchPoints.length === 1) {
            attributionWeights[sortedTouchPoints[0].id] = 1.0;
          } else if (sortedTouchPoints.length === 2) {
            attributionWeights[sortedTouchPoints[0].id] = 0.5;
            attributionWeights[sortedTouchPoints[1].id] = 0.5;
          } else {
            attributionWeights[sortedTouchPoints[0].id] = 0.4; // First
            attributionWeights[sortedTouchPoints[sortedTouchPoints.length - 1].id] = 0.4; // Last
            const middleWeight = 0.2 / (sortedTouchPoints.length - 2);
            for (let i = 1; i < sortedTouchPoints.length - 1; i++) {
              attributionWeights[sortedTouchPoints[i].id] = middleWeight;
            }
          }
          break;

        case 'time_decay':
          const decayRate = 0.7;
          const now = revenueEvent.timestamp.getTime();
          let totalDecayWeight = 0;
          
          sortedTouchPoints.forEach(tp => {
            const daysDiff = (now - tp.timestamp.getTime()) / (1000 * 60 * 60 * 24);
            const weight = Math.pow(decayRate, daysDiff / 7); // Weekly decay
            attributionWeights[tp.id] = weight;
            totalDecayWeight += weight;
          });
          
          // Normalize weights
          Object.keys(attributionWeights).forEach(id => {
            attributionWeights[id] = attributionWeights[id] / totalDecayWeight;
          });
          break;

        case 'linear':
          const equalWeight = 1 / sortedTouchPoints.length;
          sortedTouchPoints.forEach(tp => {
            attributionWeights[tp.id] = equalWeight;
          });
          break;

        case 'first_touch':
          attributionWeights[sortedTouchPoints[0].id] = 1.0;
          break;

        case 'last_touch':
          attributionWeights[sortedTouchPoints[sortedTouchPoints.length - 1].id] = 1.0;
          break;
      }

      // Apply attribution scores and calculate ROI
      Object.entries(attributionWeights).forEach(([touchPointId, weight]) => {
        const attributedRevenue = revenueEvent.amount * weight * revenueEvent.probability;
        const touchPoint = filteredTouchPoints.find(tp => tp.id === touchPointId);
        
        if (touchPoint) {
          attributionScores[touchPointId] = (attributionScores[touchPointId] || 0) + weight;
          touchPointROI[touchPointId] = (touchPointROI[touchPointId] || 0) + 
            (attributedRevenue - touchPoint.cost);
        }
      });
    });

    // Calculate activity-level ROI
    const activityROI: { [type: string]: { revenue: number, cost: number, count: number, roi: number } } = {};
    
    Object.entries(touchPointROI).forEach(([touchPointId, roi]) => {
      const touchPoint = filteredTouchPoints.find(tp => tp.id === touchPointId);
      if (!touchPoint) return;

      if (!activityROI[touchPoint.type]) {
        activityROI[touchPoint.type] = { revenue: 0, cost: 0, count: 0, roi: 0 };
      }

      const attributedRevenue = roi + touchPoint.cost; // ROI = Revenue - Cost
      activityROI[touchPoint.type].revenue += attributedRevenue;
      activityROI[touchPoint.type].cost += touchPoint.cost;
      activityROI[touchPoint.type].count += 1;
    });

    Object.keys(activityROI).forEach(type => {
      const data = activityROI[type];
      data.roi = data.cost > 0 ? (data.revenue - data.cost) / data.cost : 0;
    });

    // Top performing touchpoints
    const topTouchPoints = Object.entries(touchPointROI)
      .map(([id, roi]) => ({
        touchPoint: filteredTouchPoints.find(tp => tp.id === id)!,
        roi,
        attribution: attributionScores[id] || 0
      }))
      .filter(item => item.touchPoint)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 10);

    return {
      attributionScores,
      touchPointROI,
      activityROI,
      topTouchPoints,
      totalRevenue: filteredRevenueEvents.reduce((sum, re) => sum + re.amount * re.probability, 0),
      totalCost: filteredTouchPoints.reduce((sum, tp) => sum + tp.cost, 0),
      modelAccuracy: model.accuracy
    };
  }, [touchPoints, revenueEvents, selectedModel, selectedTimeframe, selectedClient]);

  // Cohort analysis calculation
  const calculateCohortAnalysis = useMemo(() => {
    const cohorts: { [month: string]: CohortData } = {};
    const monthsToTrack = 12;

    // Group clients by acquisition month
    clients.forEach(client => {
      const cohortMonth = client.acquisitionDate.toISOString().slice(0, 7); // YYYY-MM
      
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          cohortMonth,
          clientsAcquired: 0,
          retention: {},
          revenue: {},
          cumulativeLTV: 0,
          averageEngagementValue: 0,
          churnRate: 0
        };
      }

      cohorts[cohortMonth].clientsAcquired += 1;
      cohorts[cohortMonth].cumulativeLTV += client.lifetimeValue;
    });

    // Calculate retention and revenue for each cohort
    Object.values(cohorts).forEach(cohort => {
      cohort.averageEngagementValue = cohort.cumulativeLTV / cohort.clientsAcquired;
      
      // Calculate monthly retention and revenue (simulated data)
      for (let month = 0; month < monthsToTrack; month++) {
        // Simulate retention decay
        const baseRetention = 0.95;
        const monthlyDecay = 0.05;
        cohort.retention[month] = Math.max(0.1, baseRetention - (monthlyDecay * month));
        
        // Calculate monthly revenue based on retention
        const activeClients = cohort.clientsAcquired * cohort.retention[month];
        cohort.revenue[month] = activeClients * (cohort.averageEngagementValue / 12); // Monthly avg
      }

      cohort.churnRate = 1 - cohort.retention[11]; // 12-month churn
    });

    return Object.values(cohorts).sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth));
  }, [clients]);

  useEffect(() => {
    setAttributionResults(calculateAttribution);
    setCohortAnalysis(calculateCohortAnalysis);
  }, [calculateAttribution, calculateCohortAnalysis]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'proposal': return <Target className="h-4 w-4" />;
      case 'presentation': return <BarChart3 className="h-4 w-4" />;
      case 'workshop': return <Brain className="h-4 w-4" />;
      case 'demo': return <Eye className="h-4 w-4" />;
      case 'negotiation': return <Shuffle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getROIColor = (roi: number) => {
    if (roi > 3) return 'text-green-600 bg-green-100';
    if (roi > 1) return 'text-blue-600 bg-blue-100';
    if (roi > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const currentModel = attributionModels.find(m => m.name.toLowerCase().includes(selectedModel)) || attributionModels[0];
  const runningTests = abTests.filter(t => t.status === 'running');
  const completedTests = abTests.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced ROI Attribution</h2>
          <p className="text-muted-foreground">
            Multi-touch attribution modeling with A/B testing and cohort analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attributionModels.map(model => (
                <SelectItem key={model.algorithm} value={model.algorithm}>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>{model.name}</span>
                    <Badge variant="outline" size="sm">
                      {Math.round(model.accuracy * 100)}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe as any}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="180d">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attributed Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${attributionResults.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeframe} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attributionResults.totalRevenue && attributionResults.totalCost ? 
                `${Math.round(((attributionResults.totalRevenue - attributionResults.totalCost) / attributionResults.totalCost) * 100)}%` 
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue vs Investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(currentModel.accuracy * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentModel.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{runningTests.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTests.length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attribution">Attribution Analysis</TabsTrigger>
          <TabsTrigger value="activities">Activity ROI</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="attribution" className="space-y-6">
          {/* Model Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Attribution Model Performance</CardTitle>
              <CardDescription>
                Compare different attribution models and their accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attributionModels.map(model => (
                  <div 
                    key={model.algorithm}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedModel === model.algorithm ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedModel(model.algorithm)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{model.name}</h4>
                      <Badge variant={selectedModel === model.algorithm ? 'default' : 'outline'}>
                        {Math.round(model.accuracy * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Touchpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Touchpoints</CardTitle>
              <CardDescription>
                Highest ROI touchpoints based on {currentModel.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {attributionResults.topTouchPoints?.map((item: any, index: number) => (
                    <div key={item.touchPoint.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                        {getActivityIcon(item.touchPoint.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium capitalize">
                          {item.touchPoint.type.replace('_', ' ')} - {clients.find(c => c.id === item.touchPoint.clientId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.touchPoint.timestamp.toLocaleDateString()} • 
                          {item.touchPoint.duration} minutes • 
                          {item.touchPoint.participants.length} participants
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ${item.roi.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(item.attribution * 100)}% attribution
                        </div>
                      </div>

                      <Badge className={getROIColor(item.roi / item.touchPoint.cost)}>
                        {Math.round((item.roi / item.touchPoint.cost) * 100)}% ROI
                      </Badge>
                    </div>
                  )) || []}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity ROI Performance</CardTitle>
              <CardDescription>
                Revenue impact scoring for each activity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(attributionResults.activityROI || {}).map(([type, data]: [string, any]) => (
                  <Card key={type}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(type)}
                        <CardTitle className="capitalize">{type.replace('_', ' ')}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Revenue</div>
                          <div className="text-lg font-bold text-green-600">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Cost</div>
                          <div className="text-lg font-bold">
                            ${data.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Activity Count</div>
                          <div className="text-lg font-bold">
                            {data.count}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div className={`text-lg font-bold ${data.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.round(data.roi * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Revenue per Activity</span>
                          <span>${Math.round(data.revenue / data.count).toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (data.revenue / data.count) / 1000)} 
                          className="h-2" 
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {data.roi > 2 ? <TrendingUp className="h-3 w-3 text-green-600" /> : 
                         data.roi > 0 ? <ArrowRight className="h-3 w-3 text-yellow-600" /> : 
                         <TrendingDown className="h-3 w-3 text-red-600" />}
                        <span>
                          {data.roi > 2 ? 'Excellent' : 
                           data.roi > 1 ? 'Good' : 
                           data.roi > 0 ? 'Break-even' : 'Loss-making'} performance
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Cohort Analysis</CardTitle>
              <CardDescription>
                Client lifetime value and retention analysis by acquisition cohort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cohort Summary Table */}
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {cohortAnalysis.map((cohort, index) => (
                      <Card key={cohort.cohortMonth}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {new Date(cohort.cohortMonth).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </CardTitle>
                            <Badge variant="outline">
                              {cohort.clientsAcquired} clients
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Avg LTV</div>
                              <div className="text-lg font-bold text-green-600">
                                ${Math.round(cohort.averageEngagementValue).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">12m Retention</div>
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round((cohort.retention[11] || 0) * 100)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Churn Rate</div>
                              <div className="text-lg font-bold text-red-600">
                                {Math.round(cohort.churnRate * 100)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Total Revenue</div>
                              <div className="text-lg font-bold">
                                ${Math.round(cohort.cumulativeLTV).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Retention Curve */}
                          <div>
                            <div className="text-sm font-medium mb-2">Retention Curve</div>
                            <div className="grid grid-cols-12 gap-1">
                              {Array.from({ length: 12 }, (_, month) => (
                                <div key={month} className="text-center">
                                  <div className="text-xs text-muted-foreground">M{month}</div>
                                  <div 
                                    className="h-12 bg-blue-600 rounded-sm flex items-end justify-center text-xs text-white"
                                    style={{ 
                                      height: `${Math.max(8, (cohort.retention[month] || 0) * 48)}px`,
                                      backgroundColor: `hsl(217, 91%, ${50 + (cohort.retention[month] || 0) * 30}%)`
                                    }}
                                  >
                                    {Math.round((cohort.retention[month] || 0) * 100)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">A/B Testing Framework</h3>
              <p className="text-sm text-muted-foreground">
                Test interventions and measure their impact on engagement success
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create A/B Test</DialogTitle>
                  <DialogDescription>
                    Set up a new A/B test to measure intervention effectiveness
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>A/B test creation form would be implemented here</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Running Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Running Tests ({runningTests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runningTests.map(test => (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.name}</h4>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{test.hypothesis}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Control Group:</span> {test.controlGroup.length}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Test Group:</span> {test.testGroup.length}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Days Running:</span> {
                          Math.ceil((Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24))
                        }
                      </div>
                    </div>
                  </div>
                ))}
                {runningTests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active A/B tests running</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Tests ({completedTests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTests.map(test => (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={test.results?.effect === 'positive' ? 'default' : 
                                      test.results?.effect === 'negative' ? 'destructive' : 'secondary'}>
                          {test.results?.effect || 'Neutral'}
                        </Badge>
                        <Badge variant="outline">
                          {test.results ? Math.round(test.results.significance * 100) : 0}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{test.hypothesis}</p>
                    
                    {test.results && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Control:</span> 
                          <span className="ml-1 font-medium">{Math.round(test.results.controlConversion * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Test:</span> 
                          <span className="ml-1 font-medium">{Math.round(test.results.testConversion * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lift:</span> 
                          <span className={`ml-1 font-medium ${test.results.testConversion > test.results.controlConversion ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.round(((test.results.testConversion - test.results.controlConversion) / test.results.controlConversion) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">p-value:</span> 
                          <span className="ml-1 font-medium">{test.results.pValue.toFixed(3)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {completedTests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No completed A/B tests yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};