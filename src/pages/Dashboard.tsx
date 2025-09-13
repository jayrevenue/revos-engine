import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  DollarSign, 
  Target,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronRight,
  Calendar,
  Download,
  Bot,
  FileText,
  Briefcase,
  Building,
  RefreshCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [engagementStats, setEngagementStats] = useState<{active:number; paused:number; complete:number}>({active:0, paused:0, complete:0});
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadUpcoming();
      loadEngagementStats();
    }
  }, [user]);

  const loadUpcoming = async () => {
    try {
      const today = new Date();
      const start = new Date(today); start.setHours(0,0,0,0);
      const end = new Date(today); end.setDate(end.getDate()+7); end.setHours(23,59,59,999);
      const { data, error } = await supabase
        .from('events')
        .select('id,title,start_time')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (err) {
      console.error('Failed to load upcoming events', err);
    }
  };

  const loadEngagementStats = async () => {
    try {
      const { data, error } = await supabase.from('engagements').select('status');
      if (error) throw error;
      const stats = {active:0, paused:0, complete:0};
      (data || []).forEach((row: any) => {
        if (row.status && stats[row.status as keyof typeof stats] !== undefined) (stats as any)[row.status]++;
      });
      setEngagementStats(stats);
    } catch (err) {
      console.error('Failed to load engagement stats', err);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    try {
      setGoalsLoading(true);
      const { data, error } = await supabase.functions.invoke('todays-goals', { body: {} });
      if (error) throw error;
      setGoals(data?.tasks || []);
    } catch (err: any) {
      console.error('Failed to load goals', err);
      toast({ title: 'Could not generate goals', description: err.message || 'Try again shortly', variant: 'destructive' });
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadGoals();
  }, [user]);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/auth');
    }
  };

  // Statistics data
  const stats = [
    {
      title: "Total Revenue Pipeline",
      value: "$2.4M",
      change: "+12%",
      icon: DollarSign,
      onClick: () => navigate('/revenue')
    },
    {
      title: "Active Engagements",
      value: "23",
      change: "+3",
      icon: Briefcase,
      onClick: () => navigate('/engagements')
    },
    {
      title: "Client Organizations",
      value: "18",
      change: "+2",
      icon: Building,
      onClick: () => navigate('/clients')
    },
    {
      title: "AI Agents Deployed",
      value: "7",
      change: "+2",
      icon: Bot,
      onClick: () => navigate('/agents')
    }
  ];

  // Recent activity data
  const recentActivity = [
    {
      action: "New engagement created",
      company: "TechCorp Solutions",
      time: "2 hours ago"
    },
    {
      action: "Revenue milestone achieved",
      company: "Global Industries",
      time: "4 hours ago"
    },
    {
      action: "AI Agent deployed",
      company: "StartupCo",
      time: "1 day ago"
    },
    {
      action: "Client meeting scheduled",
      company: "Enterprise LLC",
      time: "2 days ago"
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Operational Flow CTA */}
      <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Get started with Onboarding</h3>
          <p className="text-sm text-muted-foreground">Create a new engagement in minutes with our guided wizard.</p>
        </div>
        <button className="px-4 py-2 border rounded-md hover:bg-muted" onClick={() => navigate('/onboarding')}>
          Open Onboarding
        </button>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-card p-6 rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (wide) */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
            <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted" onClick={() => navigate('/analytics')}>
              View Analytics
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/engagements')}>
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Today’s Goals (AI-generated) */}
        <div className="bg-card rounded-lg border border-border p-0 overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today’s Goals</CardTitle>
                <CardDescription>AI-generated priorities to stay on track</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadGoals} disabled={goalsLoading}>
                <RefreshCcw className={`w-4 h-4 mr-2 ${goalsLoading ? 'animate-spin' : ''}`} />
                {goalsLoading ? 'Generating' : 'Regenerate'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="divide-y">
                {goalsLoading && (
                  <div className="p-4 text-sm text-muted-foreground">Analyzing your data and generating goals…</div>
                )}
                {!goalsLoading && goals.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground">No goals generated. Try again in a moment.</div>
                )}
                {!goalsLoading && goals.map((task, idx) => {
                  const done = !!completed[task.id || idx];
                  const priority = String(task.priority || 'medium').toLowerCase();
                  const priColor = priority === 'critical' ? 'bg-red-500' : priority === 'high' ? 'bg-orange-500' : priority === 'low' ? 'bg-green-500' : 'bg-yellow-500';
                  const type = String(task.type || 'general');
                  const due = task.due_date ? new Date(task.due_date) : null;
                  return (
                    <div key={task.id || idx} className="p-4 flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(task.id || String(idx))}
                        className={`mt-1 rounded-full border w-5 h-5 flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                        aria-label="Mark complete"
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${priColor}`}></span>
                          <p className={`font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                        </div>
                        {task.reason && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.reason}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{type}</Badge>
                          {due && (
                            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Due {due.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </div>

        {/* Recent Activity */}
        

        {/* Revenue Trend (compact) */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate('/analytics')}>
                <Calendar className="w-4 h-4 mr-1" />
                Last 30 days
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => exportDashboardCSV()}>
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="h-40 bg-muted rounded-lg flex items-center justify-center border border-border cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">View detailed analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Create Engagement", description: "Start a new client engagement", onClick: () => navigate('/engagements/new') },
            { title: "Deploy AI Agent", description: "Launch an intelligent revenue agent", onClick: () => navigate('/agents/new') },
            { title: "View Analytics", description: "Analyze revenue performance data", onClick: () => navigate('/analytics') }
          ].map((action, index) => (
            <button 
              key={index} 
              onClick={action.onClick}
              className="text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <h4 className="font-medium text-foreground mb-1">{action.title}</h4>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Extra Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Engagement Status</h3>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-2 py-1 rounded bg-green-100 text-green-800">Active {engagementStats.active}</span>
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Paused {engagementStats.paused}</span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Complete {engagementStats.complete}</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Upcoming (7 days)</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev:any) => (
                <div key={ev.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{ev.title}</span>
                  <span className="text-muted-foreground">{new Date(ev.start_time).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Shortcuts</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button className="px-3 py-2 border rounded hover:bg-muted" onClick={() => navigate('/engagements/new')}>New Engagement</button>
            <button className="px-3 py-2 border rounded hover:bg-muted" onClick={() => navigate('/agents/new')}>Deploy Agent</button>
            <button className="px-3 py-2 border rounded hover:bg-muted" onClick={() => navigate('/library')}>Open Library</button>
            <button className="px-3 py-2 border rounded hover:bg-muted" onClick={() => navigate('/analytics')}>Open Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

function exportDashboardCSV() {
  const rows = [
    ['Metric','Value'],
    ['Total Revenue Pipeline', '2400000'],
    ['Active Engagements', '23'],
    ['Client Organizations', '18'],
    ['AI Agents Deployed', '7']
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'dashboard_summary.csv'; a.click();
  URL.revokeObjectURL(url);
}
