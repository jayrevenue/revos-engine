import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Brain,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Star,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Shuffle,
  Lightbulb,
  Shield
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skillLevel: number; // 1-10
  hourlyRate: number;
  availability: number; // 0-1 (percentage available)
  currentUtilization: number; // 0-1 (percentage currently utilized)
  specialties: string[];
  performanceRating: number; // 1-5
  preferredWorkTypes: string[];
  pastEngagementSuccess: number; // 0-1
  burnoutRisk: number; // 0-1
  learningVelocity: number; // 1-10
}

interface ResourceRequirement {
  role: string;
  skillLevel: number;
  hoursRequired: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date;
  skills: string[];
  workType: string;
}

interface Engagement {
  id: string;
  name: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  budget: number;
  requirements: ResourceRequirement[];
  currentTeam: string[]; // Team member IDs
  expectedROI: number;
  riskLevel: number; // 0-1
  clientTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AllocationRecommendation {
  engagementId: string;
  teamMemberId: string;
  role: string;
  hoursAllocated: number;
  confidence: number; // 0-1
  reasoning: string[];
  expectedImpact: {
    efficiency: number;
    quality: number;
    costOptimization: number;
    riskMitigation: number;
  };
  alternatives: {
    teamMemberId: string;
    confidence: number;
    tradeoffs: string[];
  }[];
}

interface OptimizationInsight {
  type: 'efficiency' | 'cost' | 'quality' | 'capacity' | 'risk';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  potentialSavings?: number;
  implementationEffort: 'low' | 'medium' | 'high';
}

interface SmartResourceAllocatorProps {
  teamMembers: TeamMember[];
  engagements: Engagement[];
  onApplyRecommendation?: (recommendation: AllocationRecommendation) => void;
  onRebalanceTeam?: (engagementId: string, newTeamComposition: string[]) => void;
}

export const SmartResourceAllocator = ({
  teamMembers,
  engagements,
  onApplyRecommendation,
  onRebalanceTeam
}: SmartResourceAllocatorProps) => {
  const { toast } = useToast();
  const [selectedEngagement, setSelectedEngagement] = useState<string>('');
  const [optimizationGoal, setOptimizationGoal] = useState<'balanced' | 'cost' | 'quality' | 'speed'>('balanced');
  const [autoRebalance, setAutoRebalance] = useState(true);
  const [recommendations, setRecommendations] = useState<AllocationRecommendation[]>([]);
  const [insights, setInsights] = useState<OptimizationInsight[]>([]);

  // Advanced AI-powered resource allocation algorithm
  const generateRecommendations = useMemo(() => {
    const newRecommendations: AllocationRecommendation[] = [];
    const newInsights: OptimizationInsight[] = [];

    // Calculate team member efficiency scores
    const calculateEfficiencyScore = (member: TeamMember, requirement: ResourceRequirement) => {
      const skillMatch = Math.min(member.skillLevel / requirement.skillLevel, 1.5); // Cap at 1.5x for overqualification
      const specialtyMatch = requirement.skills.some(skill => 
        member.specialties.some(specialty => 
          specialty.toLowerCase().includes(skill.toLowerCase())
        )
      ) ? 1.2 : 1.0;
      const workTypeMatch = member.preferredWorkTypes.includes(requirement.workType) ? 1.1 : 1.0;
      const availabilityScore = member.availability * (1 - member.currentUtilization);
      const performanceMultiplier = member.performanceRating / 3; // Normalize 1-5 scale
      const burnoutPenalty = 1 - (member.burnoutRisk * 0.3);

      return skillMatch * specialtyMatch * workTypeMatch * availabilityScore * performanceMultiplier * burnoutPenalty;
    };

    // Calculate cost efficiency
    const calculateCostEfficiency = (member: TeamMember, requirement: ResourceRequirement) => {
      const efficiencyScore = calculateEfficiencyScore(member, requirement);
      const costPerHour = member.hourlyRate;
      const expectedHours = requirement.hoursRequired / Math.max(efficiencyScore, 0.5); // Adjust for efficiency
      
      return efficiencyScore / (costPerHour * expectedHours) * 1000; // Normalize scale
    };

    // Generate recommendations for each engagement
    engagements.forEach(engagement => {
      engagement.requirements.forEach(requirement => {
        // Find suitable team members
        const suitablemembers = teamMembers
          .filter(member => 
            member.role === requirement.role && 
            member.skillLevel >= requirement.skillLevel * 0.8 && // Allow slightly underqualified
            member.availability > 0.1 && // Must have some availability
            member.currentUtilization < 0.9 // Not completely overloaded
          )
          .map(member => ({
            member,
            efficiencyScore: calculateEfficiencyScore(member, requirement),
            costEfficiency: calculateCostEfficiency(member, requirement),
            qualityScore: (member.skillLevel / 10) * (member.performanceRating / 5) * member.pastEngagementSuccess
          }))
          .sort((a, b) => {
            // Sort based on optimization goal
            switch (optimizationGoal) {
              case 'cost':
                return b.costEfficiency - a.costEfficiency;
              case 'quality':
                return b.qualityScore - a.qualityScore;
              case 'speed':
                return b.efficiencyScore - a.efficiencyScore;
              default: // balanced
                return (b.efficiencyScore + b.costEfficiency + b.qualityScore) / 3 - 
                       (a.efficiencyScore + a.costEfficiency + a.qualityScore) / 3;
            }
          });

        if (suitablemembers.length > 0) {
          const bestMatch = suitablemembers[0];
          const alternatives = suitablemembers.slice(1, 4).map(alt => ({
            teamMemberId: alt.member.id,
            confidence: Math.min(alt.efficiencyScore / bestMatch.efficiencyScore, 1),
            tradeoffs: [
              alt.costEfficiency < bestMatch.costEfficiency ? 'Higher cost' : 'Lower cost',
              alt.qualityScore < bestMatch.qualityScore ? 'Lower quality' : 'Higher quality',
              alt.member.availability < bestMatch.member.availability ? 'Less available' : 'More available'
            ].filter(Boolean)
          }));

          // Calculate expected impact
          const expectedImpact = {
            efficiency: Math.min(bestMatch.efficiencyScore / 1.5, 1),
            quality: bestMatch.qualityScore,
            costOptimization: Math.min(bestMatch.costEfficiency / 10, 1),
            riskMitigation: 1 - (bestMatch.member.burnoutRisk * engagement.riskLevel)
          };

          // Generate reasoning
          const reasoning = [];
          if (bestMatch.member.skillLevel > requirement.skillLevel * 1.2) {
            reasoning.push(`Highly skilled (${bestMatch.member.skillLevel}/10 vs required ${requirement.skillLevel}/10)`);
          }
          if (bestMatch.member.specialties.some(s => requirement.skills.includes(s))) {
            reasoning.push('Specialty match for required skills');
          }
          if (bestMatch.member.pastEngagementSuccess > 0.8) {
            reasoning.push('Strong track record of successful engagements');
          }
          if (bestMatch.member.currentUtilization < 0.6) {
            reasoning.push('Good availability and capacity');
          }
          if (engagement.clientTier === 'platinum' && bestMatch.member.performanceRating >= 4) {
            reasoning.push('Top performer suitable for premium client');
          }

          newRecommendations.push({
            engagementId: engagement.id,
            teamMemberId: bestMatch.member.id,
            role: requirement.role,
            hoursAllocated: requirement.hoursRequired,
            confidence: Math.min(bestMatch.efficiencyScore, 1),
            reasoning,
            expectedImpact,
            alternatives
          });
        }
      });
    });

    // Generate optimization insights
    
    // Capacity utilization analysis
    const overUtilizedMembers = teamMembers.filter(m => m.currentUtilization > 0.85);
    const underUtilizedMembers = teamMembers.filter(m => m.currentUtilization < 0.4 && m.availability > 0.5);
    
    if (overUtilizedMembers.length > 0) {
      newInsights.push({
        type: 'capacity',
        title: 'Team Members at Risk of Burnout',
        description: `${overUtilizedMembers.length} team members are operating at >85% utilization, increasing burnout risk and potentially impacting quality.`,
        impact: 'high',
        confidence: 0.9,
        recommendations: [
          'Redistribute workload to underutilized team members',
          'Consider hiring additional resources for peak demand',
          'Implement mandatory time-off policies',
          'Review project timelines to reduce pressure'
        ],
        implementationEffort: 'medium'
      });
    }

    if (underUtilizedMembers.length > 0) {
      const potentialHours = underUtilizedMembers.reduce((acc, m) => 
        acc + ((m.availability - m.currentUtilization) * 40), 0); // Assuming 40hr work week
      const avgHourlyRate = underUtilizedMembers.reduce((acc, m) => acc + m.hourlyRate, 0) / underUtilizedMembers.length;
      
      newInsights.push({
        type: 'efficiency',
        title: 'Underutilized Team Capacity',
        description: `${potentialHours.toFixed(0)} hours of available capacity across ${underUtilizedMembers.length} team members could be better utilized.`,
        impact: 'medium',
        confidence: 0.8,
        recommendations: [
          'Assign additional responsibilities to available team members',
          'Cross-train on different engagement types',
          'Develop internal projects or training initiatives',
          'Consider temporary assignments to high-priority engagements'
        ],
        potentialSavings: potentialHours * avgHourlyRate,
        implementationEffort: 'low'
      });
    }

    // Cost optimization analysis
    const highCostLowValue = newRecommendations.filter(r => {
      const member = teamMembers.find(m => m.id === r.teamMemberId);
      return member && member.hourlyRate > 150 && r.expectedImpact.quality < 0.7;
    });

    if (highCostLowValue.length > 0) {
      newInsights.push({
        type: 'cost',
        title: 'Cost-Inefficient Resource Allocation',
        description: `${highCostLowValue.length} recommendations involve high-cost resources on tasks that don't require their expertise level.`,
        impact: 'medium',
        confidence: 0.75,
        recommendations: [
          'Reassign senior resources to high-impact, complex tasks',
          'Utilize mid-level resources for routine work',
          'Implement skill-based pricing model',
          'Create mentorship pairs to develop junior talent'
        ],
        potentialSavings: highCostLowValue.reduce((acc, r) => {
          const member = teamMembers.find(m => m.id === r.teamMemberId)!;
          const juniorRate = member.hourlyRate * 0.7; // Estimate junior rate
          return acc + ((member.hourlyRate - juniorRate) * r.hoursAllocated);
        }, 0),
        implementationEffort: 'medium'
      });
    }

    // Quality risk analysis
    const qualityRisks = newRecommendations.filter(r => 
      r.confidence < 0.6 || r.expectedImpact.quality < 0.6
    );

    if (qualityRisks.length > 0) {
      newInsights.push({
        type: 'quality',
        title: 'Potential Quality Risks Identified',
        description: `${qualityRisks.length} resource allocations have lower confidence scores, potentially impacting delivery quality.`,
        impact: 'high',
        confidence: 0.85,
        recommendations: [
          'Provide additional training or support for assigned resources',
          'Implement peer review processes for critical deliverables',
          'Consider pairing junior resources with senior mentors',
          'Increase quality checkpoints and reviews'
        ],
        implementationEffort: 'medium'
      });
    }

    // Skills gap analysis
    const skillGaps: { [key: string]: number } = {};
    engagements.forEach(engagement => {
      engagement.requirements.forEach(req => {
        req.skills.forEach(skill => {
          const availableSkillLevel = Math.max(...teamMembers
            .filter(m => m.specialties.includes(skill))
            .map(m => m.skillLevel), 0);
          if (availableSkillLevel < req.skillLevel) {
            skillGaps[skill] = (skillGaps[skill] || 0) + 1;
          }
        });
      });
    });

    if (Object.keys(skillGaps).length > 0) {
      const topGaps = Object.entries(skillGaps)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      newInsights.push({
        type: 'risk',
        title: 'Critical Skills Gaps Detected',
        description: `Skills gaps identified in ${Object.keys(skillGaps).length} areas, with highest demand for ${topGaps.map(([skill]) => skill).join(', ')}.`,
        impact: 'high',
        confidence: 0.9,
        recommendations: [
          'Prioritize training programs for high-demand skills',
          'Consider hiring specialists in gap areas',
          'Develop partnerships with external consultants',
          'Create skill development incentive programs'
        ],
        implementationEffort: 'high'
      });
    }

    return { recommendations: newRecommendations, insights: newInsights };
  }, [teamMembers, engagements, optimizationGoal]);

  useEffect(() => {
    const { recommendations: newRecommendations, insights: newInsights } = generateRecommendations;
    setRecommendations(newRecommendations);
    setInsights(newInsights);
  }, [generateRecommendations]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 0.85) return 'text-red-600 bg-red-100';
    if (utilization > 0.7) return 'text-yellow-600 bg-yellow-100';
    if (utilization > 0.4) return 'text-green-600 bg-green-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getImpactIcon = (type: OptimizationInsight['type']) => {
    switch (type) {
      case 'efficiency': return <Zap className="h-4 w-4 text-blue-600" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'quality': return <Award className="h-4 w-4 text-purple-600" />;
      case 'capacity': return <Users className="h-4 w-4 text-orange-600" />;
      case 'risk': return <Shield className="h-4 w-4 text-red-600" />;
    }
  };

