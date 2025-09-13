import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, TrendingUp, Target, Users } from "lucide-react";

interface GapData {
  category: string;
  current: number;
  target: number;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  effort: number;
}

const GapMapDashboard = () => {
  // Mock data for gap analysis
  const gapData: GapData[] = [
    { category: "Sales Velocity", current: 65, target: 85, priority: 'high', impact: 90, effort: 60 },
    { category: "Lead Conversion", current: 45, target: 70, priority: 'high', impact: 85, effort: 40 },
    { category: "Customer Retention", current: 78, target: 90, priority: 'medium', impact: 75, effort: 70 },
    { category: "Process Automation", current: 30, target: 80, priority: 'high', impact: 95, effort: 80 },
    { category: "Data Quality", current: 55, target: 95, priority: 'medium', impact: 70, effort: 90 },
    { category: "Team Productivity", current: 70, target: 85, priority: 'low', impact: 60, effort: 50 }
  ];

  const getGapSize = (item: GapData) => item.target - item.current;
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const scatterData = gapData.map(item => ({
    x: item.effort,
    y: item.impact,
    category: item.category,
    gap: getGapSize(item),
    priority: item.priority
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {gapData.filter(item => item.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">High priority areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Gap Size</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(gapData.reduce((sum, item) => sum + getGapSize(item), 0) / gapData.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Points to target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scatterData.filter(item => item.y > 70 && item.x < 60).length}
            </div>
            <p className="text-xs text-muted-foreground">High impact, low effort</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas Analyzed</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gapData.length}</div>
            <p className="text-xs text-muted-foreground">Business categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gap Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Gap Analysis</CardTitle>
            <CardDescription>Current vs target performance by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" />
                <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impact vs Effort Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Impact vs Effort Matrix</CardTitle>
            <CardDescription>Prioritization based on impact and implementation effort</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Effort" domain={[0, 100]} />
                <YAxis dataKey="y" name="Impact" domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded shadow">
                          <p className="font-medium">{data.category}</p>
                          <p>Impact: {data.y}%</p>
                          <p>Effort: {data.x}%</p>
                          <p>Gap: {data.gap} points</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter dataKey="y" fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Gap List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Gap Analysis</CardTitle>
          <CardDescription>Complete breakdown of performance gaps and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gapData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.category}</h4>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority} priority
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Current: {item.current}%</span>
                      <span>Target: {item.target}%</span>
                      <span>Gap: {getGapSize(item)} points</span>
                    </div>
                    <Progress value={(item.current / item.target) * 100} className="h-2" />
                  </div>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-sm text-muted-foreground">Impact: {item.impact}%</div>
                  <div className="text-sm text-muted-foreground">Effort: {item.effort}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GapMapDashboard;