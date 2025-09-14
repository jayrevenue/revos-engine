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
import { supabase } from "@/integrations/supabase/client";

type RevenuePoint = { month: string; total: number };

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
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">{thisMonthK ? `$${thisMonthK.toFixed(1)}K` : '—'}</p>
                {thisMonthK && (
                  <p className={`text-xs flex items-center mt-1 ${mom >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {mom >= 0 ? `+${mom}%` : `${mom}%`} from last month
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Engagements</p>
                <p className="text-2xl font-bold text-accent">{engCount ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Count of engagements</p>
              </div>
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-secondary">{projCount ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Count of projects</p>
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
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Add companies to track</p>
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
              <span>Revenue Growth</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Help: Revenue Growth"
                    className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Monthly revenue growth over the last 6 months. Values in thousands.
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
                <RechartsTooltip formatter={(v: any) => [`$${v}K`, 'Total Revenue']} />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Revenue Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
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
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.value}%</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Action Items & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Strategic Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Q4 Revenue Target</p>
                  <p className="text-xs text-muted-foreground">$2.5M across all pillars</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">85%</p>
                  <Progress value={85} className="w-20 h-2 mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">IP Portfolio Expansion</p>
                  <p className="text-xs text-muted-foreground">12 new patents filed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-accent">67%</p>
                  <Progress value={67} className="w-20 h-2 mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Portfolio Diversification</p>
                  <p className="text-xs text-muted-foreground">3 new acquisitions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary">40%</p>
                  <Progress value={40} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-grow">
                  <p className="font-medium text-sm">Patent Application Deadline</p>
                  <p className="text-xs text-muted-foreground">Due in 3 days</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-grow">
                  <p className="font-medium text-sm">Board Meeting Prep</p>
                  <p className="text-xs text-muted-foreground">Next week</p>
                </div>
                <Badge variant="secondary">Medium</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-grow">
                  <p className="font-medium text-sm">License Renewal</p>
                  <p className="text-xs text-muted-foreground">In 2 weeks</p>
                </div>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">New Document</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Add Company</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <ChevronRight className="h-6 w-6" />
              <span className="text-sm">View All</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}