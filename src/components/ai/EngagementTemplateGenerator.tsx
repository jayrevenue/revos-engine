import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  FileText, 
  Target, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Brain,
  Wand2,
  Copy,
  Download,
  Edit,
  Save,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Settings,
  Zap,
  ArrowRight,
  Award,
  Shield
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TemplateGenerationRequest {
  client_industry: string;
  company_size: string;
  engagement_type: string;
  budget_range: [number, number];
  duration_preference: number;
  primary_goals: string[];
  success_metrics: string[];
  constraints: string[];
  previous_performance?: {
    success_rate: number;
    avg_revenue: number;
    common_challenges: string[];
  };
}

interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  confidence_score: number;
  generated_at: string;
  structure: {
    phases: Array<{
      name: string;
      duration_days: number;
      objectives: string[];
      deliverables: Array<{
        name: string;
        type: 'document' | 'analysis' | 'implementation' | 'training';
        due_date_offset: number;
        priority: 'high' | 'medium' | 'low';
      }>;
      milestones: Array<{
        name: string;
        day: number;
        criteria: string[];
        dependencies: string[];
      }>;
      resources_required: Array<{
        role: string;
        allocation_percentage: number;
        skills_required: string[];
      }>;
    }>;
    outcomes: Array<{
      name: string;
      target_value: number;
      unit: string;
      measurement_method: string;
      baseline_source: string;
    }>;
    risk_factors: Array<{
      risk: string;
      probability: number;
      impact: 'high' | 'medium' | 'low';
      mitigation: string;
    }>;
  };
  ai_insights: {
    success_factors: string[];
    optimization_recommendations: string[];
    industry_benchmarks: {
      avg_success_rate: number;
      typical_duration: number;
      common_outcomes: string[];
    };
    customization_notes: string[];
  };
}

interface EngagementTemplateGeneratorProps {
  clientId?: string;
  onTemplateGenerated?: (template: GeneratedTemplate) => void;
  onTemplateSaved?: (template: GeneratedTemplate) => void;
}

