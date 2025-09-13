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
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Users,
  FileText,
  Bell,
  Eye,
  Activity,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Shield
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'not-started' | 'in-progress' | 'at-risk' | 'completed' | 'overdue';
  progress: number;
  dependencies: string[];
  assignedTo: string[];
  deliverables: string[];
  criticalPath: boolean;
  estimatedHours: number;
  actualHours?: number;
  riskFactors: string[];
  successCriteria: string[];
}

interface Engagement {
  id: string;
  name: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paused' | 'completed';
  milestones: Milestone[];
  projectManager: string;
  budget: number;
  burnRate: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  title: string;
  message: string;
  engagementId: string;
  milestoneId?: string;
  timestamp: Date;
  actionRequired: boolean;
  suggestedActions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AIInsight {
  type: 'risk' | 'opportunity' | 'optimization' | 'prediction';
  confidence: number;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  recommendations: string[];
}

interface AutomatedMilestoneTrackerProps {
  engagements: Engagement[];
  onTakeAction?: (alert: Alert) => void;
  onUpdateMilestone?: (engagementId: string, milestoneId: string, updates: Partial<Milestone>) => void;
}

export const AutomatedMilestoneTracker = ({
  engagements,
  onTakeAction,
  onUpdateMilestone
}: AutomatedMilestoneTrackerProps) => {
  const { toast } = useToast();
  const [selectedEngagement, setSelectedEngagement] = useState<string>('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate AI-powered alerts and insights
  const generateAlertsAndInsights = useMemo(() => {
    const newAlerts: Alert[] = [];
    const newInsights: AIInsight[] = [];

    engagements.forEach(engagement => {
      engagement.milestones.forEach(milestone => {
        const daysUntilDue = Math.ceil((milestone.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const progressRate = milestone.progress / (milestone.estimatedHours || 1);
        
        // Critical path delays
        if (milestone.criticalPath && milestone.status === 'at-risk') {
          newAlerts.push({
            id: `critical-${milestone.id}`,
            type: 'critical',
            title: 'Critical Path Milestone At Risk',
            message: `${milestone.name} is on the critical path and facing delays. This could impact the entire project timeline.`,
            engagementId: engagement.id,
            milestoneId: milestone.id,
            timestamp: new Date(),
            actionRequired: true,
            suggestedActions: [
              'Reallocate resources from non-critical tasks',
              'Schedule emergency stakeholder meeting',
              'Consider scope reduction or timeline extension',
              'Implement daily standups for this milestone'
            ],
            priority: 'critical'
          });
        }

        // Overdue milestones
        if (daysUntilDue < 0 && milestone.status !== 'completed') {
          newAlerts.push({
            id: `overdue-${milestone.id}`,
            type: 'critical',
            title: 'Milestone Overdue',
            message: `${milestone.name} was due ${Math.abs(daysUntilDue)} days ago and is ${milestone.progress}% complete.`,
            engagementId: engagement.id,
            milestoneId: milestone.id,
            timestamp: new Date(),
            actionRequired: true,
            suggestedActions: [
              'Immediate status review with assigned team',
              'Reassess milestone scope and requirements',
              'Consider parallel workstreams',
              'Notify client of potential delays'
            ],
            priority: 'critical'
          });
        }

        // Early warning for at-risk milestones
        if (daysUntilDue <= 7 && milestone.progress < 70 && milestone.status !== 'completed') {
          newAlerts.push({
            id: `risk-${milestone.id}`,
            type: 'warning',
            title: 'Milestone Progress Warning',
            message: `${milestone.name} is due in ${daysUntilDue} days but only ${milestone.progress}% complete.`,
            engagementId: engagement.id,
            milestoneId: milestone.id,
            timestamp: new Date(),
            actionRequired: true,
            suggestedActions: [
              'Increase resource allocation',
              'Review blocking dependencies',
              'Consider breaking into smaller tasks',
              'Schedule focused work sessions'
            ],
            priority: 'high'
          });
        }

        // Resource allocation insights
        if (milestone.actualHours && milestone.estimatedHours) {
          const hourVariance = (milestone.actualHours - milestone.estimatedHours) / milestone.estimatedHours;
          if (hourVariance > 0.2) {
            newInsights.push({
              type: 'optimization',
              confidence: 0.85,
              title: 'Resource Estimation Improvement',
              description: `${milestone.name} is taking ${Math.round(hourVariance * 100)}% longer than estimated. Historical patterns suggest similar tasks require ${Math.round(milestone.estimatedHours * (1 + hourVariance))} hours.`,
              impact: 'medium',
              timeframe: 'future projects',
              recommendations: [
                'Update estimation models for similar milestone types',
                'Include complexity buffers for this client type',
                'Consider team skill level in future estimates'
              ]
            });
          }
        }

        // Success prediction
        if (milestone.status === 'in-progress') {
          const successProbability = Math.max(0, Math.min(1, 
            (milestone.progress / 100) * 
            (daysUntilDue > 0 ? 1 : 0.5) * 
            (milestone.riskFactors.length === 0 ? 1 : 0.8)
          ));

          if (successProbability < 0.6) {
            newInsights.push({
              type: 'prediction',
              confidence: successProbability,
              title: 'Success Probability Analysis',
              description: `AI models predict ${Math.round(successProbability * 100)}% chance of on-time completion for ${milestone.name}.`,
              impact: successProbability < 0.3 ? 'high' : 'medium',
              timeframe: 'next 2 weeks',
              recommendations: [
                'Implement daily progress checkpoints',
                'Address identified risk factors proactively',
                'Consider bringing in additional expertise',
                'Prepare contingency plans'
              ]
            });
          }
        }
      });

      // Engagement-level budget alerts
      const burnRate = engagement.burnRate;
      const timeRemaining = (engagement.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      const projectedSpend = burnRate * timeRemaining;
      
      if (projectedSpend > engagement.budget * 1.1) {
        newAlerts.push({
          id: `budget-${engagement.id}`,
          type: 'warning',
          title: 'Budget Overrun Risk',
          message: `Current burn rate suggests budget overrun of ${Math.round(((projectedSpend - engagement.budget) / engagement.budget) * 100)}% for ${engagement.name}.`,
          engagementId: engagement.id,
          timestamp: new Date(),
          actionRequired: true,
          suggestedActions: [
            'Review current resource allocation',
            'Identify scope reduction opportunities',
            'Negotiate budget increase with client',
            'Implement cost control measures'
          ],
          priority: 'high'
        });
      }

      // Opportunity identification
      const completedMilestones = engagement.milestones.filter(m => m.status === 'completed');
      const avgCompletionRate = completedMilestones.length > 0 
        ? completedMilestones.reduce((acc, m) => acc + m.progress, 0) / completedMilestones.length 
        : 0;

      if (avgCompletionRate > 95 && engagement.status === 'active') {
        newInsights.push({
          type: 'opportunity',
          confidence: 0.9,
          title: 'Expansion Opportunity Detected',
          description: `High performance on ${engagement.name} (${Math.round(avgCompletionRate)}% avg completion rate) suggests potential for scope expansion or follow-on work.`,
          impact: 'high',
          timeframe: 'next 4 weeks',
          recommendations: [
            'Proactively present additional value propositions',
            'Schedule strategic review with client stakeholders',
            'Prepare expansion proposal based on current success',
            'Leverage momentum for testimonials/case studies'
          ]
        });
      }
    });

    return { alerts: newAlerts, insights: newInsights };
  }, [engagements]);

  useEffect(() => {
    const { alerts: newAlerts, insights: newInsights } = generateAlertsAndInsights;
    setAlerts(newAlerts);
    setInsights(newInsights);
  }, [generateAlertsAndInsights]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const { alerts: newAlerts, insights: newInsights } = generateAlertsAndInsights;
      setAlerts(newAlerts);
      setInsights(newInsights);
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh, generateAlertsAndInsights]);

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'risk': return <Shield className="h-4 w-4 text-red-600" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'optimization': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'prediction': return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.priority === 'critical');
  const highAlerts = alerts.filter(a => a.priority === 'high');
  const activeEngagements = engagements.filter(e => e.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Milestone Tracker</h2>
          <p className="text-muted-foreground">
            Automated monitoring with proactive alerts and AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
          <Badge variant="outline">
            {alerts.length} Active Alerts
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Issues Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalAlerts.length} critical milestone{criticalAlerts.length > 1 ? 's' : ''} requiring immediate attention.
            <Button variant="link" className="p-0 h-auto ml-2 text-red-600">
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            AI Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="tracking">Milestone Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEngagements.length}</div>
                <p className="text-xs text-muted-foreground">
                  {engagements.length - activeEngagements.length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {highAlerts.length} high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">At Risk Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {engagements.reduce((acc, e) => 
                    acc + e.milestones.filter(m => m.status === 'at-risk').length, 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
                <p className="text-xs text-muted-foreground">
                  Generated recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Latest automated alerts and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {alerts.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {alerts.length} Alerts
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500' :
                alert.type === 'warning' ? 'border-l-yellow-500' :
                alert.type === 'info' ? 'border-l-blue-500' : 'border-l-green-500'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <Badge variant={alert.priority === 'critical' ? 'destructive' : 
                        alert.priority === 'high' ? 'default' : 'secondary'}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <CardDescription>{alert.message}</CardDescription>
                </CardHeader>
                {alert.actionRequired && (
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Suggested Actions:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {alert.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onTakeAction?.(alert);
                              toast({
                                title: "Action Initiated",
                                description: action,
                              });
                            }}
                            className="justify-start"
                          >
                            <ArrowRight className="h-3 w-3 mr-2" />
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle>{insight.title}</CardTitle>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <Badge variant={insight.impact === 'high' ? 'default' : 
                      insight.impact === 'medium' ? 'secondary' : 'outline'}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {insight.timeframe}
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

        <TabsContent value="tracking" className="space-y-6">
          {/* Engagement selector */}
          <div className="flex items-center gap-4">
            <h3 className="font-medium">Select Engagement:</h3>
            <div className="flex gap-2">
              {activeEngagements.map(engagement => (
                <Button
                  key={engagement.id}
                  variant={selectedEngagement === engagement.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEngagement(engagement.id)}
                >
                  {engagement.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected engagement details */}
          {selectedEngagement && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {activeEngagements.find(e => e.id === selectedEngagement)?.name}
                    </CardTitle>
                    <CardDescription>
                      Client: {activeEngagements.find(e => e.id === selectedEngagement)?.clientName}
                    </CardDescription>
                  </div>
                  <Badge>
                    {activeEngagements.find(e => e.id === selectedEngagement)?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activeEngagements.find(e => e.id === selectedEngagement)?.milestones.map(milestone => (
                      <div key={milestone.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(milestone.status)}
                            <h4 className="font-medium">{milestone.name}</h4>
                            {milestone.criticalPath && (
                              <Badge variant="destructive" size="sm">Critical Path</Badge>
                            )}
                          </div>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Due Date:</span> {milestone.dueDate.toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Assigned To:</span> {milestone.assignedTo.join(', ')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>
                        
                        {milestone.riskFactors.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-red-600">Risk Factors:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {milestone.riskFactors.map((risk, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm">
                            Update Status
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};