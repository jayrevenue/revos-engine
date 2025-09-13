import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Users,
  DollarSign,
  Calendar,
  Brain,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Bell,
  Lightbulb,
  Shield,
  Globe,
  Building,
  Star,
  Award
} from 'lucide-react';

interface PipelineStage {
  name: string;
  probability: number;
  averageDuration: number; // days
  dropoffRate: number;
  conversionRate: number;
}

interface Opportunity {
  id: string;
  name: string;
  clientName: string;
  industry: string;
  value: number;
  probability: number;
  stage: string;
  daysInStage: number;
  lastActivity: Date;
  assignedTo: string[];
  riskFactors: string[];
  nextSteps: string[];
  predictedCloseDate: Date;
  confidenceScore: number;
}

interface MarketTrend {
  id: string;
  name: string;
  category: 'industry' | 'technology' | 'economic' | 'regulatory';
  trend: 'up' | 'down' | 'stable';
  impact: number; // -1 to 1
  confidence: number;
  description: string;
  correlatedMetrics: string[];
  timeframe: '1month' | '3months' | '1year';
  sources: string[];
}

interface ForecastModel {
  name: string;
  type: 'linear' | 'exponential' | 'seasonal' | 'ml_ensemble';
  accuracy: number;
  description: string;
  timeHorizon: number; // months
}

interface Forecast {
  metric: string;
  model: string;
  predictions: {
    period: string;
    value: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }[];
  accuracy: number;
  factors: string[];
}

interface EarlyWarning {
  id: string;
  type: 'engagement_risk' | 'capacity_issue' | 'pipeline_stall' | 'market_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEntities: string[];
  predictedImpact: number;
  timeToImpact: number; // days
  confidence: number;
  mitigationActions: string[];
  trend: 'improving' | 'stable' | 'deteriorating';
}

