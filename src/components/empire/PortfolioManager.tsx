import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Briefcase,
  Eye,
  Edit,
  Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";

// Start empty; populate from Supabase below.
const initialCompanies: any[] = [];
const initialPerformance: any[] = [];
const initialPipeline: any[] = [];

export function PortfolioManager() {
  const [portfolioCompanies, setPortfolioCompanies] = useState<any[]>(initialCompanies);
  const [performanceData, setPerformanceData] = useState<any[]>(initialPerformance);
  const [pipelineDeals, setPipelineDeals] = useState<any[]>(initialPipeline);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPortfolioValue = portfolioCompanies.reduce((sum, company) => sum + (company.value || 0), 0);
  const totalMonthlyRevenue = portfolioCompanies.reduce((sum, company) => sum + (company.monthlyRevenue || 0), 0);
  const averageMarginImprovement = portfolioCompanies.length ? (portfolioCompanies.reduce((sum, company) => sum + (company.metrics?.marginImprovement || 0), 0) / portfolioCompanies.length) : 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [engR, projR, outR] = await Promise.all([
          supabase.from('engagements').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('outcomes').select('measurement_date, metric_name, current_value').order('measurement_date', { ascending: true }),
        ]);
        if (engR.error) throw engR.error;
        if (projR.error) throw projR.error;
        if (outR.error) throw outR.error;

        const engagements = engR.data || [];
        const projects = projR.data || [];

        const companies = [
          ...engagements.map((e: any) => ({
            id: e.id,
            name: e.name,
            type: 'Engagement',
            value: e.budget || 0,
            monthlyRevenue: 0,
            status: e.status || 'active',
            phase: e.status || 'active',
            milestones: { completed: 0, total: 0, current: '—' },
            metrics: { marginImprovement: 0 },
          })),
          ...projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: 'Project',
            value: p.budget || 0,
            monthlyRevenue: 0,
            status: p.status || 'active',
            phase: p.status || 'active',
            milestones: { completed: 0, total: 0, current: '—' },
            metrics: { marginImprovement: 0 },
          })),
        ];
        setPortfolioCompanies(companies);
        setSelectedCompany(companies[0] || null);

        const pipeline = [
          ...engagements.map((e: any) => ({
            id: e.id,
            name: e.name,
            type: 'Engagement',
            stage: e.status || 'Planning',
            value: e.budget || 0,
            probability: 0,
            closeDate: e.end_date,
            description: e.description || '',
          })),
          ...projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: 'Project',
            stage: p.status || 'Planning',
            value: p.budget || 0,
            probability: 0,
            closeDate: p.end_date,
            description: p.description || '',
          })),
        ];
        setPipelineDeals(pipeline);

        // Build performance series from outcomes: revenue ($K) and margin (%) by month
        const outcomes = outR.data || [];
        const byMonth: Record<string, { revenue: number; marginSum: number; marginCount: number }> = {};
        for (const o of outcomes) {
          if (!o.measurement_date) continue;
          const dt = new Date(o.measurement_date);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (!byMonth[key]) byMonth[key] = { revenue: 0, marginSum: 0, marginCount: 0 };
          const name = (o.metric_name || '').toLowerCase();
          const val = Number(o.current_value || 0);
          if (name.includes('revenue')) {
            byMonth[key].revenue += val;
          } else if (name.includes('margin')) {
            byMonth[key].marginSum += val;
            byMonth[key].marginCount += 1;
          }
        }
        const keys = Object.keys(byMonth).sort();
        const last = keys.slice(-6);
        const perf = last.map((k) => {
          const [y, m] = k.split('-');
          const month = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString(undefined, { month: 'short' });
          const bucket = byMonth[k];
          const revenueK = Math.round((bucket.revenue || 0) / 1000);
          const margin = bucket.marginCount ? Math.round(bucket.marginSum / bucket.marginCount) : 0;
          return { month, revenue: revenueK, margin };
        });
        setPerformanceData(perf);
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <span>Portfolio Value</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} aria-label="Help: Portfolio Value" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start">Sum of estimated values across all holdings.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-primary">{totalPortfolioValue > 0 ? `$${(totalPortfolioValue / 1000000).toFixed(1)}M` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Connect valuations to populate</p>
                </div>
                <PieChart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <span>Monthly Revenue</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} aria-label="Help: Monthly Revenue" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start">Aggregate monthly revenue across portfolio companies.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-accent">{totalMonthlyRevenue > 0 ? `$${(totalMonthlyRevenue / 1000).toFixed(0)}K` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Across {portfolioCompanies.length} companies</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <span>Avg Margin Boost</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} aria-label="Help: Avg Margin Boost" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start">Average margin improvement attributed to TRS implementation.</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-secondary">{averageMarginImprovement > 0 ? `${averageMarginImprovement.toFixed(0)}%` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Via TRS implementation</p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <span>Active Deals</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} aria-label="Help: Active Deals" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start">Open opportunities in pipeline (equity, acquisitions, licenses).</TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold">{pipelineDeals.length}</p>
                  <p className="text-xs text-muted-foreground">{pipelineDeals.length ? `$${(pipelineDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / 1000000).toFixed(1)}M pipeline` : 'No pipeline yet'}</p>
                </div>
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="companies">Portfolio Companies</TabsTrigger>
            <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
            <TabsTrigger value="pipeline">Deal Pipeline</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>Companies</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label="Help: Companies list" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                            <Info className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-sm">Select a company to view details. Status and phase indicate where each engagement stands.</TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {portfolioCompanies.length === 0 && (
                      <p className="text-sm text-muted-foreground">No companies yet.</p>
                    )}
                    {portfolioCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCompany && selectedCompany.id === company.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-muted-foreground">{company.type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={
                                company.status === 'active' ? 'default' :
                                company.status === 'acquired' ? 'secondary' :
                                'outline'
                              }>
                                {company.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{company.phase}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{company.value ? `$${(company.value / 1000).toFixed(0)}K` : '—'}</p>
                            <p className="text-xs text-muted-foreground">{company.monthlyRevenue ? `$${(company.monthlyRevenue / 1000).toFixed(0)}K/mo` : '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Company Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        {selectedCompany ? (
                          <>
                            <CardTitle>{selectedCompany.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{selectedCompany.type}</p>
                          </>
                        ) : (
                          <CardTitle>No company selected</CardTitle>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end">Open the full profile and history.</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end">Update company information and metrics.</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedCompany ? (
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold text-primary">{selectedCompany.value ? `$${(selectedCompany.value / 1000).toFixed(0)}K` : '—'}</p>
                            <p className="text-xs text-muted-foreground">Valuation</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold text-accent">{selectedCompany.monthlyRevenue ? `$${(selectedCompany.monthlyRevenue / 1000).toFixed(0)}K` : '—'}</p>
                            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold text-secondary">{selectedCompany.metrics?.marginImprovement || 0}%</p>
                            <p className="text-xs text-muted-foreground">Margin Boost</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold">{selectedCompany.milestones?.completed || 0}/{selectedCompany.milestones?.total || 0}</p>
                            <p className="text-xs text-muted-foreground">Milestones</p>
                          </div>
                        </div>

                        {/* Status & Milestones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Current Status</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Phase</span>
                                <Badge variant="secondary">{selectedCompany.phase}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Status</span>
                                <Badge variant={selectedCompany.status === 'active' ? 'default' : 'outline'}>
                                  {selectedCompany.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Current Milestone</span>
                                <span className="text-sm text-muted-foreground">{selectedCompany.milestones?.current || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Progress Overview</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Milestone Completion</span>
                                  <span>{selectedCompany.milestones?.completed || 0}/{selectedCompany.milestones?.total || 0}</span>
                                </div>
                                <Progress value={selectedCompany.milestones?.total ? (selectedCompany.milestones.completed / selectedCompany.milestones.total) * 100 : 0} />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Performance Score</span>
                                  <span>85%</span>
                                </div>
                                <Progress value={85} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Select a company to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Revenue Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value, name) => [`$${value}K`, name === 'revenue' ? 'Revenue' : 'Margin %']} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Margin Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Margin']} />
                      <Line type="monotone" dataKey="margin" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Deal Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pipelineDeals.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No deals in pipeline yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pipelineDeals.map((deal) => (
                      <div key={deal.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{deal.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{deal.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{deal.type}</Badge>
                              <Badge variant="secondary">{deal.stage}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{deal.value ? `$${(deal.value / 1000).toFixed(0)}K` : '—'}</p>
                            <p className="text-sm text-muted-foreground">{deal.probability}% probability</p>
                            {deal.closeDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Close: {new Date(deal.closeDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}