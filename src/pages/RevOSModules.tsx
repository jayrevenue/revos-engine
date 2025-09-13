import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Target, TrendingUp, DollarSign, Zap, Bot, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RevOSModule {
  id: string;
  module_type: string;
  title: string;
  description: string;
  status: string;
  data: any;
  created_at: string;
}

interface Outcome {
  id: string;
  metric_name: string;
  baseline_value: number;
  target_value: number;
  current_value: number;
  measurement_date: string;
  notes: string;
}

interface Intervention {
  id: string;
  title: string;
  description: string;
  intervention_type: string;
  priority: string;
  status: string;
  due_date: string;
  expected_impact: string;
  actual_impact: string;
}

const RevOSModules = () => {
  const { engagementId } = useParams<{ engagementId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<RevOSModule[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && engagementId) {
      fetchRevOSData();
    }
  }, [user, loading, navigate, engagementId]);

  const fetchRevOSData = async () => {
    if (!engagementId) return;

    try {
      setLoadingData(true);
      
      // Fetch RevOS modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('revos_modules')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('created_at', { ascending: false });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch outcomes
      const { data: outcomesData, error: outcomesError } = await supabase
        .from('outcomes')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('measurement_date', { ascending: false });

      if (outcomesError) throw outcomesError;
      setOutcomes(outcomesData || []);

      // Fetch interventions
      const { data: interventionsData, error: interventionsError } = await supabase
        .from('interventions')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('due_date', { ascending: true });

      if (interventionsError) throw interventionsError;
      setInterventions(interventionsData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch RevOS data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getModuleIcon = (moduleType: string) => {
    switch (moduleType) {
      case 'outcome_tracker': return <Target className="w-6 h-6" />;
      case 'intervention_planner': return <Zap className="w-6 h-6" />;
      case 'pricing_strategy': return <DollarSign className="w-6 h-6" />;
      case 'cac_compression': return <TrendingUp className="w-6 h-6" />;
      case 'agent_deployment': return <Bot className="w-6 h-6" />;
      default: return <BarChart3 className="w-6 h-6" />;
    }
  };

  const getModuleTitle = (moduleType: string) => {
    switch (moduleType) {
      case 'outcome_tracker': return 'Outcome Tracker';
      case 'intervention_planner': return 'Intervention Planner';
      case 'pricing_strategy': return 'Pricing Strategy Builder';
      case 'cac_compression': return 'CAC Compression Toolkit';
      case 'agent_deployment': return 'Agent Deployment SOP';
      default: return moduleType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'completed': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (baseline: number, current: number, target: number) => {
    if (baseline === target) return 100;
    const progress = ((current - baseline) / (target - baseline)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const createModule = async (moduleType: string) => {
    if (!user || !engagementId) return;

    try {
      const { data, error } = await supabase
        .from('revos_modules')
        .insert({
          engagement_id: engagementId,
          module_type: moduleType,
          title: getModuleTitle(moduleType),
          description: `${getModuleTitle(moduleType)} for this engagement`,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setModules(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: `${getModuleTitle(moduleType)} created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const moduleTypes = ['outcome_tracker', 'intervention_planner', 'pricing_strategy', 'cac_compression', 'agent_deployment'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(`/engagements/${engagementId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engagement
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">RevOS Modules</h1>
            <p className="text-muted-foreground mt-2">
              Revenue operations modules for systematic engagement management
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outcome_tracker">Outcome Tracker</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
            <TabsTrigger value="cac">CAC Compression</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {moduleTypes.map((moduleType) => {
                const existingModule = modules.find(m => m.module_type === moduleType);
                return (
                  <Card 
                    key={moduleType} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => existingModule ? navigate(`/revos/${engagementId}/${moduleType}`) : createModule(moduleType)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {getModuleIcon(moduleType)}
                        {getModuleTitle(moduleType)}
                      </CardTitle>
                      <CardDescription>
                        {existingModule ? (
                          <Badge className={getStatusColor(existingModule.status)}>
                            {existingModule.status}
                          </Badge>
                        ) : (
                          'Not created yet'
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={existingModule ? "default" : "outline"} 
                        className="w-full"
                      >
                        {existingModule ? 'Open Module' : 'Create Module'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="outcome_tracker" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Outcome Tracker</h2>
              <Button onClick={() => navigate(`/revos/${engagementId}/outcomes/new`)}>
                <Plus className="w-4 h-4 mr-2" />
                Track New Outcome
              </Button>
            </div>

            {outcomes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No outcomes tracked</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking revenue metrics and outcomes
                  </p>
                  <Button onClick={() => navigate(`/revos/${engagementId}/outcomes/new`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Track First Outcome
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {outcomes.map((outcome) => {
                  const progress = calculateProgress(
                    outcome.baseline_value,
                    outcome.current_value,
                    outcome.target_value
                  );
                  
                  return (
                    <Card key={outcome.id}>
                      <CardHeader>
                        <CardTitle>{outcome.metric_name}</CardTitle>
                        <CardDescription>
                          Target: {outcome.target_value} | Current: {outcome.current_value}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        {outcome.notes && (
                          <p className="text-sm text-muted-foreground">
                            {outcome.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interventions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Intervention Planner</h2>
              <Button onClick={() => navigate(`/revos/${engagementId}/interventions/new`)}>
                <Plus className="w-4 h-4 mr-2" />
                Plan Intervention
              </Button>
            </div>

            {interventions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No interventions planned</h3>
                  <p className="text-muted-foreground mb-4">
                    Create intervention plans to drive revenue outcomes
                  </p>
                  <Button onClick={() => navigate(`/revos/${engagementId}/interventions/new`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Plan First Intervention
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {interventions.map((intervention) => (
                  <Card key={intervention.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{intervention.title}</CardTitle>
                          <CardDescription>{intervention.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(intervention.priority)}>
                            {intervention.priority}
                          </Badge>
                          <Badge className={getStatusColor(intervention.status)}>
                            {intervention.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {intervention.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Due: {new Date(intervention.due_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {intervention.expected_impact && (
                        <div>
                          <h4 className="font-semibold text-sm">Expected Impact</h4>
                          <p className="text-sm text-muted-foreground">{intervention.expected_impact}</p>
                        </div>
                      )}
                      
                      {intervention.actual_impact && (
                        <div>
                          <h4 className="font-semibold text-sm">Actual Impact</h4>
                          <p className="text-sm text-muted-foreground">{intervention.actual_impact}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pricing Strategy Builder</h2>
              <Button onClick={() => createModule('pricing_strategy')}>
                <Plus className="w-4 h-4 mr-2" />
                Build Strategy
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Strategy Framework
                </CardTitle>
                <CardDescription>
                  Develop data-driven pricing strategies for revenue optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This module will help you analyze pricing data, competitive positioning, and value metrics to optimize pricing strategies.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cac" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">CAC Compression Toolkit</h2>
              <Button onClick={() => createModule('cac_compression')}>
                <Plus className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Customer Acquisition Cost Optimization
                </CardTitle>
                <CardDescription>
                  Analyze and optimize customer acquisition costs across channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This toolkit provides frameworks for analyzing CAC by channel, optimizing acquisition funnels, and implementing cost reduction strategies.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RevOSModules;