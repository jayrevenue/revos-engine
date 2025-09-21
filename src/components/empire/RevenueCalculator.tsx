import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Calculator,
  Briefcase
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function RevenueCalculator() {
  // Simplified inputs - one per pillar
  const [ipLicenses, setIpLicenses] = useState({ count: 0, monthlyRoyalty: 0 });
  const [equityDeals, setEquityDeals] = useState({ count: 0, monthlyValue: 0 });
  const [acquisitions, setAcquisitions] = useState({ count: 0, monthlyCashFlow: 0 });

  // Calculate totals
  const pillar1Monthly = ipLicenses.count * ipLicenses.monthlyRoyalty;
  const pillar2Monthly = equityDeals.count * equityDeals.monthlyValue;
  const pillar3Monthly = acquisitions.count * acquisitions.monthlyCashFlow;
  const totalMonthly = pillar1Monthly + pillar2Monthly + pillar3Monthly;
  const totalAnnual = totalMonthly * 12;

  // Generate simple chart data
  const chartData = [
    { name: "IP Licensing", value: Math.round(pillar1Monthly / 1000), color: "#8b5cf6" },
    { name: "Equity Deals", value: Math.round(pillar2Monthly / 1000), color: "#06b6d4" },
    { name: "Acquisitions", value: Math.round(pillar3Monthly / 1000), color: "#84cc16" }
  ].filter(item => item.value > 0);

  const resetCalculator = () => {
    setIpLicenses({ count: 0, monthlyRoyalty: 0 });
    setEquityDeals({ count: 0, monthlyValue: 0 });
    setAcquisitions({ count: 0, monthlyCashFlow: 0 });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Total Revenue Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Total Revenue Projection</h2>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">${(totalMonthly / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <p className="text-xl font-semibold">${(totalAnnual / 1000).toFixed(0)}K annually</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Pillars Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: IP Licensing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5 text-purple-500" />
              IP Licensing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Number of Licenses</Label>
              <Input
                type="number"
                value={ipLicenses.count}
                onChange={(e) => setIpLicenses(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <Label className="text-sm">Monthly Royalty per License ($)</Label>
              <Input
                type="number"
                value={ipLicenses.monthlyRoyalty}
                onChange={(e) => setIpLicenses(prev => ({ ...prev, monthlyRoyalty: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 2500"
              />
            </div>
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                ${(pillar1Monthly / 1000).toFixed(1)}K/month
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 2: Equity Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Equity Deals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Number of Equity Positions</Label>
              <Input
                type="number"
                value={equityDeals.count}
                onChange={(e) => setEquityDeals(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <Label className="text-sm">Monthly Value per Position ($)</Label>
              <Input
                type="number"
                value={equityDeals.monthlyValue}
                onChange={(e) => setEquityDeals(prev => ({ ...prev, monthlyValue: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 4000"
              />
            </div>
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">
                ${(pillar2Monthly / 1000).toFixed(1)}K/month
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 3: Acquisitions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-green-500" />
              Acquisitions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Number of Owned Businesses</Label>
              <Input
                type="number"
                value={acquisitions.count}
                onChange={(e) => setAcquisitions(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <Label className="text-sm">Monthly Cash Flow per Business ($)</Label>
              <Input
                type="number"
                value={acquisitions.monthlyCashFlow}
                onChange={(e) => setAcquisitions(prev => ({ ...prev, monthlyCashFlow: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 6000"
              />
            </div>
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                ${(pillar3Monthly / 1000).toFixed(1)}K/month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Visualization */}
      {totalMonthly > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Revenue Breakdown
              </CardTitle>
              <Button variant="outline" size="sm" onClick={resetCalculator}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Revenue ($K)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip formatter={(value) => [`$${value}K`, 'Monthly Revenue']} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-xl font-bold">${(totalMonthly / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Annual Revenue</p>
                    <p className="text-xl font-bold">${(totalAnnual / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Revenue Sources:</h4>
                  {pillar1Monthly > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>IP Licensing ({ipLicenses.count} licenses)</span>
                      <span className="font-medium">${(pillar1Monthly / 1000).toFixed(1)}K</span>
                    </div>
                  )}
                  {pillar2Monthly > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Equity Deals ({equityDeals.count} positions)</span>
                      <span className="font-medium">${(pillar2Monthly / 1000).toFixed(1)}K</span>
                    </div>
                  )}
                  {pillar3Monthly > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Acquisitions ({acquisitions.count} businesses)</span>
                      <span className="font-medium">${(pillar3Monthly / 1000).toFixed(1)}K</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {totalMonthly === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Planning Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-emerald-600 mb-2">Start Small</h4>
                <div className="space-y-1 text-sm">
                  <p>• Begin with one pillar</p>
                  <p>• Focus on execution</p>
                  <p>• Build proven systems</p>
                  <p className="font-medium pt-2">Build your foundation</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-primary mb-2">Scale Up</h4>
                <div className="space-y-1 text-sm">
                  <p>• Add second pillar</p>
                  <p>• Optimize processes</p>
                  <p>• Increase deal flow</p>
                  <p className="font-medium pt-2">Expand your reach</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-blue-600 mb-2">Diversify</h4>
                <div className="space-y-1 text-sm">
                  <p>• All three pillars active</p>
                  <p>• Multiple revenue streams</p>
                  <p>• Compound growth</p>
                  <p className="font-medium pt-2">Empire status achieved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}