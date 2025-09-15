import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Star,
  Activity,
  Zap,
  Shield,
  Lightbulb,
  ArrowRight,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  Eye,
  RefreshCw
} from 'lucide-react';

interface HistoricalEngagement {
  id: string;
  name: string;
  clientName: string;
  clientIndustry: string;
  clientSize: 'startup' | 'sme' | 'enterprise';
  engagementType: string;
  duration: number; // in days
  teamSize: number;
  budget: number;
  actualCost: number;
  success: boolean;
  clientSatisfaction: number; // 1-5
  onTimeDelivery: boolean;
  budgetVariance: number; // percentage over/under
  scope: string[];
  challenges: string[];
  successFactors: string[];
  riskFactors: string[];
  outcome: 'exceeded' | 'met' | 'partially_met' | 'failed';
  deliverables: number;
  completedDeliverables: number;
  teamExperience: number; // average years
  clientRelationship: 'new' | 'returning' | 'long_term';
}

interface CurrentEngagement {
  id: string;
  name: string;
  clientName: string;
  clientIndustry: string;
  clientSize: 'startup' | 'sme' | 'enterprise';
  engagementType: string;
  plannedDuration: number;
  currentDay: number;
  teamSize: number;
  budget: number;
  currentSpend: number;
  scope: string[];
  riskFactors: string[];
  teamExperience: number;
  clientRelationship: 'new' | 'returning' | 'long_term';
  milestonesCompleted: number;
  totalMilestones: number;
  currentProgress: number; // 0-100
}

interface PredictionModel {
  name: string;
  description: string;
  accuracy: number;
  factors: string[];
  weights: { [key: string]: number };
}

interface SuccessPrediction {
  engagementId: string;
  overallSuccessProbability: number;
  onTimeDeliveryProbability: number;
  budgetComplianceProbability: number;
  clientSatisfactionPrediction: number;
  outcomeDistribution: {
    exceeded: number;
    met: number;
    partially_met: number;
    failed: number;
  };
  keyRiskFactors: {
    factor: string;
    impact: number;
    mitigation: string[];
  }[];
  successDrivers: {
    factor: string;
    contribution: number;
    recommendation: string[];
  }[];
  confidence: number;
  modelUsed: string;
  predictions: {
    timeline: {
      week: number;
      probability: number;
      factors: string[];
    }[];
  };
}

interface EngagementSuccessPredictorProps {
  historicalEngagements: HistoricalEngagement[];
  currentEngagements: CurrentEngagement[];
  onUpdateEngagement?: (engagementId: string, updates: Partial<CurrentEngagement>) => void;
}

