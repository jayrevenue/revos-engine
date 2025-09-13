import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock, Bot, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentFeedback {
  id: string;
  agentId: string;
  agentName: string;
  conversationId: string;
  rating: number;
  feedback: string;
  category: 'accuracy' | 'helpfulness' | 'speed' | 'clarity';
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'implemented';
}

interface OutcomeAttribution {
  id: string;
  agentId: string;
  agentName: string;
  outcomeId: string;
  outcomeName: string;
  contributionScore: number;
  impactType: 'direct' | 'indirect' | 'supporting';
  evidenceStrength: 'strong' | 'moderate' | 'weak';
  verifiedBy: string;
  verifiedAt: Date;
}

const AgentQASystem = () => {
  const { toast } = useToast();
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isAttributionDialogOpen, setIsAttributionDialogOpen] = useState(false);
  
  // Mock data for agent feedback
  const agentFeedback: AgentFeedback[] = [
    {
      id: '1',
      agentId: 'agent-001',
      agentName: 'Sales Velocity Optimizer',
      conversationId: 'conv-123',
      rating: 4,
      feedback: 'The agent provided accurate sales insights but could be faster in response time.',
      category: 'accuracy',
      submittedBy: 'John Doe',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'reviewed'
    },
    {
      id: '2',
      agentId: 'agent-002',
      agentName: 'Lead Qualification Bot',
      conversationId: 'conv-124',
      rating: 5,
      feedback: 'Excellent lead scoring accuracy and very helpful in prioritizing prospects.',
      category: 'helpfulness',
      submittedBy: 'Jane Smith',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '3',
      agentId: 'agent-003',
      agentName: 'Process Documentation AI',
      conversationId: 'conv-125',
      rating: 3,
      feedback: 'Process documentation is comprehensive but explanations could be clearer.',
      category: 'clarity',
      submittedBy: 'Bob Wilson',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'pending'
    }
  ];

  // Mock data for outcome attribution
  const outcomeAttributions: OutcomeAttribution[] = [
    {
      id: '1',
      agentId: 'agent-001',
      agentName: 'Sales Velocity Optimizer',
      outcomeId: 'outcome-001',
      outcomeName: 'Sales Cycle Reduction',
      contributionScore: 85,
      impactType: 'direct',
      evidenceStrength: 'strong',
      verifiedBy: 'Sarah Johnson',
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      agentId: 'agent-002',
      agentName: 'Lead Qualification Bot',
      outcomeId: 'outcome-002',
      outcomeName: 'Lead Conversion Rate Increase',
      contributionScore: 92,
      impactType: 'direct',
      evidenceStrength: 'strong',
      verifiedBy: 'Mike Chen',
      verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      agentId: 'agent-001',
      agentName: 'Sales Velocity Optimizer',
      outcomeId: 'outcome-003',
      outcomeName: 'Revenue Per Sale Improvement',
      contributionScore: 68,
      impactType: 'indirect',
      evidenceStrength: 'moderate',
      verifiedBy: 'Lisa Park',
      verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'reviewed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'implemented': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getImpactTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'indirect': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'supporting': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getEvidenceStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'weak': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const averageRating = agentFeedback.reduce((sum, f) => sum + f.rating, 0) / agentFeedback.length;
  const pendingFeedback = agentFeedback.filter(f => f.status === 'pending').length;
  const totalAttributions = outcomeAttributions.length;
  const averageContribution = outcomeAttributions.reduce((sum, a) => sum + a.contributionScore, 0) / outcomeAttributions.length;

  const submitFeedback = () => {
    toast({
      title: "Feedback Submitted",
      description: "Agent feedback has been recorded for review",
    });
    setIsFeedbackDialogOpen(false);
  };

  const submitAttribution = () => {
    toast({
      title: "Attribution Recorded",
      description: "Outcome attribution has been documented",
    });
    setIsAttributionDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agent QA System</h2>
          <p className="text-muted-foreground">Monitor agent performance, collect feedback, and track outcome attribution</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Agent Feedback</DialogTitle>
                <DialogDescription>Provide feedback on agent performance</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent-001">Sales Velocity Optimizer</SelectItem>
                      <SelectItem value="agent-002">Lead Qualification Bot</SelectItem>
                      <SelectItem value="agent-003">Process Documentation AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rating</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Poor</SelectItem>
                      <SelectItem value="1">1 - Very Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Feedback category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="helpfulness">Helpfulness</SelectItem>
                      <SelectItem value="speed">Speed</SelectItem>
                      <SelectItem value="clarity">Clarity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Feedback</Label>
                  <Textarea placeholder="Provide detailed feedback..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={submitFeedback} className="flex-1">Submit</Button>
                  <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAttributionDialogOpen} onOpenChange={setIsAttributionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Record Attribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Outcome Attribution</DialogTitle>
                <DialogDescription>Link agent performance to business outcomes</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent-001">Sales Velocity Optimizer</SelectItem>
                      <SelectItem value="agent-002">Lead Qualification Bot</SelectItem>
                      <SelectItem value="agent-003">Process Documentation AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Outcome</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outcome-001">Sales Cycle Reduction</SelectItem>
                      <SelectItem value="outcome-002">Lead Conversion Rate Increase</SelectItem>
                      <SelectItem value="outcome-003">Revenue Per Sale Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contribution Score (0-100)</Label>
                  <Input type="number" min="0" max="100" placeholder="85" />
                </div>
                <div>
                  <Label>Impact Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Impact</SelectItem>
                      <SelectItem value="indirect">Indirect Impact</SelectItem>
                      <SelectItem value="supporting">Supporting Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Evidence Strength</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Evidence quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong Evidence</SelectItem>
                      <SelectItem value="moderate">Moderate Evidence</SelectItem>
                      <SelectItem value="weak">Weak Evidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={submitAttribution} className="flex-1">Record</Button>
                  <Button variant="outline" onClick={() => setIsAttributionDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outcome Attributions</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttributions}</div>
            <p className="text-xs text-muted-foreground">Tracked outcomes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Contribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageContribution)}%</div>
            <p className="text-xs text-muted-foreground">To outcomes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Feedback and Attribution */}
      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">Feedback Management</TabsTrigger>
          <TabsTrigger value="attribution">Outcome Attribution</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Feedback</CardTitle>
              <CardDescription>Review and manage feedback submitted for AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentFeedback.map((feedback) => (
                  <div key={feedback.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4 flex-1">
                      <Bot className="h-5 w-5 mt-1 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{feedback.agentName}</h4>
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status}
                          </Badge>
                          <Badge variant="outline">{feedback.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feedback.feedback}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By {feedback.submittedBy}</span>
                          <span>{feedback.submittedAt.toLocaleDateString()}</span>
                          <span>Conversation {feedback.conversationId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${getRatingColor(feedback.rating)}`}>
                        {feedback.rating}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outcome Attribution</CardTitle>
              <CardDescription>Track how AI agents contribute to business outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outcomeAttributions.map((attribution) => (
                  <div key={attribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4 flex-1">
                      <Target className="h-5 w-5 mt-1 text-green-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{attribution.agentName}</h4>
                          <Badge className={getImpactTypeColor(attribution.impactType)}>
                            {attribution.impactType}
                          </Badge>
                          <Badge className={getEvidenceStrengthColor(attribution.evidenceStrength)}>
                            {attribution.evidenceStrength} evidence
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">Outcome: {attribution.outcomeName}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Verified by {attribution.verifiedBy}</span>
                          <span>{attribution.verifiedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-600">
                        {attribution.contributionScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">contribution</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Agent performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Performance charts would be implemented here with real-time data
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Key quality indicators for agent performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Accuracy</span>
                    <span className="text-sm font-bold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm font-bold">4.1/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resolution Rate</span>
                    <span className="text-sm font-bold">87.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Response Time</span>
                    <span className="text-sm font-bold">1.3s</span>
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

export default AgentQASystem;