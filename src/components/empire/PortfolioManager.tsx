import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export function PortfolioManager() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardAssetType, setWizardAssetType] = useState<'ip'|'equity'|'acq'|null>(null);
  const [wizardName, setWizardName] = useState('');
  const [wizardBudget, setWizardBudget] = useState<number | ''>('');

  const totalPortfolioValue = companies.reduce((sum, c) => sum + (c.value || 0), 0);
  const totalMonthlyRevenue = companies.reduce((sum, c) => sum + (c.monthlyRevenue || 0), 0);
  const averageMarginImprovement = companies.length
    ? companies.reduce((sum, c) => sum + (c.metrics?.marginImprovement || 0), 0) / companies.length
    : 0;

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const [engR, projR, outR] = await Promise.all([
          supabase.from("engagements").select("*").order("created_at", { ascending: false }),
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase
            .from("outcomes")
            .select("measurement_date, metric_name, current_value")
            .order("measurement_date", { ascending: true }),
        ]);
        if (engR.error) throw engR.error;
        if (projR.error) throw projR.error;
        if (outR.error) throw outR.error;

        const engagements = engR.data || [];
        const projects = projR.data || [];

        const mapped = [
          ...engagements.map((e: any) => ({
            id: e.id,
            name: e.name,
            type: "Engagement",
            value: e.budget || 0,
            monthlyRevenue: 0,
            status: e.status || "active",
            phase: e.status || "active",
            milestones: { completed: 0, total: 0, current: "—" },
            metrics: { marginImprovement: 0, forecastAccuracy: 0, paybackPeriod: 0 },
            nextReview: e.end_date || "—",
          })),
          ...projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: "Project",
            value: p.budget || 0,
            monthlyRevenue: 0,
            status: p.status || "active",
            phase: p.status || "active",
            milestones: { completed: 0, total: 0, current: "—" },
            metrics: { marginImprovement: 0, forecastAccuracy: 0, paybackPeriod: 0 },
            nextReview: p.end_date || "—",
          })),
        ];
        setCompanies(mapped);
        setSelectedCompany(mapped[0] || null);

        const pipe = [
          ...engagements.map((e: any) => ({
            id: e.id,
            name: e.name,
            type: "Engagement",
            stage: e.status || "Planning",
            value: e.budget || 0,
            probability: 0,
            closeDate: e.end_date || "—",
            description: e.description || "",
            assetType: classifyAssetType(e.name, e.description),
          })),
          ...projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: "Project",
            stage: p.status || "Planning",
            value: p.budget || 0,
            probability: 0,
            closeDate: p.end_date || "—",
            description: p.description || "",
            assetType: classifyAssetType(p.name, p.description),
          })),
        ];
        setPipeline(pipe);

        // Build performance data from outcomes (revenue and margin trends)
        const outcomes = outR.data || [];
        const byMonth: Record<string, { revenue: number; marginSum: number; marginCount: number }> = {};
        for (const o of outcomes) {
          if (!o.measurement_date) continue;
          const dt = new Date(o.measurement_date);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
          if (!byMonth[key]) byMonth[key] = { revenue: 0, marginSum: 0, marginCount: 0 };
          const name = (o.metric_name || "").toLowerCase();
          const val = Number(o.current_value || 0);
          if (name.includes("revenue")) byMonth[key].revenue += val;
          if (name.includes("margin")) {
            byMonth[key].marginSum += val;
            byMonth[key].marginCount += 1;
          }
        }
        const keys = Object.keys(byMonth).sort();
        const last = keys.slice(-6);
        setPerformanceData(
          last.map((k) => {
            const [y, m] = k.split("-");
            const month = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString(undefined, { month: "short" });
            const bucket = byMonth[k];
            return {
              month,
              revenue: Math.round((bucket.revenue || 0) / 1000),
              margin: bucket.marginCount ? Math.round(bucket.marginSum / bucket.marginCount) : 0,
            };
          })
        );
      } catch (err: any) {
        setError(err.message || "Failed to load portfolio");
      }
    };
    load();
  }, []);

  function classifyAssetType(name?: string, description?: string): 'ip'|'equity'|'acq'|'other' {
    const text = `${name || ''} ${description || ''}`.toLowerCase();
    if (/(ip|license|licensing)/.test(text)) return 'ip';
    if (/(equity|stake|shares)/.test(text)) return 'equity';
    if (/(acquisition|acquire|buyout|merger)/.test(text)) return 'acq';
    return 'other';
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold text-primary">{totalPortfolioValue ? `$${(totalPortfolioValue / 1_000_000).toFixed(1)}M` : "—"}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-accent">{totalMonthlyRevenue ? `$${(totalMonthlyRevenue / 1000).toFixed(0)}K` : "—"}</p>
                <p className="text-xs text-muted-foreground">Across {companies.length} companies</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Margin Boost</p>
                <p className="text-2xl font-bold text-secondary">{averageMarginImprovement ? `${averageMarginImprovement.toFixed(0)}%` : "—"}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{pipeline.length}</p>
                <p className="text-xs text-muted-foreground">
                  {pipeline.length ? `$${(pipeline.reduce((s, d) => s + (d.value || 0), 0) / 1_000_000).toFixed(1)}M pipeline` : "No pipeline yet"}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" onClick={() => { setWizardOpen(true); setWizardStep(1); }}>Add Asset</Button>
      </div>
      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="companies">Portfolio Companies</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="pipeline">Deal Pipeline</TabsTrigger>
          <TabsTrigger value="ip">IP Licensing</TabsTrigger>
          <TabsTrigger value="equity">Equity Deals</TabsTrigger>
          <TabsTrigger value="acq">Acquisitions</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No companies yet.</p>
                  )}
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCompany && selectedCompany.id === company.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{company.name}</h4>
                          <p className="text-sm text-muted-foreground">{company.type}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={company.status === "active" ? "default" : company.status === "acquired" ? "secondary" : "outline"}>
                              {company.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{company.phase}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{company.value ? `$${(company.value / 1000).toFixed(0)}K` : "—"}</p>
                          <p className="text-xs text-muted-foreground">{company.monthlyRevenue ? `$${(company.monthlyRevenue / 1000).toFixed(0)}K/mo` : "—"}</p>
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="text-xl font-bold">{selectedCompany?.value ? `$${(selectedCompany.value / 1000).toFixed(0)}K` : "—"}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-xl font-bold">{selectedCompany?.monthlyRevenue ? `$${(selectedCompany.monthlyRevenue / 1000).toFixed(0)}K` : "—"}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Margin Improvement</p>
                      <p className="text-xl font-bold text-emerald-600">{selectedCompany?.metrics?.marginImprovement ? `+${selectedCompany.metrics.marginImprovement}%` : "—"}</p>
                    </div>
                  </div>

                  {/* Milestones Progress */}
                  <div>
                    <h4 className="font-medium mb-3">Implementation Progress</h4>
                    <div className="space-y-3">
                      {selectedCompany ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Phase: {selectedCompany.phase}</span>
                            <Badge variant="outline">{selectedCompany.milestones.completed}/{selectedCompany.milestones.total} milestones</Badge>
                          </div>
                          <Progress value={selectedCompany.milestones.total ? (selectedCompany.milestones.completed / selectedCompany.milestones.total) * 100 : 0} />
                          <p className="text-sm text-muted-foreground">Current: {selectedCompany.milestones.current}</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No company selected.</p>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Margin Improvement</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{selectedCompany?.metrics?.marginImprovement ? `+${selectedCompany.metrics.marginImprovement}%` : "—"}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">Forecast Accuracy</span>
                      </div>
                      <p className="text-lg font-bold">{selectedCompany?.metrics?.forecastAccuracy ?? "—"}{selectedCompany?.metrics?.forecastAccuracy ? "%" : ""}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">Payback Period</span>
                      </div>
                      <p className="text-lg font-bold">{selectedCompany?.metrics?.paybackPeriod ? `${selectedCompany.metrics.paybackPeriod} months` : "—"}</p>
                    </div>
                  </div>

                  {/* Next Actions */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">Next Review: {selectedCompany?.nextReview ?? "—"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quarterly business review to assess performance and plan next phase milestones.
                    </p>
                    <Button size="sm" className="mt-3">Schedule Review</Button>
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
                Portfolio Performance Trends
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
                    <YAxis yAxisId="left" label={{ value: "Revenue ($K)", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: "Margin (%)", angle: 90, position: "insideRight" }} />
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
            {pipeline.length === 0 && <p className="text-sm text-muted-foreground">No deals in pipeline.</p>}
            {pipeline.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{deal.name}</h3>
                        <Badge variant="outline">{deal.type}</Badge>
                        <Badge variant={deal.stage === "Due Diligence" ? "default" : deal.stage === "Negotiation" ? "secondary" : "outline"}>
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
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Close: {deal.closeDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold">${(deal.value / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">{deal.probability}% confidence</p>
                      </div>
                      <Button size="sm">View Deal</Button>
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

        <TabsContent value="ip" className="space-y-6">
          {pipeline.filter(d => d.assetType === 'ip').length === 0 ? (
            <p className="text-sm text-muted-foreground">No IP licensing items yet.</p>
          ) : (
            pipeline.filter(d => d.assetType === 'ip').map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                    <Badge variant="outline">{deal.stage}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="equity" className="space-y-6">
          {pipeline.filter(d => d.assetType === 'equity').length === 0 ? (
            <p className="text-sm text-muted-foreground">No equity deals yet.</p>
          ) : (
            pipeline.filter(d => d.assetType === 'equity').map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                    <Badge variant="outline">{deal.stage}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="acq" className="space-y-6">
          {pipeline.filter(d => d.assetType === 'acq').length === 0 ? (
            <p className="text-sm text-muted-foreground">No acquisitions yet.</p>
          ) : (
            pipeline.filter(d => d.assetType === 'acq').map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                    <Badge variant="outline">{deal.stage}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Onboarding Wizard */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={() => setWizardOpen(false)}>
          <div className="bg-background border rounded-lg max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Asset</h3>
              <button className="text-sm text-muted-foreground" onClick={() => setWizardOpen(false)}>Close</button>
            </div>
            {wizardStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">What type of asset is it?</p>
                <div className="flex gap-2">
                  <Button variant={wizardAssetType==='ip'? 'default':'outline'} onClick={() => setWizardAssetType('ip')}>IP Licensing</Button>
                  <Button variant={wizardAssetType==='equity'? 'default':'outline'} onClick={() => setWizardAssetType('equity')}>Equity Deal</Button>
                  <Button variant={wizardAssetType==='acq'? 'default':'outline'} onClick={() => setWizardAssetType('acq')}>Acquisition</Button>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setWizardStep(2)} disabled={!wizardAssetType}>Next</Button>
                </div>
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input className="w-full border rounded px-3 py-2 bg-background" value={wizardName} onChange={(e)=>setWizardName(e.target.value)} placeholder="e.g., RevOps Agency License" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Budget / Value (optional)</label>
                  <input className="w-full border rounded px-3 py-2 bg-background" type="number" value={wizardBudget} onChange={(e)=>setWizardBudget(e.target.value===''? '': Number(e.target.value))} placeholder="e.g., 250000" />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                  <Button onClick={() => setWizardStep(3)} disabled={!wizardName}>Next</Button>
                </div>
              </div>
            )}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm">Confirm and add to pipeline:</p>
                <ul className="text-sm text-muted-foreground">
                  <li>Type: {wizardAssetType === 'ip' ? 'IP Licensing' : wizardAssetType === 'equity' ? 'Equity Deal' : 'Acquisition'}</li>
                  <li>Name: {wizardName}</li>
                  <li>Value: {wizardBudget ? `$${wizardBudget.toLocaleString()}` : '—'}</li>
                </ul>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setWizardStep(2)}>Back</Button>
                  <Button onClick={() => {
                    const newItem = {
                      id: `local-${Date.now()}`,
                      name: wizardName,
                      type: 'Pipeline',
                      stage: 'Planning',
                      value: wizardBudget || 0,
                      probability: 0,
                      closeDate: '—',
                      description: '',
                      assetType: wizardAssetType,
                    } as any;
                    setPipeline(prev => [newItem, ...prev]);
                    setWizardOpen(false);
                    setWizardStep(1);
                    setWizardAssetType(null);
                    setWizardName('');
                    setWizardBudget('');
                  }}>Add to Pipeline</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