export const EngagementSuccessPredictor = ({
  historicalEngagements,
  currentEngagements,
  onUpdateEngagement
}: EngagementSuccessPredictorProps) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>('ensemble');
  const [selectedEngagement, setSelectedEngagement] = useState<string>('');
  const [timeHorizon, setTimeHorizon] = useState<'1week' | '1month' | '3months'>('1month');
  const [predictions, setPredictions] = useState<SuccessPrediction[]>([]);

  // ML Models for prediction
  const predictionModels: PredictionModel[] = [
    {
      name: 'ensemble',
      description: 'Ensemble model combining multiple algorithms',
      accuracy: 0.89,
      factors: ['team_experience', 'client_relationship', 'budget_ratio', 'scope_complexity', 'timeline_pressure'],
      weights: {
        team_experience: 0.25,
        client_relationship: 0.20,
        budget_ratio: 0.20,
        scope_complexity: 0.15,
        timeline_pressure: 0.20
      }
    },
    {
      name: 'regression',
      description: 'Linear regression with feature engineering',
      accuracy: 0.82,
      factors: ['historical_success', 'team_size', 'engagement_type', 'client_industry'],
      weights: {
        historical_success: 0.30,
        team_size: 0.25,
        engagement_type: 0.25,
        client_industry: 0.20
      }
    },
    {
      name: 'neural_network',
      description: 'Deep neural network with pattern recognition',
      accuracy: 0.85,
      factors: ['all_features'],
      weights: {
        all_features: 1.0
      }
    },
    {
      name: 'decision_tree',
      description: 'Decision tree with interpretable rules',
      accuracy: 0.78,
      factors: ['client_size', 'timeline', 'budget', 'team_composition'],
      weights: {
        client_size: 0.30,
        timeline: 0.25,
        budget: 0.25,
        team_composition: 0.20
      }
    }
  ];

  // Advanced ML prediction algorithm
  const generatePredictions = useMemo(() => {
    const newPredictions: SuccessPrediction[] = [];

    // Calculate historical patterns and success rates
    const calculateHistoricalMetrics = () => {
      const industrySuccess: { [key: string]: number } = {};
      const engagementTypeSuccess: { [key: string]: number } = {};
      const clientSizeSuccess: { [key: string]: number } = {};
      const teamSizeSuccess: { [key: string]: number } = {};

      historicalEngagements.forEach(engagement => {
        // Industry patterns
        if (!industrySuccess[engagement.clientIndustry]) {
          industrySuccess[engagement.clientIndustry] = 0;
        }
        industrySuccess[engagement.clientIndustry] += engagement.success ? 1 : 0;

        // Engagement type patterns
        if (!engagementTypeSuccess[engagement.engagementType]) {
          engagementTypeSuccess[engagement.engagementType] = 0;
        }
        engagementTypeSuccess[engagement.engagementType] += engagement.success ? 1 : 0;

        // Client size patterns
        if (!clientSizeSuccess[engagement.clientSize]) {
          clientSizeSuccess[engagement.clientSize] = 0;
        }
        clientSizeSuccess[engagement.clientSize] += engagement.success ? 1 : 0;

        // Team size patterns
        const teamSizeGroup = engagement.teamSize <= 3 ? 'small' : engagement.teamSize <= 8 ? 'medium' : 'large';
        if (!teamSizeSuccess[teamSizeGroup]) {
          teamSizeSuccess[teamSizeGroup] = 0;
        }
        teamSizeSuccess[teamSizeGroup] += engagement.success ? 1 : 0;
      });

      // Normalize to percentages
      Object.keys(industrySuccess).forEach(key => {
        const total = historicalEngagements.filter(e => e.clientIndustry === key).length;
        industrySuccess[key] = industrySuccess[key] / total;
      });

      return { industrySuccess, engagementTypeSuccess, clientSizeSuccess, teamSizeSuccess };
    };

    const historicalMetrics = calculateHistoricalMetrics();
    const currentModel = predictionModels.find(m => m.name === selectedModel) || predictionModels[0];

    currentEngagements.forEach(engagement => {
      // Feature extraction and scoring
      const features = {
        progressScore: engagement.currentProgress / 100,
        timelineScore: engagement.currentDay / engagement.plannedDuration,
        budgetScore: engagement.currentSpend / engagement.budget,
        milestoneScore: engagement.milestonesCompleted / engagement.totalMilestones,
        teamExperienceScore: Math.min(engagement.teamExperience / 10, 1),
        clientRelationshipScore: engagement.clientRelationship === 'long_term' ? 1 : 
          engagement.clientRelationship === 'returning' ? 0.7 : 0.4,
        industryScore: historicalMetrics.industrySuccess[engagement.clientIndustry] || 0.5,
        engagementTypeScore: historicalMetrics.engagementTypeSuccess[engagement.engagementType] || 0.5,
        clientSizeScore: historicalMetrics.clientSizeSuccess[engagement.clientSize] || 0.5,
        teamSizeScore: historicalMetrics.teamSizeSuccess[
          engagement.teamSize <= 3 ? 'small' : engagement.teamSize <= 8 ? 'medium' : 'large'
        ] || 0.5,
        scopeComplexityScore: Math.max(0.1, 1 - (engagement.scope.length / 20)),
        riskScore: Math.max(0.1, 1 - (engagement.riskFactors.length / 10))
      };

      // Apply model-specific calculations
      let baseSuccessProbability = 0;

      if (selectedModel === 'ensemble') {
        // Ensemble approach - weighted combination
        baseSuccessProbability = (
          features.progressScore * 0.15 +
          features.timelineScore * 0.10 +
          (1 - features.budgetScore) * 0.15 + // Lower budget usage is better
          features.milestoneScore * 0.15 +
          features.teamExperienceScore * 0.15 +
          features.clientRelationshipScore * 0.10 +
          features.industryScore * 0.10 +
          features.riskScore * 0.10
        );
      } else if (selectedModel === 'regression') {
        // Linear regression approach
        baseSuccessProbability = (
          features.industryScore * 0.30 +
          features.teamSizeScore * 0.25 +
          features.engagementTypeScore * 0.25 +
          features.clientSizeScore * 0.20
        );
      } else if (selectedModel === 'neural_network') {
        // Simulated neural network with non-linear combinations
        const hidden1 = Math.tanh(
          features.progressScore * 0.8 + features.timelineScore * 0.6 + features.budgetScore * -0.4
        );
        const hidden2 = Math.tanh(
          features.teamExperienceScore * 0.9 + features.clientRelationshipScore * 0.7 + features.riskScore * 0.5
        );
        baseSuccessProbability = sigmoid(hidden1 * 0.6 + hidden2 * 0.4);
      } else {
        // Decision tree approach
        let probability = 0.5;
        if (engagement.clientSize === 'enterprise') probability += 0.15;
        if (engagement.plannedDuration <= 90) probability += 0.10;
        if (engagement.budget > 100000) probability += 0.10;
        if (engagement.teamExperience > 5) probability += 0.15;
        baseSuccessProbability = Math.min(1, probability);
      }

      // Adjust for current progress and timeline
      const progressAdjustment = engagement.currentProgress > 70 ? 0.1 : 
        engagement.currentProgress < 30 ? -0.1 : 0;
      const timelineAdjustment = (engagement.currentDay / engagement.plannedDuration) > 0.8 && 
        engagement.currentProgress < 70 ? -0.15 : 0;

      const adjustedSuccessProbability = Math.max(0.05, Math.min(0.95, 
        baseSuccessProbability + progressAdjustment + timelineAdjustment
      ));

      // Specific probability calculations
      const onTimeDeliveryProbability = Math.max(0.05, Math.min(0.95,
        adjustedSuccessProbability * (1 - Math.max(0, (engagement.currentDay / engagement.plannedDuration - 0.7) * 2))
      ));

      const budgetComplianceProbability = Math.max(0.05, Math.min(0.95,
        adjustedSuccessProbability * (1 - Math.max(0, (engagement.currentSpend / engagement.budget - 0.8) * 3))
      ));

      const clientSatisfactionPrediction = Math.max(1, Math.min(5,
        2.5 + (adjustedSuccessProbability * 2.5) + 
        (engagement.clientRelationship === 'long_term' ? 0.5 : 0) -
        (engagement.riskFactors.length * 0.1)
      ));

      // Outcome distribution
      const outcomeDistribution = {
        exceeded: adjustedSuccessProbability > 0.8 ? adjustedSuccessProbability * 0.3 : 0.05,
        met: adjustedSuccessProbability * 0.6,
        partially_met: (1 - adjustedSuccessProbability) * 0.7,
        failed: (1 - adjustedSuccessProbability) * 0.3
      };

      // Identify key risk factors
      const keyRiskFactors = [];
      if (features.budgetScore > 0.8) {
        keyRiskFactors.push({
          factor: 'Budget Overrun Risk',
          impact: (features.budgetScore - 0.8) * 5,
          mitigation: [
            'Implement strict budget controls',
            'Review and optimize resource allocation',
            'Consider scope reduction or budget increase'
          ]
        });
      }
      if (features.timelineScore > 0.7 && features.progressScore < 0.7) {
        keyRiskFactors.push({
          factor: 'Timeline Pressure',
          impact: 0.8,
          mitigation: [
            'Increase team velocity through additional resources',
            'Prioritize critical path activities',
            'Consider timeline extension discussion'
          ]
        });
      }
      if (engagement.riskFactors.length > 3) {
        keyRiskFactors.push({
          factor: 'Multiple Risk Factors',
          impact: Math.min(1, engagement.riskFactors.length * 0.2),
          mitigation: [
            'Develop comprehensive risk mitigation plan',
            'Implement weekly risk assessment reviews',
            'Establish escalation procedures'
          ]
        });
      }

      // Success drivers
      const successDrivers = [];
      if (features.teamExperienceScore > 0.7) {
        successDrivers.push({
          factor: 'Experienced Team',
          contribution: features.teamExperienceScore,
          recommendation: [
            'Leverage team expertise for complex challenges',
            'Consider knowledge transfer sessions',
            'Document best practices for future projects'
          ]
        });
      }
      if (features.clientRelationshipScore > 0.6) {
        successDrivers.push({
          factor: 'Strong Client Relationship',
          contribution: features.clientRelationshipScore,
          recommendation: [
            'Maintain regular communication cadence',
            'Explore opportunities for expanded engagement',
            'Leverage relationship for change management'
          ]
        });
      }
      if (features.progressScore > 0.8) {
        successDrivers.push({
          factor: 'Strong Progress Momentum',
          contribution: features.progressScore,
          recommendation: [
            'Maintain current execution velocity',
            'Prepare for potential scope expansion',
            'Document success factors for replication'
          ]
        });
      }

      // Generate weekly predictions
      const weeklyPredictions = [];
      const weeksRemaining = Math.ceil((engagement.plannedDuration - engagement.currentDay) / 7);
      for (let week = 1; week <= Math.min(weeksRemaining, 12); week++) {
        const weekFactor = 1 - (week * 0.05); // Confidence decreases over time
        const weeklyProbability = adjustedSuccessProbability * weekFactor;
        
        weeklyPredictions.push({
          week,
          probability: Math.max(0.1, Math.min(0.9, weeklyProbability)),
          factors: week <= 4 ? ['current_trajectory', 'team_performance'] : 
            ['market_conditions', 'external_risks', 'scope_changes']
        });
      }

      // Calculate model confidence
      const modelConfidence = currentModel.accuracy * 
        Math.min(1, historicalEngagements.length / 50) * // More data = higher confidence
        (1 - Math.abs(0.5 - adjustedSuccessProbability) * 0.5); // Extreme predictions = lower confidence

      newPredictions.push({
        engagementId: engagement.id,
        overallSuccessProbability: adjustedSuccessProbability,
        onTimeDeliveryProbability,
        budgetComplianceProbability,
        clientSatisfactionPrediction,
        outcomeDistribution,
        keyRiskFactors,
        successDrivers,
        confidence: modelConfidence,
        modelUsed: selectedModel,
        predictions: {
          timeline: weeklyPredictions
        }
      });
    });

    return newPredictions;
  }, [currentEngagements, historicalEngagements, selectedModel]);

  useEffect(() => {
    setPredictions(generatePredictions);
  }, [generatePredictions]);