  const totalPotentialSavings = insights
    .filter(i => i.potentialSavings)
    .reduce((acc, i) => acc + (i.potentialSavings || 0), 0);

  const avgConfidence = recommendations.length > 0 
    ? recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Resource Allocator</h2>
          <p className="text-muted-foreground">
            AI-powered resource optimization and allocation recommendations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-rebalance">Auto Rebalance</Label>
            <Switch
              id="auto-rebalance"
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
          </div>
          <Badge variant="outline">
            {recommendations.length} Recommendations
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teamMembers.reduce((acc, m) => acc + m.currentUtilization, 0) / teamMembers.length * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across {teamMembers.length} members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recommendation Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(avgConfidence * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI confidence score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPotentialSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From optimization insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Optimization Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              Generated recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Goal</CardTitle>
          <CardDescription>
            Adjust the AI's optimization strategy based on your priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { key: 'balanced', label: 'Balanced', description: 'Optimal mix of cost, quality, and speed' },
              { key: 'cost', label: 'Cost Optimization', description: 'Minimize resource costs' },
              { key: 'quality', label: 'Quality Focus', description: 'Maximize deliverable quality' },
              { key: 'speed', label: 'Speed Priority', description: 'Fastest delivery times' }
            ].map((goal) => (
              <Button
                key={goal.key}
                variant={optimizationGoal === goal.key ? "default" : "outline"}
                className="h-auto p-4 flex-col items-start"
                onClick={() => setOptimizationGoal(goal.key as any)}
              >
                <div className="font-medium">{goal.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{goal.description}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="team">Team Overview</TabsTrigger>
          <TabsTrigger value="workload">Workload Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((recommendation, index) => {
              const member = teamMembers.find(m => m.id === recommendation.teamMemberId);
              const engagement = engagements.find(e => e.id === recommendation.engagementId);
              
              if (!member || !engagement) return null;

              return (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {member.name} → {engagement.name}
                        </CardTitle>
                        <CardDescription>
                          {recommendation.role} • {recommendation.hoursAllocated} hours
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {Math.round(recommendation.confidence * 100)}% confidence
                        </Badge>
                        <Badge className={getUtilizationColor(member.currentUtilization)}>
                          {Math.round(member.currentUtilization * 100)}% utilized
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                        <div className="text-lg font-medium">
                          {Math.round(recommendation.expectedImpact.efficiency * 100)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Quality</div>
                        <div className="text-lg font-medium">
                          {Math.round(recommendation.expectedImpact.quality * 100)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Cost Opt.</div>
                        <div className="text-lg font-medium">
                          {Math.round(recommendation.expectedImpact.costOptimization * 100)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Risk Mit.</div>
                        <div className="text-lg font-medium">
                          {Math.round(recommendation.expectedImpact.riskMitigation * 100)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">AI Reasoning:</h4>
                      <ul className="space-y-1">
                        {recommendation.reasoning.map((reason, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {recommendation.alternatives.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Alternative Options:</h4>
                        <div className="space-y-2">
                          {recommendation.alternatives.slice(0, 2).map((alt, i) => {
                            const altMember = teamMembers.find(m => m.id === alt.teamMemberId);
                            if (!altMember) return null;

                            return (
                              <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{altMember.name}</span>
                                  <Badge variant="outline" size="sm">
                                    {Math.round(alt.confidence * 100)}%
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {alt.tradeoffs.join(', ')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          onApplyRecommendation?.(recommendation);
                          toast({
                            title: "Recommendation Applied",
                            description: `${member.name} assigned to ${engagement.name}`,
                          });
                        }}
                      >
                        Apply Recommendation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(insight.type)}
                      <CardTitle>{insight.title}</CardTitle>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 
                        insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                      {insight.potentialSavings && (
                        <Badge variant="outline" className="text-green-600">
                          ${insight.potentialSavings.toLocaleString()} savings
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Implementation Effort:</span> {insight.implementationEffort}
                      </div>
                      <div>
                        <span className="font-medium">Impact Level:</span> {insight.impact}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Recommendations:
                      </h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <Card key={member.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < member.performanceRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Utilization</span>
                      <span>{Math.round(member.currentUtilization * 100)}%</span>
                    </div>
                    <Progress value={member.currentUtilization * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Availability</span>
                      <span>{Math.round(member.availability * 100)}%</span>
                    </div>
                    <Progress value={member.availability * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Skill Level:</span>
                      <div className="font-medium">{member.skillLevel}/10</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hourly Rate:</span>
                      <div className="font-medium">${member.hourlyRate}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Specialties:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 3).map(specialty => (
                        <Badge key={specialty} variant="outline" size="sm">
                          {specialty}
                        </Badge>
                      ))}
                      {member.specialties.length > 3 && (
                        <Badge variant="outline" size="sm">
                          +{member.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {member.burnoutRisk > 0.5 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Elevated burnout risk - consider workload adjustment
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          {/* Workload distribution chart and analysis would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution Analysis</CardTitle>
              <CardDescription>
                Visual representation of team capacity and allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Workload visualization would be implemented here</p>
                  <p className="text-sm">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};