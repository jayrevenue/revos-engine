import { useState } from "react";
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
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  PieChart,
  BarChart3,
  Calendar,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";

interface PillarMetrics {
  current: number;
  target: number;
  growth: number;
  deals: number;
  avgDealSize: number;
  conversionRate: number;
  timeToClose: number;
}

interface ThreePillarData {
  pillar1: PillarMetrics; // IP Licensing
  pillar2: PillarMetrics; // Equity Deals  
  pillar3: PillarMetrics; // Acquisitions
}

// Remove mockData - using real data from useActivities hook

const pillarConfig = [
  {
    key: 'pillar1',
    name: 'IP Licensing',
    description: 'RevenueOS licensing to agencies & vendors',
    icon: Briefcase,
    color: 'hsl(var(--accent))',
    bgColor: 'from-accent/5 to-accent/10',
    borderColor: 'border-accent/20'
  },
  {
    key: 'pillar2', 
    name: 'Equity Deals',
    description: 'Milestone-based partnerships with growing companies',
    icon: TrendingUp,
    color: 'hsl(var(--secondary))',
    bgColor: 'from-secondary/5 to-secondary/10',
    borderColor: 'border-secondary/20'
  },
  {
    key: 'pillar3',
    name: 'Business Acquisitions',
    description: 'Acquiring profitable businesses for cash flow',
    icon: Building2,
    color: 'hsl(var(--muted-foreground))',
    bgColor: 'from-muted/5 to-muted/10',
    borderColor: 'border-muted/20'
  }
];

// Trends data will be generated from real activities

interface ThreePillarMetricsProps {
  showDetails?: boolean;
  compact?: boolean;
}

export function ThreePillarMetrics({ 
  showDetails = true, 
  compact = false 
}: ThreePillarMetricsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'performance'>('overview');
  const { metrics, loading, activities } = useActivities();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.totalItems === 0) {
    return (
      <EmptyState 
        icon={<BarChart3 className="h-12 w-12" />}
        title="No Portfolio Data"
        description="Add IP projects, equity deals, or acquisitions to see your three-pillar metrics."
        action={{
          label: "Get Started",
          onClick: () => window.location.href = '/start'
        }}
      />
    );
  }

  // Convert metrics to data format
  const data: ThreePillarData = {
    pillar1: {
      current: metrics.ipLicensing.value,
      target: metrics.ipLicensing.target,
      growth: 0, // Would need historical data to calculate
      deals: metrics.ipLicensing.count,
      avgDealSize: metrics.ipLicensing.count > 0 ? metrics.ipLicensing.value / metrics.ipLicensing.count : 0,
      conversionRate: 0, // Would need pipeline data
      timeToClose: 0 // Would need historical data
    },
    pillar2: {
      current: metrics.equityDeals.value,
      target: metrics.equityDeals.target,
      growth: 0,
      deals: metrics.equityDeals.count,
      avgDealSize: metrics.equityDeals.count > 0 ? metrics.equityDeals.value / metrics.equityDeals.count : 0,
      conversionRate: 0,
      timeToClose: 0
    },
    pillar3: {
      current: metrics.acquisitions.value,
      target: metrics.acquisitions.target,
      growth: 0,
      deals: metrics.acquisitions.count,
      avgDealSize: metrics.acquisitions.count > 0 ? metrics.acquisitions.value / metrics.acquisitions.count : 0,
      conversionRate: 0,
      timeToClose: 0
    }
  };

  const totalCurrent = data.pillar1.current + data.pillar2.current + data.pillar3.current;
  const totalTarget = data.pillar1.target + data.pillar2.target + data.pillar3.target;
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  
  const distributionData = pillarConfig.map(config => ({
    name: config.name,
    value: data[config.key as keyof ThreePillarData].current,
    percentage: totalCurrent > 0 ? Math.round((data[config.key as keyof ThreePillarData].current / totalCurrent) * 100) : 0,
    color: config.color
  }));

  // Generate trends data from current month
  const trendsData = [{
    month: new Date().toLocaleDateString('en-US', { month: 'short' }),
    pillar1: data.pillar1.current,
    pillar2: data.pillar2.current,
    pillar3: data.pillar3.current
  }];

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {pillarConfig.map((config) => {
              const pillarData = data[config.key as keyof ThreePillarData];
              const progress = (pillarData.current / pillarData.target) * 100;
              const Icon = config.icon;

              return (
                <div key={config.key} className="text-center space-y-2">
                  <Icon className="h-6 w-6 mx-auto" style={{ color: config.color }} />
                  <div>
                    <p className="text-lg font-bold">${(pillarData.current / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">{config.name}</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">${(totalCurrent / 1000).toFixed(1)}K</p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {overallProgress.toFixed(1)}% of target
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Individual Pillar Cards */}
        {pillarConfig.map((config) => {
          const pillarData = data[config.key as keyof ThreePillarData];
          const progress = (pillarData.current / pillarData.target) * 100;
          const Icon = config.icon;

          return (
            <Card key={config.key} className={`bg-gradient-to-br ${config.bgColor} ${config.borderColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{config.name}</p>
                    <p className="text-2xl font-bold" style={{ color: config.color }}>
                      ${(pillarData.current / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs flex items-center mt-1">
                      {pillarData.growth > 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span className={pillarData.growth > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {pillarData.growth > 0 ? '+' : ''}{pillarData.growth}%
                      </span>
                    </p>
                  </div>
                  <Icon className="h-8 w-8" style={{ color: config.color }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showDetails && (
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {distributionData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-4 h-4 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-lg font-bold">{item.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pillarConfig.map((config) => {
                      const pillarData = data[config.key as keyof ThreePillarData];
                      const progress = (pillarData.current / pillarData.target) * 100;

                      return (
                        <div key={config.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{config.name}</span>
                            <Badge variant="outline">
                              {pillarData.deals} active deal{pillarData.deals !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <Progress value={progress} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>${(pillarData.current / 1000).toFixed(1)}K of ${(pillarData.target / 1000).toFixed(1)}K</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  4-Month Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="pillar1" 
                      stroke={pillarConfig[0].color} 
                      strokeWidth={3}
                      name="IP Licensing" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pillar2" 
                      stroke={pillarConfig[1].color} 
                      strokeWidth={3}
                      name="Equity Deals" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pillar3" 
                      stroke={pillarConfig[2].color} 
                      strokeWidth={3}
                      name="Acquisitions" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {pillarConfig.map((config) => {
                const pillarData = data[config.key as keyof ThreePillarData];
                const Icon = config.icon;

                return (
                  <Card key={config.key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5" style={{ color: config.color }} />
                        {config.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Deal Size</p>
                          <p className="font-bold">${(pillarData.avgDealSize / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-bold">{pillarData.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time to Close</p>
                          <p className="font-bold">{pillarData.timeToClose} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Growth Rate</p>
                          <p className={`font-bold ${pillarData.growth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {pillarData.growth > 0 ? '+' : ''}{pillarData.growth}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Target</span>
                          <span>{Math.round((pillarData.current / pillarData.target) * 100)}%</span>
                        </div>
                        <Progress value={(pillarData.current / pillarData.target) * 100} />
                      </div>

                      <Button variant="outline" className="w-full" size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        Model Scenarios
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}