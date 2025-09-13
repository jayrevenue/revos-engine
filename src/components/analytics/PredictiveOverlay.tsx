import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';

export interface DataPoint {
  date: string;
  value: number;
  actual?: boolean;
  predicted?: boolean;
  confidence?: number;
  factors?: string[];
}

export interface PredictionModel {
  id: string;
  name: string;
  type: 'linear' | 'polynomial' | 'exponential' | 'seasonal' | 'ml';
  accuracy: number;
  confidence: number;
  lastTrained: string;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  impact: number;
  probability: number;
  color: string;
}

interface PredictiveOverlayProps {
  title: string;
  historicalData: DataPoint[];
  targetValue?: number;
  targetDate?: string;
  predictionHorizon?: number; // days
  showConfidenceBands?: boolean;
  showScenarios?: boolean;
  models?: PredictionModel[];
  scenarios?: Scenario[];
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export const PredictiveOverlay = ({
  title,
  historicalData,
  targetValue,
  targetDate,
  predictionHorizon = 30,
  showConfidenceBands = true,
  showScenarios = true,
  models = [],
  scenarios = [],
  onModelChange,
  className = ''
}: PredictiveOverlayProps) => {
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || 'linear');
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [showInsights, setShowInsights] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  // Default models if none provided
  const defaultModels: PredictionModel[] = [
    {
      id: 'linear',
      name: 'Linear Regression',
      type: 'linear',
      accuracy: 85,
      confidence: 80,
      lastTrained: '2024-01-15',
      description: 'Simple linear trend based on historical data'
    },
    {
      id: 'seasonal',
      name: 'Seasonal ARIMA',
      type: 'seasonal',
      accuracy: 92,
      confidence: 88,
      lastTrained: '2024-01-15',
      description: 'Accounts for seasonal patterns and trends'
    },
    {
      id: 'ml',
      name: 'ML Ensemble',
      type: 'ml',
      accuracy: 96,
      confidence: 92,
      lastTrained: '2024-01-15',
      description: 'Machine learning model with multiple algorithms'
    }
  ];

  // Default scenarios if none provided
  const defaultScenarios: Scenario[] = [
    {
      id: 'base',
      name: 'Base Case',
      description: 'Current trajectory continues',
      impact: 0,
      probability: 60,
      color: '#8884d8'
    },
    {
      id: 'optimistic',
      name: 'Optimistic',
      description: 'Favorable market conditions',
      impact: 25,
      probability: 25,
      color: '#82ca9d'
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic',
      description: 'Challenging market conditions',
      impact: -20,
      probability: 15,
      color: '#ff7300'
    }
  ];

  const activeModels = models.length > 0 ? models : defaultModels;
  const activeScenarios = scenarios.length > 0 ? scenarios : defaultScenarios;
  const currentModel = activeModels.find(m => m.id === selectedModel) || activeModels[0];

  // Generate predictions based on selected model
  const predictions = useMemo(() => {
    if (historicalData.length < 2) return [];

    const lastDataPoint = historicalData[historicalData.length - 1];
    const lastValue = lastDataPoint.value;
    const lastDate = new Date(lastDataPoint.date);

    // Simple prediction algorithms
    const generatePrediction = (days: number): DataPoint[] => {
      const predictions: DataPoint[] = [];
      
      for (let i = 1; i <= days; i++) {
        const predictionDate = new Date(lastDate);
        predictionDate.setDate(predictionDate.getDate() + i);

        let predictedValue: number;
        let confidence: number;

        switch (currentModel.type) {
          case 'linear':
            // Simple linear regression
            const recentData = historicalData.slice(-10);
            const trend = recentData.length > 1 
              ? (recentData[recentData.length - 1].value - recentData[0].value) / recentData.length
              : 0;
            predictedValue = lastValue + (trend * i);
            confidence = Math.max(40, currentModel.confidence - (i * 2));
            break;

          case 'seasonal':
            // Simple seasonal model (weekly pattern)
            const weeklyPattern = [1.0, 0.95, 0.98, 1.05, 1.1, 1.2, 0.8];
            const dayOfWeek = predictionDate.getDay();
            const seasonalFactor = weeklyPattern[dayOfWeek];
            const baseTrend = lastValue * (1 + (0.02 * i / 30)); // 2% monthly growth
            predictedValue = baseTrend * seasonalFactor;
            confidence = Math.max(50, currentModel.confidence - (i * 1.5));
            break;

          case 'ml':
            // Simulated ML prediction with noise
            const baseGrowth = lastValue * (1 + (0.03 * i / 30)); // 3% monthly growth
            const noise = (Math.random() - 0.5) * 0.1;
            predictedValue = baseGrowth * (1 + noise);
            confidence = Math.max(60, currentModel.confidence - (i * 1));
            break;

          default:
            predictedValue = lastValue;
            confidence = 50;
        }

        // Apply scenario impact
        const scenario = activeScenarios.find(s => s.id === selectedScenario);
        if (scenario && scenario.id !== 'base') {
          predictedValue = predictedValue * (1 + scenario.impact / 100);
        }

        predictions.push({
          date: predictionDate.toISOString().split('T')[0],
          value: Math.max(0, predictedValue),
          predicted: true,
          confidence: Math.min(100, Math.max(0, confidence))
        });
      }

      return predictions;
    };

    return generatePrediction(predictionHorizon);
  }, [historicalData, currentModel, selectedScenario, predictionHorizon]);

