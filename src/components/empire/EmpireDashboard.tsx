import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  ArrowUpRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", pillar1: 2000, pillar2: 1000, pillar3: 500 },
  { month: "Feb", pillar1: 3000, pillar2: 2000, pillar3: 800 },
  { month: "Mar", pillar1: 4500, pillar2: 3500, pillar3: 1200 },
  { month: "Apr", pillar1: 6000, pillar2: 5000, pillar3: 2000 },
  { month: "May", pillar1: 8000, pillar2: 7500, pillar3: 3000 },
  { month: "Jun", pillar1: 12000, pillar2: 10000, pillar3: 4500 },
];

const portfolioData = [
  { name: "IP Licensing", value: 45, color: "hsl(var(--primary))" },
  { name: "Equity Deals", value: 35, color: "hsl(var(--accent))" },
  { name: "Acquisitions", value: 20, color: "hsl(var(--secondary))" },
];

export function EmpireDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">$26.5K</p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +18.2% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active IP Licenses</p>
                <p className="text-2xl font-bold text-accent">8</p>
                <p className="text-xs text-muted-foreground">2 pending renewal</p>
              </div>
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equity Positions</p>
                <p className="text-2xl font-bold text-secondary">4</p>
                <p className="text-xs text-muted-foreground">$2.1M total value</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Companies</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">1 acquisition pending</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Three Pillars Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    name === 'pillar1' ? 'IP Licensing' : 
                    name === 'pillar2' ? 'Equity Deals' : 'Acquisitions'
                  ]}
                />
                <Bar dataKey="pillar1" fill="hsl(var(--primary))" name="pillar1" />
                <Bar dataKey="pillar2" fill="hsl(var(--accent))" name="pillar2" />
                <Bar dataKey="pillar3" fill="hsl(var(--secondary))" name="pillar3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Revenue Portfolio Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {portfolioData.map((item, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-lg font-bold">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              Review Weekly Revenue Board
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Update IP License Pipeline
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Analyze Acquisition Targets
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Generate Portfolio Report
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">TechStack SaaS Equity Deal Closed</p>
                <p className="text-sm text-muted-foreground">2.5% equity for Revenue OS implementation</p>
                <Badge variant="secondary" className="mt-1">Yesterday</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">New IP License: RevOps Agency</p>
                <p className="text-sm text-muted-foreground">$3.2K monthly recurring revenue</p>
                <Badge variant="secondary" className="mt-1">3 days ago</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
              <div>
                <p className="font-medium">Phase 2 Milestone Completed</p>
                <p className="text-sm text-muted-foreground">IP Development phase 85% complete</p>
                <Badge variant="secondary" className="mt-1">1 week ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}