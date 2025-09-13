import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Calculator,
  Target,
  PieChart,
  BarChart3,
  Briefcase
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function RevenueCalculator() {
  // Pillar 1: IP Licensing
  const [licensees, setLicensees] = useState({
    agencies: { count: 5, avgRevenue: 50000, royalty: 4 },
    rcmVendors: { count: 3, avgRevenue: 80000, royalty: 3 },
    msps: { count: 8, avgRevenue: 30000, royalty: 5 }
  });

  // Pillar 2: Outcomes-as-Product
  const [equityDeals, setEquityDeals] = useState({
    small: { count: 2, arr: 2000000, equity: 2.0, multiple: 6 },
    medium: { count: 1, arr: 5000000, equity: 1.5, multiple: 8 },
    large: { count: 1, arr: 10000000, equity: 1.0, multiple: 10 }
  });

  // Pillar 3: Business Ownership
  const [businesses, setBusinesses] = useState({
    rcmVendors: { count: 1, cashFlow: 15000, mgmtFee: 10 },
    compliance: { count: 1, cashFlow: 12000, mgmtFee: 10 },
    microSaas: { count: 1, cashFlow: 8000, mgmtFee: 10 }
  });

  const [timeHorizon, setTimeHorizon] = useState(24); // months

  // Calculate Pillar 1 Revenue
  const pillar1Monthly = Object.values(licensees).reduce((total, licensee) => {
    return total + (licensee.count * licensee.avgRevenue * licensee.royalty / 100);
  }, 0);

  // Calculate Pillar 2 Revenue (annual equity value / 12)
  const pillar2Monthly = Object.values(equityDeals).reduce((total, deal) => {
    const annualValue = deal.count * deal.arr * (deal.equity / 100) * deal.multiple;
    return total + (annualValue / 12);
  }, 0);

  // Calculate Pillar 3 Revenue
  const pillar3Monthly = Object.values(businesses).reduce((total, business) => {
    return total + (business.count * business.cashFlow * (1 - business.mgmtFee / 100));
  }, 0);

  const totalMonthly = pillar1Monthly + pillar2Monthly + pillar3Monthly;
  const totalAnnual = totalMonthly * 12;

  // Generate projection data
  const projectionData = Array.from({ length: timeHorizon }, (_, i) => {
    const month = i + 1;
    const growthFactor = 1 + (month * 0.02); // 2% growth per month
    return {
      month: `M${month}`,
      pillar1: Math.round((pillar1Monthly * growthFactor) / 1000),
      pillar2: Math.round((pillar2Monthly * growthFactor) / 1000),
      pillar3: Math.round((pillar3Monthly * growthFactor) / 1000),
      total: Math.round((totalMonthly * growthFactor) / 1000)
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Monthly</p>
                <p className="text-2xl font-bold text-primary">${(totalMonthly / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">${(totalAnnual / 1000).toFixed(0)}K annually</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP Licensing</p>
                <p className="text-2xl font-bold text-accent">${(pillar1Monthly / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">{Math.round((pillar1Monthly / totalMonthly) * 100)}% of total</p>
              </div>
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equity Deals</p>
                <p className="text-2xl font-bold text-secondary">${(pillar2Monthly / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">{Math.round((pillar2Monthly / totalMonthly) * 100)}% of total</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acquisitions</p>
                <p className="text-2xl font-bold">${(pillar3Monthly / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">{Math.round((pillar3Monthly / totalMonthly) * 100)}% of total</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Revenue Calculator</TabsTrigger>
          <TabsTrigger value="projections">Growth Projections</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar 1: IP Licensing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-accent" />
                  Pillar 1: IP Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(licensees).map(([key, data]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Count</Label>
                        <Input 
                          type="number"
                          value={data.count}
                          onChange={(e) => setLicensees(prev => ({
                            ...prev,
                            [key]: { ...prev[key], count: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Avg Revenue</Label>
                        <Input 
                          type="number"
                          value={data.avgRevenue}
                          onChange={(e) => setLicensees(prev => ({
                            ...prev,
                            [key]: { ...prev[key], avgRevenue: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Royalty %</Label>
                        <Input 
                          type="number"
                          value={data.royalty}
                          onChange={(e) => setLicensees(prev => ({
                            ...prev,
                            [key]: { ...prev[key], royalty: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Monthly: ${((data.count * data.avgRevenue * data.royalty / 100) / 1000).toFixed(1)}K
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    Total: ${(pillar1Monthly / 1000).toFixed(1)}K/month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pillar 2: Outcomes-as-Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Pillar 2: Equity Deals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(equityDeals).map(([key, data]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key} Companies</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Count</Label>
                        <Input 
                          type="number"
                          value={data.count}
                          onChange={(e) => setEquityDeals(prev => ({
                            ...prev,
                            [key]: { ...prev[key], count: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ARR</Label>
                        <Input 
                          type="number"
                          value={data.arr}
                          onChange={(e) => setEquityDeals(prev => ({
                            ...prev,
                            [key]: { ...prev[key], arr: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Equity %</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={data.equity}
                          onChange={(e) => setEquityDeals(prev => ({
                            ...prev,
                            [key]: { ...prev[key], equity: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Multiple</Label>
                        <Input 
                          type="number"
                          value={data.multiple}
                          onChange={(e) => setEquityDeals(prev => ({
                            ...prev,
                            [key]: { ...prev[key], multiple: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Value: ${((data.arr * (data.equity / 100) * data.multiple) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                    Total: ${(pillar2Monthly / 1000).toFixed(1)}K/month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pillar 3: Business Ownership */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  Pillar 3: Acquisitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(businesses).map(([key, data]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Count</Label>
                        <Input 
                          type="number"
                          value={data.count}
                          onChange={(e) => setBusinesses(prev => ({
                            ...prev,
                            [key]: { ...prev[key], count: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cash Flow</Label>
                        <Input 
                          type="number"
                          value={data.cashFlow}
                          onChange={(e) => setBusinesses(prev => ({
                            ...prev,
                            [key]: { ...prev[key], cashFlow: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Mgmt Fee %</Label>
                        <Input 
                          type="number"
                          value={data.mgmtFee}
                          onChange={(e) => setBusinesses(prev => ({
                            ...prev,
                            [key]: { ...prev[key], mgmtFee: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Net: ${((data.count * data.cashFlow * (1 - data.mgmtFee / 100)) / 1000).toFixed(1)}K
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Badge variant="secondary" className="bg-muted/20">
                    Total: ${(pillar3Monthly / 1000).toFixed(1)}K/month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Growth Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Time Horizon (months)</Label>
                <Input 
                  type="number"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 12)}
                  className="w-32 mt-1"
                />
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Revenue ($K)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`$${value}K`, 'Revenue']} />
                  <Line type="monotone" dataKey="pillar1" stroke="hsl(var(--accent))" name="IP Licensing" />
                  <Line type="monotone" dataKey="pillar2" stroke="hsl(var(--secondary))" name="Equity Deals" />
                  <Line type="monotone" dataKey="pillar3" stroke="hsl(var(--muted-foreground))" name="Acquisitions" />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-600">Conservative Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">3 IP licenses, 1 equity deal, 1 acquisition</p>
                  <p className="text-2xl font-bold text-emerald-600">$18K/month</p>
                  <p className="text-sm">$216K annually</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Target Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">8 IP licenses, 3 equity deals, 2 acquisitions</p>
                  <p className="text-2xl font-bold text-primary">${(totalMonthly / 1000).toFixed(0)}K/month</p>
                  <p className="text-sm">${(totalAnnual / 1000).toFixed(0)}K annually</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Optimistic Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">15 IP licenses, 5 equity deals, 4 acquisitions</p>
                  <p className="text-2xl font-bold text-blue-600">$95K/month</p>
                  <p className="text-sm">$1.14M annually</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}