interface CapacityPlan {
  department: string;
  currentCapacity: number;
  demandForecast: number;
  utilizationRate: number;
  bottlenecks: string[];
  recommendations: {
    action: string;
    impact: number;
    cost: number;
    timeline: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface PredictiveInsightsDashboardProps {
  opportunities: Opportunity[];
  marketTrends: MarketTrend[];
  onUpdateForecast?: (forecastId: string) => void;
  onTakeAction?: (warningId: string, action: string) => void;
}

export const PredictiveInsightsDashboard = ({
  opportunities,
  marketTrends,
  onUpdateForecast,
  onTakeAction
}: PredictiveInsightsDashboardProps) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>('ml_ensemble');
  const [forecastHorizon, setForecastHorizon] = useState<'3m' | '6m' | '12m'>('6m');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarning[]>([]);
  const [capacityPlans, setCapacityPlans] = useState<CapacityPlan[]>([]);

  // Pipeline stages configuration
  const pipelineStages: PipelineStage[] = [
    { name: 'Lead', probability: 0.1, averageDuration: 7, dropoffRate: 0.6, conversionRate: 0.4 },
    { name: 'Qualified', probability: 0.25, averageDuration: 14, dropoffRate: 0.3, conversionRate: 0.7 },
    { name: 'Proposal', probability: 0.5, averageDuration: 21, dropoffRate: 0.2, conversionRate: 0.8 },
    { name: 'Negotiation', probability: 0.75, averageDuration: 14, dropoffRate: 0.15, conversionRate: 0.85 },
    { name: 'Closed Won', probability: 1.0, averageDuration: 0, dropoffRate: 0, conversionRate: 1.0 }
  ];

  // Forecast models
  const forecastModels: ForecastModel[] = [
    {
      name: 'ML Ensemble',
      type: 'ml_ensemble',
      accuracy: 0.91,
      description: 'Combines multiple ML algorithms with market data',
      timeHorizon: 12
    },
    {
      name: 'Seasonal ARIMA',
      type: 'seasonal',
      accuracy: 0.84,
      description: 'Time series with seasonal patterns',
      timeHorizon: 18
    },
    {
      name: 'Exponential Smoothing',
      type: 'exponential',
      accuracy: 0.78,
      description: 'Weighted historical data with trend analysis',
      timeHorizon: 6
    },
    {
      name: 'Linear Regression',
      type: 'linear',
      accuracy: 0.72,
      description: 'Linear trend with external factors',
      timeHorizon: 9
    }
  ];

  // Generate pipeline conversion forecasts
  const generatePipelineForecasts = useMemo(() => {
    const currentModel = forecastModels.find(m => m.type === selectedModel) || forecastModels[0];
    const horizon = forecastHorizon === '3m' ? 3 : forecastHorizon === '6m' ? 6 : 12;
    const newForecasts: Forecast[] = [];

    // Pipeline value forecast
    const currentPipelineValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability), 0);
    const monthlyGrowthRate = 0.08; // 8% monthly growth assumption
    const seasonalityFactor = [1.0, 0.9, 1.1, 1.2, 1.0, 0.8, 0.7, 0.9, 1.1, 1.3, 1.1, 1.0]; // Monthly seasonality

    const pipelinePredictions = Array.from({ length: horizon }, (_, i) => {
      const month = i + 1;
      const baseGrowth = Math.pow(1 + monthlyGrowthRate, month);
      const seasonal = seasonalityFactor[(new Date().getMonth() + month) % 12];
      const marketImpact = 1 + (marketTrends.reduce((sum, trend) => sum + trend.impact, 0) / marketTrends.length * 0.1);
      
      const predictedValue = currentPipelineValue * baseGrowth * seasonal * marketImpact;
      const confidence = Math.max(0.5, currentModel.accuracy - (month * 0.02)); // Confidence decreases over time
      
      return {
        period: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        value: predictedValue,
        confidence,
        lowerBound: predictedValue * (1 - (1 - confidence) * 2),
        upperBound: predictedValue * (1 + (1 - confidence) * 2)
      };
    });

    newForecasts.push({
      metric: 'Pipeline Value',
      model: currentModel.name,
      predictions: pipelinePredictions,
      accuracy: currentModel.accuracy,
      factors: ['historical_trends', 'seasonality', 'market_conditions', 'team_capacity']
    });

    // Conversion rate forecast
    const avgConversionRate = opportunities.filter(o => o.stage === 'Closed Won').length / opportunities.length || 0.2;
    const conversionPredictions = Array.from({ length: horizon }, (_, i) => {
      const month = i + 1;
      const trendAdjustment = marketTrends.filter(t => t.impact > 0).length > marketTrends.filter(t => t.impact < 0).length ? 0.02 : -0.01;
      const predictedRate = Math.max(0.05, Math.min(0.8, avgConversionRate + (trendAdjustment * month)));
      
      return {
        period: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        value: predictedRate,
        confidence: Math.max(0.6, currentModel.accuracy - (month * 0.015)),
        lowerBound: Math.max(0.01, predictedRate * 0.8),
        upperBound: Math.min(0.9, predictedRate * 1.3)
      };
    });

    newForecasts.push({
      metric: 'Conversion Rate',
      model: currentModel.name,
      predictions: conversionPredictions,
      accuracy: currentModel.accuracy,
      factors: ['team_experience', 'market_conditions', 'competitive_landscape', 'pricing_strategy']
    });

    // Revenue forecast
    const revenuePredictions = pipelinePredictions.map((pred, i) => ({
      ...pred,
      value: pred.value * conversionPredictions[i].value,
      lowerBound: pred.lowerBound * conversionPredictions[i].lowerBound,
      upperBound: pred.upperBound * conversionPredictions[i].upperBound
    }));

    newForecasts.push({
      metric: 'Expected Revenue',
      model: currentModel.name,
      predictions: revenuePredictions,
      accuracy: currentModel.accuracy * 0.9, // Revenue is harder to predict
      factors: ['pipeline_health', 'conversion_trends', 'market_dynamics', 'competitive_pressure']
    });

    return newForecasts;
  }, [opportunities, marketTrends, selectedModel, forecastHorizon]);

  // Generate early warnings
  const generateEarlyWarnings = useMemo(() => {
    const warnings: EarlyWarning[] = [];
    const now = new Date();

    // Engagement risk warnings
    opportunities.forEach(opp => {
      const stage = pipelineStages.find(s => s.name === opp.stage);
      if (stage && opp.daysInStage > stage.averageDuration * 1.5) {
        const severity = opp.daysInStage > stage.averageDuration * 2 ? 'high' : 'medium';
        warnings.push({
          id: `stall-${opp.id}`,
          type: 'pipeline_stall',
          severity: severity as any,
          title: `${opp.name} Stalled in ${opp.stage}`,
          description: `Opportunity has been in ${opp.stage} stage for ${opp.daysInStage} days (${Math.round((opp.daysInStage / stage.averageDuration - 1) * 100)}% longer than average)`,
          affectedEntities: [opp.id],
          predictedImpact: opp.value * opp.probability * 0.3, // 30% value at risk
          timeToImpact: 7,
          confidence: 0.85,
          mitigationActions: [
            'Schedule stakeholder alignment meeting',
            'Review and address objections',
            'Provide additional value proposition',
            'Set clear next steps with timeline'
          ],
          trend: 'deteriorating'
        });
      }
    });

    // High-value at-risk opportunities
    const highValueRisk = opportunities.filter(opp => 
      opp.value > 100000 && opp.probability < 0.6 && opp.riskFactors.length > 2
    );

    highValueRisk.forEach(opp => {
      warnings.push({
        id: `risk-${opp.id}`,
        type: 'engagement_risk',
        severity: 'critical',
        title: `High-Value Opportunity at Risk`,
        description: `${opp.name} (${opp.value.toLocaleString()}) has ${opp.riskFactors.length} risk factors and ${Math.round(opp.probability * 100)}% close probability`,
        affectedEntities: [opp.id],
        predictedImpact: opp.value * 0.8,
        timeToImpact: 14,
        confidence: 0.78,
        mitigationActions: [
          'Escalate to senior leadership',
          'Develop risk mitigation plan',
          'Increase stakeholder engagement',
          'Consider pricing/terms adjustment'
        ],
        trend: 'stable'
      });
    });

    // Market trend warnings
    const negativeTrends = marketTrends.filter(t => t.impact < -0.3 && t.confidence > 0.7);
    if (negativeTrends.length > 0) {
      warnings.push({
        id: 'market-trends',
        type: 'market_shift',
        severity: 'medium',
        title: `Negative Market Trends Detected`,
        description: `${negativeTrends.length} market trends showing negative impact on business`,
        affectedEntities: negativeTrends.map(t => t.id),
        predictedImpact: opportunities.reduce((sum, opp) => sum + opp.value, 0) * 0.15,
        timeToImpact: 30,
        confidence: negativeTrends.reduce((sum, t) => sum + t.confidence, 0) / negativeTrends.length,
        mitigationActions: [
          'Adjust pricing strategy',
          'Accelerate pipeline velocity',
          'Explore new market segments',
          'Strengthen competitive positioning'
        ],
        trend: 'deteriorating'
      });
    }

    // Capacity warnings (simulated)
    const currentCapacity = 100; // Assume current team capacity
    const demandForecast = opportunities.filter(o => o.probability > 0.5).length * 40; // 40 hours per likely opportunity
    
    if (demandForecast > currentCapacity * 0.85) {
      warnings.push({
        id: 'capacity-constraint',
        type: 'capacity_issue',
        severity: demandForecast > currentCapacity ? 'high' : 'medium',
        title: 'Capacity Constraint Approaching',
        description: `Forecasted demand (${Math.round(demandForecast)} hours) approaching capacity limits (${currentCapacity} hours)`,
        affectedEntities: ['team_capacity'],
        predictedImpact: Math.min(demandForecast - currentCapacity, 0) * -500, // Cost of over-capacity
        timeToImpact: 21,
        confidence: 0.72,
        mitigationActions: [
          'Hire additional team members',
          'Optimize resource allocation',
          'Consider subcontracting',
          'Prioritize high-value opportunities'
        ],
        trend: 'deteriorating'
      });
    }

    return warnings.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [opportunities, marketTrends, pipelineStages]);

  // Generate capacity planning recommendations
  const generateCapacityPlans = useMemo(() => {
    const plans: CapacityPlan[] = [
      {
        department: 'Sales',
        currentCapacity: 160, // hours per week
        demandForecast: 180,
        utilizationRate: 0.85,
        bottlenecks: ['Lead qualification', 'Proposal development'],
        recommendations: [
          { action: 'Hire 1 additional sales rep', impact: 0.25, cost: 80000, timeline: '2 months' },
          { action: 'Implement sales automation tools', impact: 0.15, cost: 15000, timeline: '1 month' },
          { action: 'Optimize lead qualification process', impact: 0.10, cost: 5000, timeline: '2 weeks' }
        ],
        riskLevel: 'medium'
      },
      {
        department: 'Delivery',
        currentCapacity: 320,
        demandForecast: 380,
        utilizationRate: 0.92,
        bottlenecks: ['Senior consultant availability', 'Quality review process'],
        recommendations: [
          { action: 'Hire 2 senior consultants', impact: 0.35, cost: 200000, timeline: '3 months' },
          { action: 'Cross-train junior consultants', impact: 0.20, cost: 20000, timeline: '6 weeks' },
          { action: 'Streamline quality review', impact: 0.12, cost: 8000, timeline: '3 weeks' }
        ],
        riskLevel: 'high'
      },
      {
        department: 'Support',
        currentCapacity: 80,
        demandForecast: 70,
        utilizationRate: 0.65,
        bottlenecks: [],
        recommendations: [
          { action: 'Reallocate resources to delivery', impact: 0.15, cost: -10000, timeline: '2 weeks' },
          { action: 'Develop self-service resources', impact: 0.10, cost: 12000, timeline: '8 weeks' }
        ],
        riskLevel: 'low'
      }
    ];

    return plans;
  }, []);

  useEffect(() => {
    setForecasts(generatePipelineForecasts);
    setEarlyWarnings(generateEarlyWarnings);
    setCapacityPlans(generateCapacityPlans);
  }, [generatePipelineForecasts, generateEarlyWarnings, generateCapacityPlans]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setForecasts(generatePipelineForecasts);
      setEarlyWarnings(generateEarlyWarnings);
      setCapacityPlans(generateCapacityPlans);
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, generatePipelineForecasts, generateEarlyWarnings, generateCapacityPlans]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-blue-600 bg-blue-100 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMarketTrendIcon = (category: string) => {
    switch (category) {
      case 'industry': return <Building className="h-4 w-4" />;
      case 'technology': return <Zap className="h-4 w-4" />;
      case 'economic': return <DollarSign className="h-4 w-4" />;
      case 'regulatory': return <Shield className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const currentModel = forecastModels.find(m => m.type === selectedModel) || forecastModels[0];
  const criticalWarnings = earlyWarnings.filter(w => w.severity === 'critical');
  const highRiskCapacity = capacityPlans.filter(p => p.riskLevel === 'high');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Insights Dashboard</h2>
          <p className="text-muted-foreground">
            Advanced forecasting and early warning systems for proactive management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {forecastModels.map(model => (
                <SelectItem key={model.type} value={model.type}>
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
          <Select value={forecastHorizon} onValueChange={setForecastHorizon as any}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalWarnings.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Warnings Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalWarnings.length} critical issue{criticalWarnings.length > 1 ? 's' : ''} requiring immediate attention.
            Potential impact: ${criticalWarnings.reduce((sum, w) => sum + w.predictedImpact, 0).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${forecasts.find(f => f.metric === 'Pipeline Value')?.predictions[0]?.value?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Next month prediction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((forecasts.find(f => f.metric === 'Conversion Rate')?.predictions[0]?.value || 0) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Predicted next month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{earlyWarnings.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalWarnings.length} critical alerts
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
      </div>

      <Tabs defaultValue="forecasts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Pipeline Forecasts</TabsTrigger>
          <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecasts.map((forecast, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{forecast.metric}</CardTitle>
                    <Badge variant="outline">
                      {Math.round(forecast.accuracy * 100)}% accuracy
                    </Badge>
                  </div>
                  <CardDescription>
                    Model: {forecast.model} | {forecastHorizon} horizon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current vs Predicted */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current</div>
                        <div className="text-lg font-bold">
                          {forecast.metric === 'Conversion Rate' ? 
                            `${Math.round(forecast.predictions[0]?.value * 100)}%` : 
                            `$${forecast.predictions[0]?.value?.toLocaleString() || 0}`
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {forecastHorizon} Forecast
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {forecast.metric === 'Conversion Rate' ? 
                            `${Math.round(forecast.predictions[forecast.predictions.length - 1]?.value * 100)}%` : 
                            `$${forecast.predictions[forecast.predictions.length - 1]?.value?.toLocaleString() || 0}`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Mini trend chart visualization */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Forecast Trend</div>
                      <div className="grid grid-cols-6 gap-1 h-20">
                        {forecast.predictions.slice(0, 6).map((pred, i) => {
                          const maxValue = Math.max(...forecast.predictions.map(p => p.value));
                          const height = (pred.value / maxValue) * 80;
                          
                          return (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div 
                                className="bg-blue-600 rounded-sm w-full transition-all hover:bg-blue-700 cursor-help"
                                style={{ height: `${height}px` }}
                                title={`${pred.period}: ${forecast.metric === 'Conversion Rate' ? 
                                  `${Math.round(pred.value * 100)}%` : 
                                  `$${pred.value.toLocaleString()}`
                                }`}
                              />
                              <div className="text-xs text-muted-foreground">
                                M{i + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Confidence and factors */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span>{Math.round(forecast.predictions[0]?.confidence * 100)}%</span>
                        </div>
                        <Progress 
                          value={forecast.predictions[0]?.confidence * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Key Factors</div>
                        <div className="flex flex-wrap gap-1">
                          {forecast.factors.map(factor => (
                            <Badge key={factor} variant="outline" size="sm">
                              {factor.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="warnings" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {earlyWarnings.map(warning => (
              <Card key={warning.id} className={`border-l-4 ${getSeverityColor(warning.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(warning.severity)}
                      <CardTitle className="text-lg">{warning.title}</CardTitle>
                      <Badge className={getSeverityColor(warning.severity)}>
                        {warning.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(warning.trend)}
                      <Badge variant="outline">
                        {Math.round(warning.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{warning.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Predicted Impact:</span>
                      <div className="font-bold text-red-600">
                        ${Math.abs(warning.predictedImpact).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Impact:</span>
                      <div className="font-bold">
                        {warning.timeToImpact} days
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Affected:</span>
                      <div className="font-bold">
                        {warning.affectedEntities.length} item{warning.affectedEntities.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      Recommended Actions:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {warning.mitigationActions.map((action, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onTakeAction?.(warning.id, action);
                            toast({
                              title: "Action Initiated",
                              description: action,
                            });
                          }}
                          className="justify-start text-left h-auto py-2"
                        >
                          <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{action}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {capacityPlans.map(plan => (
              <Card key={plan.department} className={`${plan.riskLevel === 'high' ? 'border-red-300 bg-red-50' : 
                plan.riskLevel === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.department}</CardTitle>
                    <Badge variant={plan.riskLevel === 'high' ? 'destructive' : 
                      plan.riskLevel === 'medium' ? 'default' : 'secondary'}>
                      {plan.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Capacity</div>
                      <div className="text-lg font-bold">{plan.currentCapacity}h</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Demand Forecast</div>
                      <div className="text-lg font-bold text-blue-600">{plan.demandForecast}h</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Utilization Rate</span>
                      <span>{Math.round(plan.utilizationRate * 100)}%</span>
                    </div>
                    <Progress 
                      value={plan.utilizationRate * 100} 
                      className="h-2"
                    />
                  </div>

                  {plan.bottlenecks.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-red-600">Bottlenecks:</div>
                      <div className="flex flex-wrap gap-1">
                        {plan.bottlenecks.map(bottleneck => (
                          <Badge key={bottleneck} variant="destructive" size="sm">
                            {bottleneck}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2">Recommendations:</div>
                    <div className="space-y-2">
                      {plan.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="p-2 bg-white bg-opacity-70 rounded border">
                          <div className="font-medium text-sm">{rec.action}</div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-1">
                            <span>Impact: +{Math.round(rec.impact * 100)}%</span>
                            <span>Cost: ${rec.cost.toLocaleString()}</span>
                            <span>Timeline: {rec.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Trend Analysis</CardTitle>
                <CardDescription>
                  External factors affecting business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {marketTrends.map(trend => (
                      <div key={trend.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMarketTrendIcon(trend.category)}
                            <h4 className="font-medium">{trend.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {trend.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                             trend.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-600" /> :
                             <ArrowRight className="h-4 w-4 text-gray-600" />}
                            <Badge variant={trend.impact > 0 ? 'default' : 
                              trend.impact < 0 ? 'destructive' : 'secondary'}>
                              {trend.impact > 0 ? '+' : ''}{Math.round(trend.impact * 100)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" size="sm">
                            {Math.round(trend.confidence * 100)}% confidence
                          </Badge>
                          <span className="text-muted-foreground">{trend.timeframe}</span>
                        </div>

                        {trend.correlatedMetrics.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">Correlated metrics:</div>
                            <div className="flex flex-wrap gap-1">
                              {trend.correlatedMetrics.map(metric => (
                                <Badge key={metric} variant="outline" size="sm">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlation Impact Matrix</CardTitle>
                <CardDescription>
                  How market trends correlate with business metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Correlation matrix visualization</p>
                    <p className="text-sm">Would be implemented with charting library</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};