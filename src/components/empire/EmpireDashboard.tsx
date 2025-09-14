import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
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
<<<<<<< HEAD
import { supabase } from "@/integrations/supabase/client";

type RevenuePoint = { month: string; total: number };
=======
// No dummy data. Charts render an empty state until real data is connected.
const revenueData: Array<{ month: string; pillar1: number; pillar2: number; pillar3: number }> = [];
const portfolioData: Array<{ name: string; value: number; color: string }> = [];
>>>>>>> origin/main

export function EmpireDashboard() {
  const [monthly, setMonthly] = useState<RevenuePoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engCount, setEngCount] = useState<number | null>(null);
  const [projCount, setProjCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch revenue rows
        const { data, error } = await supabase
          .from('revenue')
          .select('amount, invoice_date, created_at, payment_status')
          .order('invoice_date', { ascending: true });
        if (error) throw error;
        const rows = data || [];

        // Aggregate monthly totals (last 6 months)
        const byMonth = new Map<string, number>();
        for (const r of rows) {
          const d = r.invoice_date || r.created_at;
          if (!d) continue;
          const dt = new Date(d);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          byMonth.set(key, (byMonth.get(key) || 0) + (r.amount || 0));
        }
        const keys = Array.from(byMonth.keys()).sort();
        const lastSix = keys.slice(-6);
        const monthlyPoints: RevenuePoint[] = lastSix.map((k) => {
          const [y, m] = k.split('-');
          const monthLabel = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString(undefined, { month: 'short' });
          return { month: monthLabel, total: Math.round((byMonth.get(k) || 0) / 1000) };
        });
        setMonthly(monthlyPoints);

        // Breakdown by payment_status (percentage share)
        const statusSums = new Map<string, number>();
        let total = 0;
        for (const r of rows) {
          const s = (r.payment_status || 'unknown').toLowerCase();
          const amt = r.amount || 0;
          total += amt;
          statusSums.set(s, (statusSums.get(s) || 0) + amt);
        }
        const colors: Record<string, string> = {
          paid: 'hsl(var(--primary))',
          pending: 'hsl(var(--accent))',
          overdue: 'hsl(var(--secondary))',
          unknown: 'hsl(var(--muted-foreground))',
        };
        const breakdown = Array.from(statusSums.entries()).map(([name, sum]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: total ? Math.round((sum / total) * 100) : 0,
          color: colors[name] || colors.unknown,
        }));
        setStatusBreakdown(breakdown);
        // counts for engagements and projects
        const [eC, pC] = await Promise.all([
          supabase.from('engagements').select('id'),
          supabase.from('projects').select('id'),
        ]);
        if (eC.error) throw eC.error;
        if (pC.error) throw pC.error;
        setEngCount(eC.data?.length || 0);
        setProjCount(pC.data?.length || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load revenue');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const thisMonthK = useMemo(() => (monthly.length ? monthly[monthly.length - 1].total : 0), [monthly]);
  const lastMonthK = useMemo(() => (monthly.length > 1 ? monthly[monthly.length - 2].total : 0), [monthly]);
  const mom = useMemo(() => (lastMonthK > 0 ? Math.round(((thisMonthK - lastMonthK) / lastMonthK) * 100) : 0), [thisMonthK, lastMonthK]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
<<<<<<< HEAD
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">{thisMonthK ? `$${thisMonthK.toFixed(1)}K` : '—'}</p>
                {thisMonthK && (
                  <p className={`text-xs flex items-center mt-1 ${mom >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {mom >= 0 ? `+${mom}%` : `${mom}%`} from last month
                  </p>
                )}
=======
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
>>>>>>> origin/main
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
<<<<<<< HEAD
                <p className="text-sm font-medium text-muted-foreground">Active Engagements</p>
                <p className="text-2xl font-bold text-accent">{engCount ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Count of engagements</p>
=======
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
>>>>>>> origin/main
              </div>
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
<<<<<<< HEAD
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-secondary">{projCount ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Count of projects</p>
=======
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
>>>>>>> origin/main
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
<<<<<<< HEAD
                <p className="text-sm font-medium text-muted-foreground">Portfolio Companies</p>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Add companies to track</p>
=======
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
>>>>>>> origin/main
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
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
<<<<<<< HEAD
                <RechartsTooltip formatter={(v: any) => [`$${v}K`, 'Total Revenue']} />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Revenue" />
=======
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
>>>>>>> origin/main
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
<<<<<<< HEAD
              Revenue Status Distribution
=======
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
>>>>>>> origin/main
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
<<<<<<< HEAD
                {statusBreakdown.length ? (
                  <>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                  </>
                ) : (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground">No revenue data yet</text>
                )}
              </PieChart>
            </ResponsiveContainer>
            {statusBreakdown.length ? (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {statusBreakdown.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
=======
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
>>>>>>> origin/main
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="text-lg font-bold">{item.value}%</p>
                  </div>
                ))}
              </div>
<<<<<<< HEAD
            ) : null}
=======
            )}
>>>>>>> origin/main
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
