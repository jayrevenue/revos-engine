import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { Bot, DollarSign, TrendingUp, Clock, Zap } from "lucide-react";

interface AgentROI {
  agentName: string;
  role: string;
  deploymentCost: number;
  monthlySavings: number;
  timesSaved: number; // hours per month
  tasksAutomated: number;
  accuracy: number; // percentage
  status: 'active' | 'training' | 'optimizing';
  roiPercentage: number;
  engagementId: string;
}

const AgentROIDashboard = () => {
  // Mock data for agent ROI analysis
  const agentData: AgentROI[] = [
    {
      agentName: "Sales Velocity Optimizer",
      role: "Sales Assistant",
      deploymentCost: 15000,
      monthlySavings: 8500,
      timesSaved: 120,
      tasksAutomated: 45,
      accuracy: 94,
      status: 'active',
      roiPercentage: 340,
      engagementId: "eng-001"
    },
    {
      agentName: "Lead Qualification Bot",
      role: "Marketing Assistant",
      deploymentCost: 12000,
      monthlySavings: 6200,
      timesSaved: 80,
      tasksAutomated: 35,
      accuracy: 89,
      status: 'active',
      roiPercentage: 258,
      engagementId: "eng-002"
    },
    {
      agentName: "Process Documentation AI",
      role: "Operations Assistant",
      deploymentCost: 18000,
      monthlySavings: 4800,
      timesSaved: 60,
      tasksAutomated: 25,
      accuracy: 96,
      status: 'optimizing',
      roiPercentage: 160,
      engagementId: "eng-003"
    },
    {
      agentName: "Customer Support Analyzer",
      role: "Support Assistant",
      deploymentCost: 10000,
      monthlySavings: 5500,
      timesSaved: 90,
      tasksAutomated: 40,
      accuracy: 91,
      status: 'active',
      roiPercentage: 330,
      engagementId: "eng-001"
    },
    {
      agentName: "Revenue Forecasting AI",
      role: "Analytics Assistant",
      deploymentCost: 20000,
      monthlySavings: 3200,
      timesSaved: 40,
      tasksAutomated: 15,
      accuracy: 87,
      status: 'training',
      roiPercentage: 96,
      engagementId: "eng-004"
    }
  ];

  const totalInvestment = agentData.reduce((sum, agent) => sum + agent.deploymentCost, 0);
  const totalMonthlySavings = agentData.reduce((sum, agent) => sum + agent.monthlySavings, 0);
  const totalTimeSaved = agentData.reduce((sum, agent) => sum + agent.timesSaved, 0);
  const averageROI = Math.round(agentData.reduce((sum, agent) => sum + agent.roiPercentage, 0) / agentData.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'training': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'optimizing': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  // ROI trend over time (simulated)
  const roiTrendData = Array.from({ length: 6 }, (_, i) => ({
    month: `Month ${i + 1}`,
    roi: averageROI * (0.3 + (i * 0.15)),
    savings: totalMonthlySavings * (0.4 + (i * 0.12))
  }));

  // Cost vs Savings comparison
  const costSavingsData = agentData.map(agent => ({
    name: agent.agentName.split(' ')[0],
    cost: agent.deploymentCost,
    monthlySavings: agent.monthlySavings,
    roi: agent.roiPercentage
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageROI}%</div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalInvestment / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">Initial deployment costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalMonthlySavings / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Recurring cost reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeSaved}h</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentData.filter(agent => agent.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ROI Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Trend Analysis</CardTitle>
            <CardDescription>Return on investment growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="ROI %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost vs Savings Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cost vs Monthly Savings</CardTitle>
            <CardDescription>Investment compared to ongoing savings by agent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costSavingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="hsl(var(--muted))" name="Deployment Cost ($)" />
                <Bar dataKey="monthlySavings" fill="hsl(var(--primary))" name="Monthly Savings ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Detail</CardTitle>
          <CardDescription>Comprehensive ROI analysis for each deployed AI agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentData.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  <Bot className="h-5 w-5 mt-1 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{agent.agentName}</h4>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Badge variant="outline">{agent.role}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">ROI</div>
                        <div className="font-medium text-green-600">{agent.roiPercentage}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Savings</div>
                        <div className="font-medium">${agent.monthlySavings.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time Saved</div>
                        <div className="font-medium">{agent.timesSaved}h/month</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-medium">{agent.accuracy}%</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Payback Progress</span>
                        <span>{Math.min(Math.round((agent.monthlySavings * 6) / agent.deploymentCost * 100), 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.min((agent.monthlySavings * 6) / agent.deploymentCost * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">${(agent.monthlySavings * 12).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Annual Savings</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {agent.tasksAutomated} tasks automated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentROIDashboard;