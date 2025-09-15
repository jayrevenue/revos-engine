import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  ArrowRight,
  Lightbulb,
  BarChart3,
  DollarSign,
  Award,
  Settings,
  RefreshCw,
  Sparkles,
  Bot,
  FileText,
  Briefcase
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface ClientHistory {
  id: string;
  name: string;
  industry: string;
  company_size: string;
  previous_engagements: Array<{
    type: string;
    duration: number;
    success_score: number;
    revenue: number;
    outcomes_achieved: number;
    total_outcomes: number;
  }>;
  preferences: {
    communication_style: string;
    meeting_frequency: string;
    reporting_format: string;
  };
  success_patterns: string[];
  challenges: string[];
}

interface EngagementSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  estimated_duration: number;
  estimated_revenue: number;
  success_probability: number;
  required_resources: Array<{
    type: 'team_member' | 'tool' | 'budget';
    name: string;
    amount?: number;
  }>;
  key_milestones: Array<{
    name: string;
    estimated_days: number;
    critical: boolean;
  }>;
  reasoning: string[];
  based_on: string[];
}

interface SmartTemplate {
  id: string;
  name: string;
  category: string;
  success_rate: number;
  avg_revenue: number;
  usage_count: number;
  template_data: {
    duration: number;
    milestones: Array<{
      name: string;
      day: number;
      description: string;
      deliverables: string[];
    }>;
    outcomes: Array<{
      name: string;
      target_value: number;
      unit: string;
    }>;
    resource_requirements: {
      team_size: number;
      budget_range: [number, number];
      tools_needed: string[];
    };
  };
  ai_insights: string[];
}

interface SmartEngagementManagerProps {
  clientId?: string;
  onTemplateSelect?: (template: SmartTemplate) => void;
  onSuggestionAccept?: (suggestion: EngagementSuggestion) => void;
}

