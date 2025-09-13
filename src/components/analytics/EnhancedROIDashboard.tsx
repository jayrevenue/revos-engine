import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Bot, DollarSign, TrendingUp, Clock, Zap, Target, Calendar, ArrowUpRight, ArrowDownRight, TrendingDown } from "lucide-react";

interface DetailedROIMetrics {
  agentId: string;
  agentName: string;
  category: 'Sales' | 'Marketing' | 'Operations' | 'Support' | 'Analytics';
  deploymentDate: string;
  initialInvestment: number;
  monthlyOperationalCost: number;
  directSavings: number;
  indirectBenefits: number;
  timeToValue: number; // days
  accuracyScore: number;
  userAdoptionRate: number;
  customerSatisfactionImpact: number;
  revenueImpact: number;
  riskMitigation: number;
  paybackPeriod: number; // months
  netPresentValue: number;
  internalRateOfReturn: number;
  status: 'Active' | 'Training' | 'Optimizing' | 'Underperforming';
  businessImpactScore: number;
}

const EnhancedROIDashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Enhanced mock data with comprehensive ROI metrics
  const detailedMetrics: DetailedROIMetrics[] = [
    {
      agentId: 'agt-001',
      agentName: 'Sales Velocity Optimizer',
      category: 'Sales',
      deploymentDate: '2024-01-15',
      initialInvestment: 25000,
      monthlyOperationalCost: 1200,
      directSavings: 12000,
      indirectBenefits: 8500,
      timeToValue: 45,
      accuracyScore: 94.5,
      userAdoptionRate: 87,
      customerSatisfactionImpact: 15,
      revenueImpact: 180000,
      riskMitigation: 35000,
      paybackPeriod: 2.1,
      netPresentValue: 156000,
      internalRateOfReturn: 425,
      status: 'Active',
      businessImpactScore: 92
    },
    {
      agentId: 'agt-002',
      agentName: 'Lead Qualification Engine',
      category: 'Marketing',
      deploymentDate: '2024-02-01',
      initialInvestment: 18000,
      monthlyOperationalCost: 800,
      directSavings: 7500,
      indirectBenefits: 5200,
      timeToValue: 30,
      accuracyScore: 89.3,
      userAdoptionRate: 92,
      customerSatisfactionImpact: 12,
      revenueImpact: 95000,
      riskMitigation: 22000,
      paybackPeriod: 1.8,
      netPresentValue: 98000,
      internalRateOfReturn: 312,
      status: 'Active',
      businessImpactScore: 86
    },
    {
      agentId: 'agt-003',
      agentName: 'Process Automation Bot',
      category: 'Operations',
      deploymentDate: '2024-03-10',
      initialInvestment: 32000,
      monthlyOperationalCost: 1500,
      directSavings: 8800,
      indirectBenefits: 4200,
      timeToValue: 60,
      accuracyScore: 96.8,
      userAdoptionRate: 78,
      customerSatisfactionImpact: 8,
      revenueImpact: 75000,
      riskMitigation: 45000,
      paybackPeriod: 2.9,
      netPresentValue: 89000,
      internalRateOfReturn: 268,
      status: 'Optimizing',
      businessImpactScore: 79
    },
    {
      agentId: 'agt-004',
      agentName: 'Customer Success AI',
      category: 'Support',
      deploymentDate: '2024-04-05',
      initialInvestment: 15000,
      monthlyOperationalCost: 600,
      directSavings: 9200,
      indirectBenefits: 6800,
      timeToValue: 25,
      accuracyScore: 91.7,
      userAdoptionRate: 95,
      customerSatisfactionImpact: 28,
      revenueImpact: 125000,
      riskMitigation: 18000,
      paybackPeriod: 1.4,
      netPresentValue: 142000,
      internalRateOfReturn: 489,
      status: 'Active',
      businessImpactScore: 95
    },
    {
      agentId: 'agt-005',
      agentName: 'Revenue Analytics AI',
      category: 'Analytics',
      deploymentDate: '2024-05-20',
      initialInvestment: 28000,
      monthlyOperationalCost: 1100,
      directSavings: 5500,
      indirectBenefits: 8900,
      timeToValue: 75,
      accuracyScore: 88.2,
      userAdoptionRate: 73,
      customerSatisfactionImpact: 5,
      revenueImpact: 58000,
      riskMitigation: 65000,
      paybackPeriod: 3.8,
      netPresentValue: 67000,
      internalRateOfReturn: 186,
      status: 'Training',
      businessImpactScore: 71
    }
  ];

  const filteredMetrics = categoryFilter === 'all' 
    ? detailedMetrics 
    : detailedMetrics.filter(m => m.category === categoryFilter);

  // Aggregate calculations
  const totalInvestment = filteredMetrics.reduce((sum, m) => sum + m.initialInvestment, 0);
  const totalMonthlySavings = filteredMetrics.reduce((sum, m) => sum + m.directSavings, 0);
  const totalRevenueImpact = filteredMetrics.reduce((sum, m) => sum + m.revenueImpact, 0);
  const averagePayback = filteredMetrics.reduce((sum, m) => sum + m.paybackPeriod, 0) / filteredMetrics.length;
  const totalNPV = filteredMetrics.reduce((sum, m) => sum + m.netPresentValue, 0);
  const averageIRR = filteredMetrics.reduce((sum, m) => sum + m.internalRateOfReturn, 0) / filteredMetrics.length;

  // Time series data for ROI progression
  const roiProgressionData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    cumulativeROI: Math.round(averageIRR * (0.1 + (i * 0.08))),
    monthlySavings: totalMonthlySavings * (0.3 + (i * 0.06)),
    revenueImpact: totalRevenueImpact * (0.2 + (i * 0.07))
  }));

  // Business impact vs cost efficiency scatter
  const impactEfficiencyData = filteredMetrics.map(m => ({
    name: m.agentName,
    businessImpact: m.businessImpactScore,
    costEfficiency: (m.directSavings + m.indirectBenefits) / m.initialInvestment * 100,
    category: m.category,
    roi: m.internalRateOfReturn
  }));

  // Category performance comparison
  const categoryPerformance = ['Sales', 'Marketing', 'Operations', 'Support', 'Analytics'].map(cat => {
    const catMetrics = detailedMetrics.filter(m => m.category === cat);
    if (catMetrics.length === 0) return null;
    
    return {
      category: cat,
      avgROI: catMetrics.reduce((sum, m) => sum + m.internalRateOfReturn, 0) / catMetrics.length,
      totalInvestment: catMetrics.reduce((sum, m) => sum + m.initialInvestment, 0),
      totalSavings: catMetrics.reduce((sum, m) => sum + m.directSavings, 0),
      agentCount: catMetrics.length,
      avgBusinessImpact: catMetrics.reduce((sum, m) => sum + m.businessImpactScore, 0) / catMetrics.length
    };
  }).filter(Boolean);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Training': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Optimizing': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'Underperforming': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Sales: '#10b981',
      Marketing: '#3b82f6',
      Operations: '#f59e0b',
      Support: '#8b5cf6',
      Analytics: '#ef4444'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex gap-4 items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="12months">Last 12 months</SelectItem>
            <SelectItem value="24months">Last 24 months</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Support">Support</SelectItem>
            <SelectItem value="Analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(averageIRR)}%</div>
            <p className="text-xs text-muted-foreground">
              Average IRR across {filteredMetrics.length} agents
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Present Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalNPV / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              Total portfolio NPV
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePayback.toFixed(1)}mo</div>
            <p className="text-xs text-muted-foreground">
              Average time to break even
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenueImpact / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              Annual revenue increase
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progression" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progression">ROI Progression</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
          <TabsTrigger value="efficiency">Impact vs Efficiency</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="progression" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ROI Progression Over Time</CardTitle>
                <CardDescription>Cumulative return on investment trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={roiProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                    <Area 
                      type="monotone" 
                      dataKey="cumulativeROI" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value Creation Timeline</CardTitle>
                <CardDescription>Monthly savings and revenue impact progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={roiProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="monthlySavings" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Monthly Savings ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenueImpact" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Revenue Impact ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>ROI comparison across business functions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgROI" fill="hsl(var(--primary))" name="Average ROI (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Capital allocation across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="totalInvestment"
                      label={({ category, totalInvestment }) => 
                        `${category}: $${(totalInvestment / 1000).toFixed(0)}k`
                      }
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Investment']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Impact vs Cost Efficiency Matrix</CardTitle>
              <CardDescription>Strategic positioning of AI agents based on impact and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart data={impactEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="costEfficiency" 
                    name="Cost Efficiency" 
                    domain={[0, 200]}
                    label={{ value: 'Cost Efficiency (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="businessImpact" 
                    name="Business Impact" 
                    domain={[60, 100]}
                    label={{ value: 'Business Impact Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">Category: {data.category}</p>
                            <p className="text-sm">Business Impact: {data.businessImpact}</p>
                            <p className="text-sm">Cost Efficiency: {data.costEfficiency.toFixed(1)}%</p>
                            <p className="text-sm">ROI: {data.roi}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="businessImpact" fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Agent Performance</CardTitle>
              <CardDescription>Detailed ROI metrics and business impact analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredMetrics.map((agent, index) => (
                  <div key={index} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold">{agent.agentName}</h4>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                          <Badge variant="outline" style={{ borderColor: getCategoryColor(agent.category) }}>
                            {agent.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Deployed: {new Date(agent.deploymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{agent.internalRateOfReturn}%</div>
                        <p className="text-xs text-muted-foreground">IRR</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Investment</div>
                        <div className="font-medium">${(agent.initialInvestment / 1000).toFixed(0)}k</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Savings</div>
                        <div className="font-medium">${(agent.directSavings / 1000).toFixed(1)}k</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">NPV</div>
                        <div className="font-medium">${(agent.netPresentValue / 1000).toFixed(0)}k</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Payback</div>
                        <div className="font-medium">{agent.paybackPeriod.toFixed(1)}mo</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-medium">{agent.accuracyScore}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Adoption</div>
                        <div className="font-medium">{agent.userAdoptionRate}%</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Business Impact Score</span>
                          <span>{agent.businessImpactScore}/100</span>
                        </div>
                        <Progress value={agent.businessImpactScore} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Revenue Impact: </span>
                          <span className="font-medium text-green-600">
                            +${(agent.revenueImpact / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk Mitigation: </span>
                          <span className="font-medium">
                            ${(agent.riskMitigation / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time to Value: </span>
                          <span className="font-medium">{agent.timeToValue} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedROIDashboard;