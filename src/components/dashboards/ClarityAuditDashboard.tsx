import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Eye, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

interface ClarityMetric {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  issues: number;
  description: string;
}

const ClarityAuditDashboard = () => {
  // Mock data for clarity audit
  const clarityMetrics: ClarityMetric[] = [
    {
      category: "Process Documentation",
      score: 85,
      status: 'good',
      issues: 3,
      description: "Standard operating procedures and workflows"
    },
    {
      category: "Role Definitions",
      score: 92,
      status: 'excellent',
      issues: 1,
      description: "Clear job descriptions and responsibilities"
    },
    {
      category: "Communication Protocols",
      score: 68,
      status: 'needs-improvement',
      issues: 7,
      description: "Meeting cadences and information flow"
    },
    {
      category: "Performance Metrics",
      score: 45,
      status: 'critical',
      issues: 12,
      description: "KPIs and measurement frameworks"
    },
    {
      category: "Decision Authority",
      score: 78,
      status: 'good',
      issues: 4,
      description: "Clear escalation and approval processes"
    },
    {
      category: "Technology Usage",
      score: 56,
      status: 'needs-improvement',
      issues: 8,
      description: "Tool adoption and best practices"
    }
  ];

  const overallScore = Math.round(clarityMetrics.reduce((sum, metric) => sum + metric.score, 0) / clarityMetrics.length);
  const totalIssues = clarityMetrics.reduce((sum, metric) => sum + metric.issues, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'good': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'needs-improvement': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'needs-improvement': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const statusDistribution = clarityMetrics.reduce((acc, metric) => {
    acc[metric.status] = (acc[metric.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.replace('-', ' '),
    value: count,
    color: status === 'excellent' ? '#10b981' : 
           status === 'good' ? '#3b82f6' :
           status === 'needs-improvement' ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Clarity Score</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallScore}%</div>
            <Progress value={overallScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clarityMetrics.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Areas requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellence Areas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clarityMetrics.filter(m => m.status === 'excellent').length}
            </div>
            <p className="text-xs text-muted-foreground">Well-defined processes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clarity Scores Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Clarity Scores by Category</CardTitle>
            <CardDescription>Organizational clarity assessment across key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clarityMetrics} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of clarity status across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Analysis</CardTitle>
          <CardDescription>Complete breakdown of clarity metrics and actionable insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clarityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(metric.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{metric.category}</h4>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Clarity Score</span>
                          <span>{metric.score}%</span>
                        </div>
                        <Progress value={metric.score} className="h-2" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{metric.issues} issues</div>
                        <div className="text-xs text-muted-foreground">to address</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClarityAuditDashboard;