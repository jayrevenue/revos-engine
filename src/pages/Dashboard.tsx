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
  Building
} from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-foreground">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="w-4 h-4 mr-1" />
                Last 30 days
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          {/* Chart placeholder */}
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Revenue analytics will appear here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-colors">
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
    </div>
  );
};

export default Dashboard;