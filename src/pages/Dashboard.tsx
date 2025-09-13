import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">TRS RevOS Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome to Your Revenue Operations Platform</h2>
            <p className="text-muted-foreground">
              Manage your client engagements, deploy AI agents, and track revenue outcomes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/clients')}>
              <h3 className="text-xl font-semibold mb-2">Active Engagements</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Client projects in progress</p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">AI Agents</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Deployed GPT-4o agents</p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Revenue Impact</h3>
              <p className="text-3xl font-bold text-primary">$0</p>
              <p className="text-sm text-muted-foreground">Total tracked outcomes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/clients')}
                >
                  Manage Clients
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/users')}
                >
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Deploy AI Agent
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Track Revenue
                </Button>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;