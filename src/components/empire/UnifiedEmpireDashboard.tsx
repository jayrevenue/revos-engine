import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useActivities } from "@/hooks/useActivities";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Target,
  Crown,
  Briefcase,
  Users,
  Calendar,
  ArrowUpRight,
  Brain,
  BookOpen,
  PieChart,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Plus,
  FileText,
  Handshake,
  ShoppingCart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function UnifiedEmpireDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const navigate = useNavigate();
  const { activities, metrics, loading } = useActivities();
  
  // Generate insights based on real data
  const generateInsights = () => {
    const insights = [];
    
    if (metrics.totalItems === 0) {
      insights.push({
        type: "opportunity",
        title: "Start Your Empire Journey",
        description: "Add your first IP project, equity deal, or acquisition target to begin tracking your empire growth.",
        action: "Quick Start",
        urgency: "high"
      });
    } else {
      // Check progress towards targets
      const ipProgress = (metrics.ipLicensing.value / metrics.ipLicensing.target) * 100;
      const equityProgress = (metrics.equityDeals.value / metrics.equityDeals.target) * 100;
      const acquisitionProgress = (metrics.acquisitions.value / metrics.acquisitions.target) * 100;
      
      if (ipProgress > 80) {
        insights.push({
          type: "success",
          title: "IP Licensing Milestone",
          description: `You're ${ipProgress.toFixed(0)}% towards your IP licensing target!`,
          action: "View Details",
          urgency: "low"
        });
      }
      
      if (metrics.highPriorityItems > 0) {
        insights.push({
          type: "warning",
          title: "High Priority Items",
          description: `You have ${metrics.highPriorityItems} high priority item${metrics.highPriorityItems > 1 ? 's' : ''} requiring attention.`,
          action: "Review Items",
          urgency: "medium"
        });
      }
      
      if (metrics.totalItems > 5 && metrics.acquisitions.count === 0) {
        insights.push({
          type: "opportunity",
          title: "Consider Acquisitions",
          description: "With your growing portfolio, it might be time to explore acquisition opportunities.",
          action: "Explore Options",
          urgency: "medium"
        });
      }
    }
    
    return insights;
  };

  const quickInsights = generateInsights();
  
  // Generate chart data from real activities
  const generateMonthlyTrend = () => {
    if (activities.length === 0) {
      return [];
    }
    
    // For now, show current month data - could be enhanced to show historical trends
    return [{
      month: new Date().toLocaleDateString('en-US', { month: 'short' }),
      pillar1: metrics.ipLicensing.value,
      pillar2: metrics.equityDeals.value,
      pillar3: metrics.acquisitions.value
    }];
  };

  const monthlyTrend = generateMonthlyTrend();

  const threePillarData = [
    { 
      name: "IP Licensing", 
      current: metrics.ipLicensing.value, 
      target: metrics.ipLicensing.target, 
      deals: metrics.ipLicensing.count, 
      color: "hsl(var(--accent))" 
    },
    { 
      name: "Equity Deals", 
      current: metrics.equityDeals.value, 
      target: metrics.equityDeals.target, 
      deals: metrics.equityDeals.count, 
      color: "hsl(var(--secondary))" 
    },
    { 
      name: "Acquisitions", 
      current: metrics.acquisitions.value, 
      target: metrics.acquisitions.target, 
      deals: metrics.acquisitions.count, 
      color: "hsl(var(--muted-foreground))" 
    }
  ];
  
  const totalRevenue = metrics.totalValue;
  
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Quick Start Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ready to Track Something New?</h3>
                <p className="text-muted-foreground">Add IP projects, equity deals, or acquisition targets to your portfolio</p>
              </div>
            </div>
            <Button onClick={() => navigate('/start')} className="bg-primary hover:bg-primary/90">
              Quick Start
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section - Empire Status */}
      <div className="relative">
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Revenue Expert Empire</h1>
                  <p className="text-muted-foreground">Building wealth through IP licensing, equity deals, and acquisitions</p>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                Active Portfolio
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold text-primary">${(totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-sm text-emerald-600 flex items-center justify-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +22.5% vs target
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-accent">{metrics.totalItems}</p>
                <p className="text-sm text-muted-foreground">{metrics.highPriorityItems} high priority</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <p className="text-3xl font-bold text-secondary">${(metrics.totalValue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Total tracked value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Pillar Performance with Quick Actions */}
      {metrics.totalItems === 0 ? (
        <EmptyState 
          icon={<Crown className="h-16 w-16" />}
          title="Start Building Your Empire"
          description="Add your first IP project, equity deal, or acquisition target to begin tracking your revenue empire growth."
          action={{
            label: "Add Your First Item",
            onClick: () => navigate('/start')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {threePillarData.map((pillar, index) => (
            <Card key={pillar.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pillar.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {index === 0 && <FileText className="h-5 w-5 text-accent" />}
                    {index === 1 && <Handshake className="h-5 w-5 text-secondary" />}
                    {index === 2 && <ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                    <Badge variant="outline">{pillar.deals} active</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">${(pillar.current / 1000).toFixed(1)}K</p>
                      <p className="text-sm text-muted-foreground">of ${(pillar.target / 1000).toFixed(0)}K target</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-600">
                        {pillar.target > 0 ? Math.round((pillar.current / pillar.target) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">to target</p>
                    </div>
                  </div>
                  <Progress value={pillar.target > 0 ? (pillar.current / pillar.target) * 100 : 0} />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm" 
                      onClick={() => navigate('/portfolio')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => navigate(`/start?type=${index === 0 ? 'ip' : index === 1 ? 'equity' : 'acquisition'}`)}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Add new items to track and grow your empire</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/start?type=ip')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                New IP
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/start?type=equity')}
                className="flex items-center gap-2"
              >
                <Handshake className="h-4 w-4" />
                Equity Deal
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/start?type=acquisition')}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Acquisition
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Empire Revenue Growth
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={selectedTimeframe === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedTimeframe === "quarterly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe("quarterly")}
                >
                  Quarterly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`,
                      name === 'pillar1' ? 'IP Licensing' : 
                      name === 'pillar2' ? 'Equity Deals' : 'Acquisitions'
                    ]}
                  />
                  <Bar dataKey="pillar1" fill="hsl(var(--accent))" name="pillar1" />
                  <Bar dataKey="pillar2" fill="hsl(var(--secondary))" name="pillar2" />
                  <Bar dataKey="pillar3" fill="hsl(var(--muted-foreground))" name="pillar3" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground">No revenue data to display</p>
                  <p className="text-sm text-muted-foreground">Add some activities to see your revenue trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights & Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickInsights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                insight.urgency === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                insight.urgency === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                'border-l-green-500 bg-green-50 dark:bg-green-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'opportunity' && <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-2xl font-bold text-primary">${(totalRevenue / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="text-sm font-semibold text-emerald-600">{metrics.totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUpRight className="h-5 w-5 text-accent" />
              Margin Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High Priority</span>
                <span className="text-2xl font-bold text-accent">{metrics.highPriorityItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Items</span>
                <span className="text-sm font-semibold text-emerald-600">{metrics.totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-secondary" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-2xl font-bold text-secondary">${(metrics.totalValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">IP Items</span>
                <span className="text-sm font-semibold text-emerald-600">{metrics.ipLicensing.count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">IP Value</span>
                <span className="text-xl font-bold text-primary">${(metrics.ipLicensing.value / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Equity Value</span>
                <span className="text-xl font-bold text-muted-foreground">${(metrics.equityDeals.value / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
              Avg Margin Boosts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Equity Deals</span>
                <span className="text-2xl font-bold text-accent">{metrics.equityDeals.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Acquisitions</span>
                <span className="text-sm font-semibold text-emerald-600">{metrics.acquisitions.count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-secondary" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Pipeline</span>
                <span className="text-2xl font-bold text-secondary">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Closing Soon</span>
                <span className="text-sm font-semibold text-primary">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Total IP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Frameworks</span>
                <span className="text-2xl font-bold text-primary">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Licensed</span>
                <span className="text-sm font-semibold text-emerald-600">18</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-accent" />
              Equity Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="text-2xl font-bold text-accent">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Value</span>
                <span className="text-sm font-semibold text-primary">$142K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-secondary" />
              Acquisitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-2xl font-bold text-secondary">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-semibold text-yellow-600">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
