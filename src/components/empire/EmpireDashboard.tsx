import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// No dummy data. Charts render an empty state until real data is connected.
const revenueData: Array<{ month: string; pillar1: number; pillar2: number; pillar3: number }> = [];
const portfolioData: Array<{ name: string; value: number; color: string }> = [];

export function EmpireDashboard() {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <span>Monthly Revenue</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Monthly Revenue"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      Total revenue generated this month across the three pillars: IP Licensing, Equity Deals, and Acquisitions. Trend compares to last month.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-2xl font-bold text-primary">—</p>
                <p className="text-xs text-muted-foreground mt-1">Connect data to see revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <span>Active IP Licenses</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Active IP Licenses"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      Count of live licensing agreements monetizing your IP. “Pending renewal” highlights contracts expiring soon that may need attention.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-2xl font-bold text-accent">—</p>
                <p className="text-xs text-muted-foreground">Add licenses to track renewals</p>
              </div>
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <span>Equity Positions</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Equity Positions"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      Number of companies where you hold equity. Value is an estimated total based on latest valuations or book value.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-2xl font-bold text-secondary">—</p>
                <p className="text-xs text-muted-foreground">Track equity positions here</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <span>Portfolio Companies</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Portfolio Companies"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      Companies in your empire (majority and minority holdings). “Acquisition pending” indicates deals in diligence or under LOI.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Add companies or acquisitions</p>
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
              <span>Three Pillars Revenue Growth</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Help: Three Pillars Revenue Growth"
                    className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Stacked bars show monthly revenue by pillar: IP Licensing, Equity Deals, and Acquisitions. Hover the chart to see exact amounts.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                {revenueData.length === 0 ? (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground">No revenue data yet</text>
                ) : (
                  <>
                    <Bar dataKey="pillar1" fill="hsl(var(--primary))" name="pillar1" />
                    <Bar dataKey="pillar2" fill="hsl(var(--accent))" name="pillar2" />
                    <Bar dataKey="pillar3" fill="hsl(var(--secondary))" name="pillar3" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Revenue Portfolio Distribution</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Help: Revenue Portfolio Distribution"
                    className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Shows the share of total revenue by pillar for the selected period. Use this to balance IP, equity, and acquisition efforts.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                {portfolioData.length === 0 ? (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground">No portfolio distribution</text>
                ) : (
                  <>
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
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </>
                )}
              </PieChart>
            </ResponsiveContainer>
            {portfolioData.length > 0 && (
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Help: Quick Actions"
                    className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Handy shortcuts for weekly empire ops: review KPIs, update IP pipeline, analyze acquisition targets, and export portfolio reports.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Review Weekly Revenue Board
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-sm">
                Review KPIs, pipeline status, and blockers. Update targets and notes for the week.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Update IP License Pipeline
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-sm">
                Add prospects, move deals through stages, and schedule follow-ups for licensing.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Analyze Acquisition Targets
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-sm">
                Compare multiples, fit, and synergies. Capture diligence notes and next steps.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Generate Portfolio Report
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-sm">
                Export a snapshot of revenue, IP, equity positions, and recent milestones.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recent Milestones</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Help: Recent Milestones"
                    className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Key achievements and transactions across your empire. Entries can be added automatically from activity feeds or manually.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">No milestones yet.</div>
            <Button variant="outline" size="sm" className="w-fit">Add milestone</Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </TooltipProvider>
  );
}