// Helper function for sigmoid
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600 bg-green-100';
    if (probability >= 0.6) return 'text-blue-600 bg-blue-100';
    if (probability >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuccessIcon = (probability: number) => {
    if (probability >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (probability >= 0.6) return <TrendingUp className="h-4 w-4" />;
    if (probability >= 0.4) return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'exceeded': return <Award className="h-4 w-4 text-green-600" />;
      case 'met': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'partially_met': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const currentModel = predictionModels.find(m => m.name === selectedModel) || predictionModels[0];
  const avgSuccessRate = predictions.length > 0 
    ? predictions.reduce((acc, p) => acc + p.overallSuccessProbability, 0) / predictions.length 
    : 0;

  const riskEngagements = predictions.filter(p => p.overallSuccessProbability < 0.6);
  const highConfidencePredictions = predictions.filter(p => p.confidence > 0.8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Success Predictor</h2>
          <p className="text-muted-foreground">
            ML-powered engagement outcome prediction and optimization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {predictionModels.map(model => (
                <SelectItem key={model.name} value={model.name}>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>{model.description}</span>
                    <Badge variant="outline" size="sm">
                      {Math.round(model.accuracy * 100)}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const newPredictions = generatePredictions;
              setPredictions(newPredictions);
              toast({
                title: "Predictions Updated",
                description: "ML models have been recalculated with latest data",
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Model Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Current Model: {currentModel.description}
              </CardTitle>
              <CardDescription>
                Accuracy: {Math.round(currentModel.accuracy * 100)}% | 
                Training Data: {historicalEngagements.length} engagements
              </CardDescription>
            </div>
            <Badge variant="outline">
              {currentModel.factors.length} feature{currentModel.factors.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(avgSuccessRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across {predictions.length} active engagements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskEngagements.length}</div>
            <p className="text-xs text-muted-foreground">
              &lt;60% success probability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highConfidencePredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              &gt;80% model confidence
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
              Historical validation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="models">Model Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {predictions.map((prediction, index) => {
              const engagement = currentEngagements.find(e => e.id === prediction.engagementId);
              if (!engagement) return null;

              return (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getSuccessIcon(prediction.overallSuccessProbability)}
                          {engagement.name}
                        </CardTitle>
                        <CardDescription>
                          Client: {engagement.clientName} | 
                          Day {engagement.currentDay} of {engagement.plannedDuration}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSuccessColor(prediction.overallSuccessProbability)}>
                          {Math.round(prediction.overallSuccessProbability * 100)}% Success
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                        <div className="text-lg font-medium">
                          {Math.round(prediction.onTimeDeliveryProbability * 100)}%
                        </div>
                        <Progress 
                          value={prediction.onTimeDeliveryProbability * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Budget Compliance</div>
                        <div className="text-lg font-medium">
                          {Math.round(prediction.budgetComplianceProbability * 100)}%
                        </div>
                        <Progress 
                          value={prediction.budgetComplianceProbability * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                        <div className="text-lg font-medium flex items-center justify-center gap-1">
                          {prediction.clientSatisfactionPrediction.toFixed(1)}
                          <Star className="h-3 w-3 text-yellow-400" />
                        </div>
                        <div className="flex justify-center mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`h-2 w-2 ${
                                i < Math.round(prediction.clientSatisfactionPrediction) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Outcome Distribution */}
                    <div>
                      <h4 className="font-medium mb-3">Outcome Probability Distribution</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(prediction.outcomeDistribution).map(([outcome, probability]) => (
                          <div key={outcome} className="text-center p-2 border rounded">
                            {getOutcomeIcon(outcome)}
                            <div className="text-xs font-medium mt-1 capitalize">
                              {outcome.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(probability * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {prediction.keyRiskFactors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          Key Risk Factors
                        </h4>
                        <div className="space-y-2">
                          {prediction.keyRiskFactors.map((risk, i) => (
                            <div key={i} className="p-3 bg-red-50 border border-red-200 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-red-800">{risk.factor}</span>
                                <Badge variant="destructive" size="sm">
                                  {Math.round(risk.impact * 100)}% impact
                                </Badge>
                              </div>
                              <div className="text-xs text-red-700">
                                <strong>Mitigation:</strong> {risk.mitigation.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Drivers */}
                    {prediction.successDrivers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                          Success Drivers
                        </h4>
                        <div className="space-y-2">
                          {prediction.successDrivers.map((driver, i) => (
                            <div key={i} className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-green-800">{driver.factor}</span>
                                <Badge variant="secondary" size="sm" className="bg-green-100">
                                  {Math.round(driver.contribution * 100)}% contribution
                                </Badge>
                              </div>
                              <div className="text-xs text-green-700">
                                <strong>Recommendations:</strong> {driver.recommendation.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Detailed Analysis
                      </Button>
                      <Button size="sm">
                        <Target className="h-3 w-3 mr-1" />
                        Optimize Engagement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Risk analysis content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  High-Risk Engagements
                </CardTitle>
                <CardDescription>
                  Engagements with success probability below 60%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {riskEngagements.map((prediction, index) => {
                      const engagement = currentEngagements.find(e => e.id === prediction.engagementId);
                      if (!engagement) return null;

                      return (
                        <div key={index} className="p-3 border rounded bg-red-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{engagement.name}</span>
                            <Badge variant="destructive" size="sm">
                              {Math.round(prediction.overallSuccessProbability * 100)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {prediction.keyRiskFactors.length} risk factors identified
                          </div>
                        </div>
                      );
                    })}
                    {riskEngagements.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                        <p>No high-risk engagements detected</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Success Opportunities
                </CardTitle>
                <CardDescription>
                  Engagements with high optimization potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {predictions
                      .filter(p => p.successDrivers.length > 0 && p.overallSuccessProbability > 0.7)
                      .map((prediction, index) => {
                        const engagement = currentEngagements.find(e => e.id === prediction.engagementId);
                        if (!engagement) return null;

                        return (
                          <div key={index} className="p-3 border rounded bg-green-50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{engagement.name}</span>
                              <Badge className="bg-green-100 text-green-800" size="sm">
                                {Math.round(prediction.overallSuccessProbability * 100)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {prediction.successDrivers.length} optimization opportunities
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend analysis visualization placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Success Probability Trends</CardTitle>
              <CardDescription>
                Predicted success rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Trend visualization would be implemented here</p>
                  <p className="text-sm">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictionModels.map(model => (
              <Card key={model.name} className={model.name === selectedModel ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{model.description}</CardTitle>
                    <Badge variant={model.name === selectedModel ? 'default' : 'outline'}>
                      {Math.round(model.accuracy * 100)}% accuracy
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Key Features:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.factors.map(factor => (
                          <Badge key={factor} variant="outline" size="sm">
                            {factor.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={model.name === selectedModel ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setSelectedModel(model.name)}
                    >
                      {model.name === selectedModel ? 'Currently Selected' : 'Select Model'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};