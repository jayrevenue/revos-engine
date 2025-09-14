import { useState } from "react";
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
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Briefcase,
  Eye,
  Edit,
  Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const portfolioCompanies: Array<any> = [];

const performanceData: Array<any> = [];

const pipelineDeals: Array<any> = [];

export function PortfolioManager() {
  const [selectedCompany, setSelectedCompany] = useState<any | null>(portfolioCompanies[0] || null);

  const totalPortfolioValue = portfolioCompanies.reduce((sum, company) => sum + (company.value || 0), 0);
  const totalMonthlyRevenue = portfolioCompanies.reduce((sum, company) => sum + (company.monthlyRevenue || 0), 0);
  const averageMarginImprovement = portfolioCompanies.length === 0 ? 0 : (portfolioCompanies.reduce((sum, company) => sum + (company.metrics?.marginImprovement || 0), 0) / portfolioCompanies.length);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
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
                          <p className="text-sm font-medium">${(company.value / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">${(company.monthlyRevenue / 1000).toFixed(0)}K/mo</p>
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
                          <div className="flex items-center gap-2">
                            <CardTitle>{selectedCompany.name}</CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Help: Company details" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                                  <Info className="h-4 w-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start" className="max-w-sm">Key metrics, milestones, and performance for the selected company.</TooltipContent>
                            </Tooltip>
                          </div>
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
                        <TooltipContent side="top" align="end">Update company info and milestones.</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">Value
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} aria-label="Help: Value" className="inline-flex h-4 w-4 items-center justify-center cursor-help text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">Estimated enterprise value or stake value.</TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-xl font-bold">{selectedCompany?.value ? `$${(selectedCompany.value / 1000).toFixed(0)}K` : '—'}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">Monthly Revenue
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} aria-label="Help: Monthly Revenue metric" className="inline-flex h-4 w-4 items-center justify-center cursor-help text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">Average monthly revenue currently reported.</TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-xl font-bold">{selectedCompany?.monthlyRevenue ? `$${(selectedCompany.monthlyRevenue / 1000).toFixed(0)}K` : '—'}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">Margin Improvement
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} aria-label="Help: Margin Improvement" className="inline-flex h-4 w-4 items-center justify-center cursor-help text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">Improvement since implementation, percentage points.</TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-xl font-bold text-emerald-600">{selectedCompany?.metrics?.marginImprovement ? `+${selectedCompany.metrics.marginImprovement}%` : '—'}</p>
                    </div>
                  </div>

                  {/* Milestones Progress */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-medium">Implementation Progress</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label="Help: Implementation Progress" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                            <Info className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">Phase, milestones completed, and current focus item.</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Phase: {selectedCompany.phase}</span>
                        <Badge variant="outline">{selectedCompany.milestones.completed}/{selectedCompany.milestones.total} milestones</Badge>
                      </div>
                      <Progress value={(selectedCompany.milestones.completed / selectedCompany.milestones.total) * 100} />
                      <p className="text-sm text-muted-foreground">Current: {selectedCompany.milestones.current}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Margin Improvement</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">+{selectedCompany.metrics.marginImprovement}%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Forecast Accuracy</span>
                      </div>
                      <p className="text-lg font-bold">{selectedCompany.metrics.forecastAccuracy}%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">Payback Period</span>
                      </div>
                      <p className="text-lg font-bold">{selectedCompany.metrics.paybackPeriod} months</p>
                    </div>
                  </div>

                  {/* Next Actions */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">Next Review: {selectedCompany.nextReview}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quarterly business review to assess performance and plan next phase milestones.
                    </p>
                    <Button size="sm" className="mt-3">
                      Schedule Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Portfolio Performance Trends</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} aria-label="Help: Portfolio Performance Trends" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-sm">Revenue bars (left axis, $K) and margin line (right axis, %) over time. Hover to see values.</TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No performance data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" label={{ value: 'Revenue ($K)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Margin (%)', angle: 90, position: 'insideRight' }} />
                    <RechartsTooltip />
                    <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($K)" />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(var(--accent))" strokeWidth={3} name="Margin %" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="space-y-4">
            {pipelineDeals.length === 0 && (
              <p className="text-sm text-muted-foreground">No deals in pipeline.</p>
            )}
            {pipelineDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{deal.name}</h3>
                        <Badge variant="outline">{deal.type}</Badge>
                        <Badge variant={
                          deal.stage === 'Due Diligence' ? 'default' :
                          deal.stage === 'Negotiation' ? 'secondary' :
                          'outline'
                        }>
                          {deal.stage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{deal.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${(deal.value / 1000).toFixed(0)}K value</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{deal.probability}% probability</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} aria-label="Help: Probability" className="inline-flex h-4 w-4 items-center justify-center cursor-help text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">Close likelihood based on stage and signals.</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Close: {deal.closeDate}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} aria-label="Help: Close date" className="inline-flex h-4 w-4 items-center justify-center cursor-help text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">Estimated close date; adjust as deal progresses.</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold">${(deal.value / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">{deal.probability}% confidence</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm">
                          View Deal
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end">Open deal details and next steps.</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Deal Progress</span>
                    <span>{deal.probability}%</span>
                  </div>
                  <Progress value={deal.probability} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  );
}
