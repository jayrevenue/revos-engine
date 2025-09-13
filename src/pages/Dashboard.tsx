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

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    { title: "Active Engagements", value: "0", change: "+0%", icon: Briefcase, onClick: () => navigate('/engagements') },
    { title: "Client Organizations", value: "0", change: "+0%", icon: Building, onClick: () => navigate('/clients') },
    { title: "Revenue Impact", value: "$0", change: "+0%", icon: DollarSign, onClick: () => navigate('/revenue') },
    { title: "AI Agents", value: "0", change: "+0%", icon: Bot, onClick: () => navigate('/agents') }
  ];

  const recentActivity = [
    { action: "Welcome to TRS RevOS", company: "Get started by creating your first engagement", time: "Just now" },
    { action: "Explore AI Agents", company: "Deploy intelligent revenue optimization agents", time: "Getting started" },
    { action: "Revenue Tracking", company: "Track and analyze revenue outcomes", time: "Available now" },
    { action: "Analytics Dashboard", company: "Advanced analytics and reporting", time: "Ready to use" }
  ];

  const sidebarItems = [
    { name: "Overview", icon: BarChart3, active: true, onClick: () => navigate('/dashboard') },
    { name: "Executive", icon: Target, active: false, onClick: () => navigate('/executive') },
    { name: "Analytics", icon: TrendingUp, active: false, onClick: () => navigate('/analytics') },
    { name: "Engagements", icon: Briefcase, active: false, onClick: () => navigate('/engagements') },
    { name: "Clients", icon: Building, active: false, onClick: () => navigate('/clients') },
    { name: "Revenue", icon: DollarSign, active: false, onClick: () => navigate('/revenue') },
    { name: "AI Agents", icon: Bot, active: false, onClick: () => navigate('/agents') },
    { name: "IP Library", icon: FileText, active: false, onClick: () => navigate('/library') },
    { name: "Settings", icon: Settings, active: false, onClick: () => navigate('/settings') }
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-200 bg-slate-50 border-r border-slate-200 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-medium text-slate-900">Revenue Science</h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-150 ${
                    item.active 
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="ml-4 text-xl font-medium text-slate-900">Dashboard Overview</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Info & Sign Out */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-gradient-to-b from-white to-slate-50">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Revenue Trend</h3>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <Calendar className="w-4 h-4 mr-1" />
                    Last 30 days
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
              
              {/* Chart placeholder */}
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Revenue analytics will appear here</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-6">Getting Started</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-500">{activity.company}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Create Engagement", description: "Start a new client engagement", onClick: () => navigate('/engagements') },
                { title: "Deploy AI Agent", description: "Launch an intelligent revenue agent", onClick: () => navigate('/agents') },
                { title: "View Analytics", description: "Analyze revenue performance data", onClick: () => navigate('/analytics') }
              ].map((action, index) => (
                <button 
                  key={index} 
                  onClick={action.onClick}
                  className="text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <h4 className="font-medium text-slate-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;