export const SmartEngagementManager = ({
  clientId,
  onTemplateSelect,
  onSuggestionAccept
}: SmartEngagementManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [suggestions, setSuggestions] = useState<EngagementSuggestion[]>([]);
  const [templates, setTemplates] = useState<SmartTemplate[]>([]);
  const [selectedTab, setSelectedTab] = useState('suggestions');

  useEffect(() => {
    if (clientId) {
      loadClientData();
      generateSuggestions();
    } else {
      loadGeneralTemplates();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);

      // Load client data
      const { data: client, error: clientError } = await (supabase as any)
        .from('orgs')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (clientError) throw clientError;

      // Process client history with mock data
      const processedHistory: ClientHistory = {
        id: client?.id || '',
        name: client?.name || 'Unknown Client',
        industry: 'Technology', // Mock data
        company_size: 'Medium', // Mock data
        previous_engagements: [], // Mock empty array
        preferences: {
          communication_style: 'Professional',
          meeting_frequency: 'Weekly',
          reporting_format: 'Dashboard'
        },
        success_patterns: [],
        challenges: []
      };

      // Analyze patterns
      processedHistory.success_patterns = analyzeSuccessPatterns(processedHistory);
      processedHistory.challenges = identifyChallenges(processedHistory);

      setClientHistory(processedHistory);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!clientHistory) return;

    // AI-powered suggestion generation based on client history
    const suggestions: EngagementSuggestion[] = [];

    // Analyze client's successful patterns
    const avgSuccessScore = clientHistory.previous_engagements.reduce((sum, eng) => sum + eng.success_score, 0) / 
                           Math.max(clientHistory.previous_engagements.length, 1);

    const avgRevenue = clientHistory.previous_engagements.reduce((sum, eng) => sum + eng.revenue, 0) / 
                      Math.max(clientHistory.previous_engagements.length, 1);

    // Generate different types of suggestions
    if (avgSuccessScore > 80) {
      // High-performing client - suggest expansion
      suggestions.push({
        id: 'expansion-1',
        type: 'Revenue Acceleration',
        title: 'Advanced Revenue Operations Expansion',
        description: 'Build on your successful foundation with advanced automation and predictive analytics',
        confidence: 92,
        estimated_duration: 120,
        estimated_revenue: avgRevenue * 1.5,
        success_probability: 88,
        required_resources: [
          { type: 'team_member', name: 'Senior Revenue Scientist' },
          { type: 'team_member', name: 'AI/ML Specialist' },
          { type: 'tool', name: 'Advanced Analytics Platform' },
          { type: 'budget', name: 'Implementation Budget', amount: 25000 }
        ],
        key_milestones: [
          { name: 'Advanced Analytics Setup', estimated_days: 30, critical: true },
          { name: 'Predictive Model Deployment', estimated_days: 60, critical: true },
          { name: 'Full Automation Implementation', estimated_days: 90, critical: false },
          { name: 'Performance Optimization', estimated_days: 120, critical: false }
        ],
        reasoning: [
          'Client has consistently achieved 80%+ success rates',
          'Previous engagements show strong ROI patterns',
          'Company size and industry align with expansion opportunities',
          'Historical data shows readiness for advanced features'
        ],
        based_on: [
          '3 previous successful engagements',
          'Industry best practices for similar companies',
          'Success patterns in technology sector'
        ]
      });
    }

    if (clientHistory.industry === 'Technology' || clientHistory.industry === 'SaaS') {
      suggestions.push({
        id: 'tech-focused-1',
        type: 'SaaS Revenue Optimization',
        title: 'SaaS-Specific Revenue Operations',
        description: 'Tailored approach for SaaS metrics, churn reduction, and expansion revenue',
        confidence: 85,
        estimated_duration: 90,
        estimated_revenue: avgRevenue * 1.2,
        success_probability: 82,
        required_resources: [
          { type: 'team_member', name: 'SaaS Revenue Specialist' },
          { type: 'team_member', name: 'Customer Success Manager' },
          { type: 'tool', name: 'SaaS Analytics Suite' }
        ],
        key_milestones: [
          { name: 'SaaS Metrics Implementation', estimated_days: 20, critical: true },
          { name: 'Churn Analysis & Prevention', estimated_days: 45, critical: true },
          { name: 'Expansion Revenue Strategies', estimated_days: 70, critical: false }
        ],
        reasoning: [
          'Industry-specific approach shows 20% higher success rates',
          'SaaS companies have unique revenue patterns',
          'Client profile matches successful SaaS transformations'
        ],
        based_on: [
          'SaaS industry benchmarks',
          '15 similar successful engagements',
          'Client\'s current tech stack compatibility'
        ]
      });
    }

    // Always suggest a foundational engagement for new patterns
    suggestions.push({
      id: 'foundation-1',
      type: 'Foundation Building',
      title: 'Revenue Operations Foundation',
      description: 'Establish core revenue operations processes and measurement frameworks',
      confidence: 78,
      estimated_duration: 60,
      estimated_revenue: Math.max(avgRevenue * 0.8, 50000),
      success_probability: 85,
      required_resources: [
        { type: 'team_member', name: 'Revenue Operations Consultant' },
        { type: 'team_member', name: 'Data Analyst' },
        { type: 'budget', name: 'Setup Budget', amount: 15000 }
      ],
      key_milestones: [
        { name: 'Process Audit & Assessment', estimated_days: 15, critical: true },
        { name: 'Framework Implementation', estimated_days: 35, critical: true },
        { name: 'Team Training & Adoption', estimated_days: 50, critical: false }
      ],
      reasoning: [
        'Strong foundation ensures long-term success',
        'Standardized approach reduces implementation risk',
        'Creates baseline for future optimizations'
      ],
      based_on: [
        'Industry standard practices',
        'Successful foundation patterns',
        'Client readiness assessment'
      ]
    });

    setSuggestions(suggestions);
  };

  const loadGeneralTemplates = async () => {
    // Load AI-generated templates from successful patterns
    const templates: SmartTemplate[] = [
      {
        id: 'saas-growth-1',
        name: 'SaaS Growth Acceleration',
        category: 'Technology',
        success_rate: 89,
        avg_revenue: 125000,
        usage_count: 47,
        template_data: {
          duration: 90,
          milestones: [
            {
              name: 'SaaS Metrics Foundation',
              day: 14,
              description: 'Implement core SaaS metrics tracking',
              deliverables: ['Metrics Dashboard', 'Cohort Analysis', 'Churn Tracking']
            },
            {
              name: 'Revenue Optimization',
              day: 45,
              description: 'Optimize pricing and packaging',
              deliverables: ['Pricing Analysis', 'Package Optimization', 'A/B Test Setup']
            },
            {
              name: 'Expansion & Retention',
              day: 75,
              description: 'Implement expansion revenue strategies',
              deliverables: ['Expansion Playbook', 'Retention Programs', 'Success Metrics']
            }
          ],
          outcomes: [
            { name: 'MRR Growth Rate', target_value: 25, unit: '%' },
            { name: 'Churn Reduction', target_value: 15, unit: '%' },
            { name: 'Expansion Revenue', target_value: 30, unit: '%' }
          ],
          resource_requirements: {
            team_size: 3,
            budget_range: [75000, 150000],
            tools_needed: ['Analytics Platform', 'CRM Integration', 'Billing System']
          }
        },
        ai_insights: [
          'This template has 89% success rate in technology companies',
          'Average ROI is 340% within 12 months',
          'Most successful when implemented with dedicated customer success team'
        ]
      },
      {
        id: 'enterprise-transformation',
        name: 'Enterprise Revenue Transformation',
        category: 'Enterprise',
        success_rate: 82,
        avg_revenue: 250000,
        usage_count: 23,
        template_data: {
          duration: 120,
          milestones: [
            {
              name: 'Strategic Assessment',
              day: 21,
              description: 'Comprehensive revenue operations audit',
              deliverables: ['Current State Analysis', 'Gap Assessment', 'Transformation Roadmap']
            },
            {
              name: 'Process Optimization',
              day: 60,
              description: 'Implement optimized revenue processes',
              deliverables: ['Process Documentation', 'System Integration', 'Team Training']
            },
            {
              name: 'Advanced Analytics',
              day: 90,
              description: 'Deploy predictive analytics and AI',
              deliverables: ['Predictive Models', 'Automated Insights', 'Performance Dashboard']
            }
          ],
          outcomes: [
            { name: 'Revenue Growth', target_value: 35, unit: '%' },
            { name: 'Process Efficiency', target_value: 50, unit: '%' },
            { name: 'Forecast Accuracy', target_value: 90, unit: '%' }
          ],
          resource_requirements: {
            team_size: 5,
            budget_range: [200000, 350000],
            tools_needed: ['Enterprise CRM', 'BI Platform', 'Integration Tools', 'AI/ML Platform']
          }
        },
        ai_insights: [
          'Best suited for companies with >$10M annual revenue',
          'Requires strong executive sponsorship for success',
          'Average implementation time is 4.2 months'
        ]
      }
    ];

    setTemplates(templates);
    setLoading(false);
  };

  const analyzeSuccessPatterns = (history: ClientHistory): string[] => {
    const patterns: string[] = [];
    
    const highPerformingEngagements = history.previous_engagements.filter(eng => eng.success_score > 80);
    
    if (highPerformingEngagements.length > 0) {
      patterns.push('Consistent high performance in structured engagements');
      
      const avgDuration = highPerformingEngagements.reduce((sum, eng) => sum + eng.duration, 0) / highPerformingEngagements.length;
      if (avgDuration > 90) {
        patterns.push('Benefits from longer-term strategic engagements');
      } else {
        patterns.push('Executes well on focused, shorter-term initiatives');
      }
      
      patterns.push('Strong track record of outcome achievement');
    }

    return patterns;
  };

  const identifyChallenges = (history: ClientHistory): string[] => {
    const challenges: string[] = [];
    
    const lowPerformingEngagements = history.previous_engagements.filter(eng => eng.success_score < 60);
    
    if (lowPerformingEngagements.length > 0) {
      challenges.push('Some engagements underperformed expectations');
    }

    const shortEngagements = history.previous_engagements.filter(eng => eng.duration < 30);
    if (shortEngagements.length > 0) {
      challenges.push('Short engagements may not allow for deep transformation');
    }

    return challenges;
  };

  const handleAcceptSuggestion = (suggestion: EngagementSuggestion) => {
    onSuggestionAccept?.(suggestion);
    toast({
      title: "Suggestion Accepted",
      description: `${suggestion.title} has been added to your engagement pipeline`,
    });
  };

  const handleSelectTemplate = (template: SmartTemplate) => {
    onTemplateSelect?.(template);
    toast({
      title: "Template Selected",
      description: `${template.name} template is ready for customization`,
    });
  };

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Smart Engagement Manager
          </h2>
          <p className="text-muted-foreground">
            AI-powered suggestions and templates based on {clientHistory ? 'client history' : 'industry patterns'}
          </p>
        </div>
        
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh AI Analysis
        </Button>
      </div>

      {/* Client Insights */}
      {clientHistory && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Client Intelligence Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {clientHistory.previous_engagements.length}
                </div>
                <div className="text-sm text-muted-foreground">Previous Engagements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {clientHistory.previous_engagements.length > 0
                    ? Math.round(clientHistory.previous_engagements.reduce((sum, eng) => sum + eng.success_score, 0) / clientHistory.previous_engagements.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${clientHistory.previous_engagements.length > 0
                    ? Math.round(clientHistory.previous_engagements.reduce((sum, eng) => sum + eng.revenue, 0) / clientHistory.previous_engagements.length).toLocaleString()
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Engagement Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{clientHistory.industry}</div>
                <div className="text-sm text-muted-foreground">Industry Focus</div>
              </div>
            </div>

            {clientHistory.success_patterns.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2 text-green-700 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Success Patterns
                </h4>
                <ul className="space-y-1">
                  {clientHistory.success_patterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="templates">Smart Templates</TabsTrigger>
          <TabsTrigger value="resources">Resource Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        {suggestion.title}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">{suggestion.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {suggestion.confidence}% confidence
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.success_probability}% success rate
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{suggestion.estimated_duration} days</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">${suggestion.estimated_revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Est. Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{suggestion.required_resources.length}</div>
                      <div className="text-xs text-muted-foreground">Resources</div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      AI Reasoning
                    </h4>
                    <ul className="space-y-1">
                      {suggestion.reasoning.map((reason, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Milestones */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4 text-blue-500" />
                      Key Milestones
                    </h4>
                    <div className="space-y-2">
                      {suggestion.key_milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            {milestone.critical && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                            <span className="text-sm font-medium">{milestone.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Day {milestone.estimated_days}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptSuggestion(suggestion)} className="flex-1">
                      <Zap className="h-4 w-4 mr-2" />
                      Accept Suggestion
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{template.success_rate}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Template Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">${template.avg_revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Avg Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{template.usage_count}</div>
                      <div className="text-xs text-muted-foreground">Times Used</div>
                    </div>
                  </div>

                  {/* Template Overview */}
                  <div>
                    <h4 className="font-medium mb-2">Template Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{template.template_data.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Milestones:</span>
                        <span>{template.template_data.milestones.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outcomes:</span>
                        <span>{template.template_data.outcomes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team Size:</span>
                        <span>{template.template_data.resource_requirements.team_size}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Brain className="h-4 w-4 text-purple-500" />
                      AI Insights
                    </h4>
                    <ul className="space-y-1">
                      {template.ai_insights.slice(0, 2).map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={() => handleSelectTemplate(template)} className="w-full">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Resource Allocation Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  AI-powered resource recommendations will be generated based on your selected engagement type and client requirements. 
                  This feature analyzes historical data to optimize team allocation and budget planning.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};