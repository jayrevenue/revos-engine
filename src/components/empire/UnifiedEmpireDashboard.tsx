import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Target,
  Crown,
  Briefcase,
  Users,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Calculator,
  Map,
  Brain,
  BookOpen,
  PieChart,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

// Three Pillar Performance Data
const threePillarData = [
  { name: "IP Licensing", current: 12500, target: 15000, deals: 5, color: "hsl(var(--accent))" },
  { name: "Equity Deals", current: 8750, target: 12000, deals: 2, color: "hsl(var(--secondary))" },
  { name: "Acquisitions", current: 5250, target: 8000, deals: 1, color: "hsl(var(--muted-foreground))" }
];

const monthlyTrend = [
  { month: "Jan", pillar1: 8000, pillar2: 5000, pillar3: 3000 },
  { month: "Feb", pillar1: 9500, pillar2: 6500, pillar3: 3500 },
  { month: "Mar", pillar1: 11000, pillar2: 7200, pillar3: 4200 },
  { month: "Apr", pillar1: 12500, pillar2: 8750, pillar3: 5250 },
];

const empirePhases = [
  { phase: "Foundation", progress: 85, status: "active" },
  { phase: "First Revenue", progress: 45, status: "active" },
  { phase: "Scale & Acquisitions", progress: 0, status: "pending" },
  { phase: "Empire Operations", progress: 0, status: "pending" }
];

const quickInsights = [
  {
    type: "opportunity",
    title: "Ready for Phase 3",
    description: "You've hit the Phase 2 revenue targets. Time to start acquisition planning.",
    action: "View Roadmap",
    urgency: "high"
  },
  {
    type: "success", 
    title: "IP License Milestone",
    description: "Just closed your 5th licensing deal - exceeding Q1 targets!",
    action: "Celebrate",
    urgency: "low"
  },
  {
    type: "warning",
    title: "Equity Deal Pipeline",
    description: "Only 1 equity deal in pipeline. Consider prospecting more opportunities.",
    action: "Open Calculator",
    urgency: "medium"
  }
];

const quickActions = [
  { title: "Calculate Revenue Scenario", icon: Calculator, href: "/calculator", color: "primary" },
  { title: "Review Empire Roadmap", icon: Map, href: "/empire", color: "accent" },
  { title: "Manage Portfolio", icon: PieChart, href: "/portfolio", color: "secondary" },
  { title: "AI Strategy Session", icon: Brain, href: "/assistant", color: "muted" }
];

export function UnifiedEmpireDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const navigate = useNavigate();
  
  const totalRevenue = threePillarData.reduce((sum, pillar) => sum + pillar.current, 0);
  const totalTarget = threePillarData.reduce((sum, pillar) => sum + pillar.target, 0);
  const progressToTarget = (totalRevenue / totalTarget) * 100;
  
  return (
    <div className="space-y-6 p-6">
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
                Phase 2: Active Revenue
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold text-primary">${(totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-sm text-emerald-600 flex items-center justify-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +22.5% vs target
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-3xl font-bold text-accent">{threePillarData.reduce((sum, p) => sum + p.deals, 0)}</p>
                <p className="text-sm text-muted-foreground">Across 3 pillars</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Phase Progress</p>
                <p className="text-3xl font-bold text-secondary">65%</p>
                <p className="text-sm text-muted-foreground">Phase 2 complete</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Next Milestone</p>
                <p className="text-lg font-semibold">First Acquisition</p>
                <p className="text-sm text-muted-foreground">8 weeks away</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Pillar Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {threePillarData.map((pillar, index) => (
          <Card key={pillar.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pillar.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {index === 0 && <Briefcase className="h-5 w-5 text-accent" />}
                  {index === 1 && <TrendingUp className="h-5 w-5 text-secondary" />}
                  {index === 2 && <Building2 className="h-5 w-5 text-muted-foreground" />}
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
                      {Math.round((pillar.current / pillar.target) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">to target</p>
                  </div>
                </div>
                <Progress value={(pillar.current / pillar.target) * 100} />
                <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/portfolio')}>
                  <Target className="h-4 w-4 mr-2" />
                  Manage Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Empire Phases Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Empire Building Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {empirePhases.map((phase, index) => (
              <div key={phase.phase} className="text-center p-4 rounded-lg bg-muted/20">
                <h4 className="font-medium mb-2">{phase.phase}</h4>
                <div className="mb-3">
                  <Progress value={phase.progress} className="h-2" />
                </div>
                <p className="text-sm font-semibold">{phase.progress}%</p>
                <Badge 
                  variant={phase.status === 'active' ? 'default' : 'outline'}
                  className="mt-2"
                >
                  {phase.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