  // Generate confidence bands
  const confidenceBands = useMemo(() => {
    if (!showConfidenceBands) return [];

    return predictions.map(pred => {
      const margin = (pred.value * (100 - pred.confidence!)) / 200;
      return {
        ...pred,
        upperBand: pred.value + margin,
        lowerBand: Math.max(0, pred.value - margin)
      };
    });
  }, [predictions, showConfidenceBands]);

  // Combine historical and prediction data
  const chartData = useMemo(() => {
    const combined = [
      ...historicalData.map(d => ({ ...d, actual: true })),
      ...predictions
    ];
    
    return combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historicalData, predictions]);

  // Calculate insights
  const insights = useMemo(() => {
    if (predictions.length === 0) return [];

    const finalPrediction = predictions[predictions.length - 1];
    const currentValue = historicalData[historicalData.length - 1]?.value || 0;
    const growthRate = ((finalPrediction.value - currentValue) / currentValue) * 100;
    
    const insights = [];

    // Growth trend insight
    if (Math.abs(growthRate) > 5) {
      insights.push({
        type: growthRate > 0 ? 'positive' : 'negative',
        icon: growthRate > 0 ? TrendingUp : TrendingDown,
        title: `${Math.abs(growthRate).toFixed(1)}% ${growthRate > 0 ? 'Growth' : 'Decline'} Predicted`,
        description: `Based on current trends, expecting ${growthRate > 0 ? 'growth' : 'decline'} over the next ${predictionHorizon} days`
      });
    }

    // Target achievement insight
    if (targetValue && targetDate) {
      const targetDateObj = new Date(targetDate);
      const relevantPrediction = predictions.find(p => 
        new Date(p.date) >= targetDateObj
      );
      
      if (relevantPrediction) {
        const willAchieve = relevantPrediction.value >= targetValue;
        insights.push({
          type: willAchieve ? 'positive' : 'warning',
          icon: willAchieve ? CheckCircle : AlertTriangle,
          title: willAchieve ? 'Target Likely to be Achieved' : 'Target at Risk',
          description: `Predicted value: ${relevantPrediction.value.toLocaleString()} vs target: ${targetValue.toLocaleString()}`
        });
      }
    }

    // Confidence insight
    const avgConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length;
    if (avgConfidence < 70) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Prediction Confidence',
        description: `Model confidence is ${avgConfidence.toFixed(0)}%. Consider using more recent data or different model.`
      });
    }

    return insights;
  }, [predictions, targetValue, targetDate, predictionHorizon]);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange?.(modelId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {title}
            <Badge variant="secondary" className="ml-2">
              {currentModel.accuracy}% Accuracy
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.accuracy}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showScenarios && (
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeScenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectContent>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {currentModel.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()} 
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                        <p style={{ color: payload[0].color }}>
                          Value: {payload[0].value?.toLocaleString()}
                          {data.predicted && ` (Predicted)`}
                        </p>
                        {data.confidence && (
                          <p className="text-sm text-muted-foreground">
                            Confidence: {data.confidence.toFixed(0)}%
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {/* Confidence bands */}
              {showConfidenceBands && (
                <Area
                  type="monotone"
                  dataKey="upperBand"
                  stackId="1"
                  stroke="none"
                  fill="#8884d8"
                  fillOpacity={0.1}
                />
              )}
              {showConfidenceBands && (
                <Area
                  type="monotone"
                  dataKey="lowerBand"
                  stackId="1"
                  stroke="none"
                  fill="white"
                  fillOpacity={1}
                />
              )}

              {/* Historical data */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />

              {/* Prediction line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />

              {/* Target line */}
              {targetValue && (
                <ReferenceLine 
                  y={targetValue} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                  label="Target"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance & Settings */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{currentModel.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Model Accuracy</div>
              <Progress value={currentModel.accuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{currentModel.confidence}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
              <Progress value={currentModel.confidence} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{predictionHorizon}</div>
              <div className="text-xs text-muted-foreground">Days Forecast</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{predictions.length}</div>
              <div className="text-xs text-muted-foreground">Predictions</div>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios */}
        {showScenarios && (
          <div className="space-y-3">
            <h4 className="font-medium">Scenario Analysis</h4>
            <div className="grid gap-3 md:grid-cols-3">
              {activeScenarios.map(scenario => (
                <Button
                  key={scenario.id}
                  variant={selectedScenario === scenario.id ? "default" : "outline"}
                  className="h-auto p-4 text-left flex flex-col items-start"
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{scenario.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {scenario.probability}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {scenario.description}
                  </p>
                  <div className="text-sm mt-1 flex items-center gap-1">
                    {scenario.impact > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : scenario.impact < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                    {scenario.impact > 0 ? '+' : ''}{scenario.impact}% impact
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {showInsights && insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">AI Insights</h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Alert key={index} className={
                  insight.type === 'positive' ? 'border-green-200 bg-green-50' :
                  insight.type === 'negative' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }>
                  <insight.icon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">{insight.description}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};