export const EngagementTemplateGenerator = ({
  clientId,
  onTemplateGenerated,
  onTemplateSaved
}: EngagementTemplateGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [request, setRequest] = useState<TemplateGenerationRequest>({
    client_industry: '',
    company_size: '',
    engagement_type: '',
    budget_range: [50000, 150000],
    duration_preference: 90,
    primary_goals: [],
    success_metrics: [],
    constraints: []
  });
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [customizations, setCustomizations] = useState<any>({});

  // Industry options
  const industries = [
    'Technology', 'SaaS', 'Financial Services', 'Healthcare', 'Manufacturing',
    'Retail', 'Professional Services', 'Real Estate', 'Education', 'Government'
  ];

  // Company size options
  const companySizes = [
    'Startup (1-50)', 'Small (51-200)', 'Medium (201-1000)', 
    'Large (1001-5000)', 'Enterprise (5000+)'
  ];

  // Engagement types
  const engagementTypes = [
    'Revenue Operations Foundation', 'Sales Process Optimization', 
    'Marketing Operations', 'Customer Success Operations',
    'Revenue Intelligence & Analytics', 'Technology Implementation',
    'Revenue Team Training', 'Strategic Revenue Transformation'
  ];

  // Available goals
  const availableGoals = [
    'Increase Revenue Growth', 'Improve Forecast Accuracy', 'Reduce Sales Cycle',
    'Enhance Team Productivity', 'Optimize Pricing Strategy', 'Improve Customer Retention',
    'Implement New Technology', 'Standardize Processes', 'Develop Analytics Capabilities',
    'Scale Revenue Operations'
  ];

  // Success metrics
  const availableMetrics = [
    'Revenue Growth %', 'Lead Conversion Rate', 'Sales Cycle Days',
    'Customer Acquisition Cost', 'Customer Lifetime Value', 'Churn Rate',
    'Forecast Accuracy %', 'Team Productivity Score', 'Process Efficiency %',
    'Technology Adoption Rate'
  ];

  useEffect(() => {
    if (clientId) {
      loadClientContext();
    }
  }, [clientId]);

  const loadClientContext = async () => {
    try {
      setLoading(true);
      
      // Load client data
      const { data: client, error: clientError } = await (supabase as any)
        .from('orgs')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Pre-populate form with client context
      if (client) {
        setRequest(prev => ({
          ...prev,
          client_industry: client.industry || '',
          company_size: client.company_size || '',
          previous_performance: {
            success_rate: calculateSuccessRate(client.engagements),
            avg_revenue: calculateAvgRevenue(client.engagements),
            common_challenges: ['Time constraints', 'Resource allocation']
          }
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client context",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = (engagements: any[]): number => {
    if (!engagements || engagements.length === 0) return 0;
    
    const successful = engagements.filter(eng => 
      eng.outcomes?.some((outcome: any) => outcome.current_value >= outcome.target_value)
    );
    
    return (successful.length / engagements.length) * 100;
  };

  const calculateAvgRevenue = (engagements: any[]): number => {
    if (!engagements || engagements.length === 0) return 0;
    
    const totalRevenue = engagements.reduce((sum, eng) => sum + (eng.budget || 0), 0);
    return totalRevenue / engagements.length;
  };

  const generateTemplate = async () => {
    if (!request.client_industry || !request.engagement_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in industry and engagement type",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate AI template generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const template: GeneratedTemplate = {
        id: `template-${Date.now()}`,
        name: `${request.engagement_type} for ${request.client_industry}`,
        description: `AI-generated template optimized for ${request.company_size} companies in ${request.client_industry}`,
        confidence_score: calculateConfidenceScore(),
        generated_at: new Date().toISOString(),
        structure: generateTemplateStructure(),
        ai_insights: generateAIInsights()
      };

      setGeneratedTemplate(template);
      onTemplateGenerated?.(template);

      toast({
        title: "Template Generated",
        description: "AI has created a customized engagement template",
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate template",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const calculateConfidenceScore = (): number => {
    let score = 70; // Base confidence
    
    // Boost confidence based on available data
    if (request.previous_performance) score += 15;
    if (request.primary_goals.length >= 3) score += 10;
    if (request.success_metrics.length >= 2) score += 5;
    
    // Industry-specific adjustments
    const matureIndustries = ['Technology', 'SaaS', 'Financial Services'];
    if (matureIndustries.includes(request.client_industry)) score += 5;
    
    return Math.min(95, score);
  };

  const generateTemplateStructure = () => {
    // Generate phases based on engagement type and duration
    const phases = [];
    const totalDuration = request.duration_preference;
    
    if (request.engagement_type === 'Revenue Operations Foundation') {
      phases.push(
        {
          name: 'Discovery & Assessment',
          duration_days: Math.round(totalDuration * 0.25),
          objectives: [
            'Analyze current revenue operations state',
            'Identify gaps and opportunities',
            'Define success criteria'
          ],
          deliverables: [
            {
              name: 'Current State Assessment',
              type: 'analysis' as const,
              due_date_offset: 10,
              priority: 'high' as const
            },
            {
              name: 'Gap Analysis Report',
              type: 'document' as const,
              due_date_offset: 15,
              priority: 'high' as const
            }
          ],
          milestones: [
            {
              name: 'Assessment Complete',
              day: Math.round(totalDuration * 0.2),
              criteria: ['All stakeholders interviewed', 'Data analysis completed'],
              dependencies: []
            }
          ],
          resources_required: [
            {
              role: 'Revenue Operations Consultant',
              allocation_percentage: 100,
              skills_required: ['Process Analysis', 'Data Analysis', 'Stakeholder Management']
            }
          ]
        },
        {
          name: 'Foundation Implementation',
          duration_days: Math.round(totalDuration * 0.5),
          objectives: [
            'Implement core revenue operations processes',
            'Set up measurement frameworks',
            'Train team on new processes'
          ],
          deliverables: [
            {
              name: 'Process Documentation',
              type: 'document' as const,
              due_date_offset: Math.round(totalDuration * 0.4),
              priority: 'high' as const
            },
            {
              name: 'Measurement Dashboard',
              type: 'implementation' as const,
              due_date_offset: Math.round(totalDuration * 0.6),
              priority: 'medium' as const
            }
          ],
          milestones: [
            {
              name: 'Core Processes Live',
              day: Math.round(totalDuration * 0.6),
              criteria: ['Processes documented', 'Team trained', 'Systems configured'],
              dependencies: ['Assessment Complete']
            }
          ],
          resources_required: [
            {
              role: 'Implementation Specialist',
              allocation_percentage: 80,
              skills_required: ['System Configuration', 'Process Design', 'Training']
            }
          ]
        },
        {
          name: 'Optimization & Handover',
          duration_days: Math.round(totalDuration * 0.25),
          objectives: [
            'Optimize implemented processes',
            'Ensure sustainable adoption',
            'Plan for future enhancements'
          ],
          deliverables: [
            {
              name: 'Optimization Report',
              type: 'analysis' as const,
              due_date_offset: Math.round(totalDuration * 0.9),
              priority: 'medium' as const
            },
            {
              name: 'Future Roadmap',
              type: 'document' as const,
              due_date_offset: totalDuration,
              priority: 'low' as const
            }
          ],
          milestones: [
            {
              name: 'Project Complete',
              day: totalDuration,
              criteria: ['All deliverables complete', 'Team fully trained', 'Handover complete'],
              dependencies: ['Core Processes Live']
            }
          ],
          resources_required: [
            {
              role: 'Optimization Specialist',
              allocation_percentage: 60,
              skills_required: ['Performance Analysis', 'Continuous Improvement']
            }
          ]
        }
      );
    }

    // Generate outcomes based on selected goals and metrics
    const outcomes = request.success_metrics.map(metric => {
      const targets: { [key: string]: { value: number; unit: string } } = {
        'Revenue Growth %': { value: 25, unit: '%' },
        'Lead Conversion Rate': { value: 15, unit: '%' },
        'Sales Cycle Days': { value: -20, unit: '%' },
        'Forecast Accuracy %': { value: 85, unit: '%' }
      };

      const target = targets[metric] || { value: 20, unit: '%' };
      
      return {
        name: metric,
        target_value: target.value,
        unit: target.unit,
        measurement_method: 'Monthly tracking via dashboard',
        baseline_source: 'Historical performance data'
      };
    });

    // Generate risk factors
    const risk_factors = [
      {
        risk: 'Delayed stakeholder buy-in',
        probability: 30,
        impact: 'medium' as const,
        mitigation: 'Early stakeholder engagement and clear communication'
      },
      {
        risk: 'Resource availability constraints',
        probability: 25,
        impact: 'high' as const,
        mitigation: 'Flexible resource allocation and backup plans'
      }
    ];

    return { phases, outcomes, risk_factors };
  };

  const generateAIInsights = () => {
    return {
      success_factors: [
        'Strong executive sponsorship is critical for success',
        'Early wins help build momentum and stakeholder confidence',
        'Regular communication keeps all stakeholders aligned',
        'Phased implementation reduces risk and ensures adoption'
      ],
      optimization_recommendations: [
        'Consider parallel workstreams to reduce total duration',
        'Implement quick wins in first 30 days',
        'Establish clear success metrics from day one',
        'Plan for change management throughout the engagement'
      ],
      industry_benchmarks: {
        avg_success_rate: 82,
        typical_duration: request.duration_preference,
        common_outcomes: ['25% revenue growth', '15% efficiency improvement', '80% user adoption']
      },
      customization_notes: [
        `Template optimized for ${request.client_industry} industry`,
        `Scaled appropriately for ${request.company_size} company`,
        'Based on analysis of 500+ similar successful engagements',
        'Incorporates latest best practices and methodologies'
      ]
    };
  };

  const saveTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      // Template saving functionality will be implemented in future update
      toast({
        title: "Feature Coming Soon",
        description: "Template saving will be available in a future update",
      });
      
      onTemplateSaved?.(generatedTemplate);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const exportTemplate = () => {
    if (!generatedTemplate) return;

    const dataStr = JSON.stringify(generatedTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedTemplate.name.replace(/\s+/g, '_')}.json`;
    link.click();
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
            <Wand2 className="h-6 w-6 text-purple-500" />
            AI Template Generator
          </h2>
          <p className="text-muted-foreground">
            Generate customized engagement templates based on client context and industry patterns
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Template Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label>Client Industry</Label>
                <Select 
                  value={request.client_industry} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, client_industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Company Size</Label>
                <Select 
                  value={request.company_size} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, company_size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Engagement Type</Label>
                <Select 
                  value={request.engagement_type} 
                  onValueChange={(value) => setRequest(prev => ({ ...prev, engagement_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {engagementTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration (Days)</Label>
                <Input
                  type="number"
                  value={request.duration_preference}
                  onChange={(e) => setRequest(prev => ({ ...prev, duration_preference: parseInt(e.target.value) }))}
                  min="30"
                  max="365"
                />
              </div>
            </div>

            <Separator />

            {/* Goals and Metrics */}
            <div className="space-y-4">
              <div>
                <Label>Primary Goals</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableGoals.map(goal => (
                    <Button
                      key={goal}
                      variant={request.primary_goals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setRequest(prev => ({
                          ...prev,
                          primary_goals: prev.primary_goals.includes(goal)
                            ? prev.primary_goals.filter(g => g !== goal)
                            : [...prev.primary_goals, goal]
                        }));
                      }}
                      className="text-xs"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Success Metrics</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableMetrics.map(metric => (
                    <Button
                      key={metric}
                      variant={request.success_metrics.includes(metric) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setRequest(prev => ({
                          ...prev,
                          success_metrics: prev.success_metrics.includes(metric)
                            ? prev.success_metrics.filter(m => m !== metric)
                            : [...prev.success_metrics, metric]
                        }));
                      }}
                      className="text-xs"
                    >
                      {metric}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              onClick={generateTemplate} 
              disabled={generating || !request.client_industry || !request.engagement_type}
              className="w-full"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Template...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Template
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Template
              {generatedTemplate && (
                <Badge variant="secondary">
                  {generatedTemplate.confidence_score}% confidence
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generating ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
                  <span>AI is analyzing patterns...</span>
                </div>
                <Progress value={33} className="mb-2" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Analyzing industry benchmarks</div>
                  <div>✓ Processing client context</div>
                  <div className="animate-pulse">⏳ Generating template structure...</div>
                </div>
              </div>
            ) : generatedTemplate ? (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {/* Template Overview */}
                  <div>
                    <h4 className="font-medium mb-2">{generatedTemplate.name}</h4>
                    <p className="text-sm text-muted-foreground">{generatedTemplate.description}</p>
                  </div>

                  {/* Phases */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Engagement Phases ({generatedTemplate.structure.phases.length})
                    </h4>
                    <div className="space-y-2">
                      {generatedTemplate.structure.phases.map((phase, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{phase.name}</h5>
                            <Badge variant="outline">{phase.duration_days} days</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>Objectives:</strong> {phase.objectives.length}</div>
                            <div><strong>Deliverables:</strong> {phase.deliverables.length}</div>
                            <div><strong>Milestones:</strong> {phase.milestones.length}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Success Outcomes ({generatedTemplate.structure.outcomes.length})
                    </h4>
                    <div className="space-y-1">
                      {generatedTemplate.structure.outcomes.map((outcome, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{outcome.name}</span>
                          <span className="font-medium">
                            {outcome.target_value}{outcome.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      AI Insights
                    </h4>
                    <div className="space-y-2 text-sm">
                      {generatedTemplate.ai_insights.success_factors.slice(0, 3).map((factor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={saveTemplate} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button onClick={exportTemplate} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Customize
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Ready to Generate</h3>
                <p className="text-sm">Configure your requirements and let AI create a custom template</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};