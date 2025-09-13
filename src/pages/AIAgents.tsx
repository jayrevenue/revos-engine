import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Bot, Activity, Brain, MessageSquare, Settings, Trash2, Play, Pause } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  status: string;
  usage_stats: any;
  created_at: string;
  orgs?: { name: string } | null;
  engagements?: { name: string } | null;
}

const AIAgents = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    totalTokens: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select(`
          *,
          orgs:org_id ( name ),
          engagements:engagement_id ( name )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAgents(data || []);
      
      // Calculate stats
      const totalAgents = data?.length || 0;
      const activeAgents = data?.filter(agent => agent.status === 'active').length || 0;
      const totalConversations = data?.reduce((sum, agent) => {
        const stats = agent.usage_stats as any;
        return sum + (stats?.total_conversations || 0);
      }, 0) || 0;
      const totalTokens = data?.reduce((sum, agent) => {
        const stats = agent.usage_stats as any;
        return sum + (stats?.total_tokens || 0);
      }, 0) || 0;
      
      setStats({
        totalAgents,
        activeAgents,
        totalConversations,
        totalTokens,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from("ai_agents")
        .update({ status: newStatus })
        .eq("id", agentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
      fetchAgents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      fetchAgents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'cfo':
      case 'financial':
        return <Brain className="h-5 w-5 text-blue-500" />;
      case 'ae copilot':
      case 'sales':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'compliance':
        return <Settings className="h-5 w-5 text-purple-500" />;
      default:
        return <Bot className="h-5 w-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Dashboard</h1>
          <p className="text-muted-foreground">Deploy and manage AI agents for client engagements</p>
        </div>
        <Button onClick={() => navigate("/agents/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      {/* Agent Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>Deployed Agents</CardTitle>
          <CardDescription>
            Manage AI agents across all client engagements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No agents deployed</h3>
              <p className="text-sm text-muted-foreground">Get started by deploying your first AI agent.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(agent.role)}
                          <div>
                            <h3 className="font-medium">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.role}</p>
                          </div>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {agent.orgs?.name || 'Unassigned Org'}{agent.engagements?.name ? ` – ${agent.engagements.name}` : ''}
                        </p>
                        
                        {agent.description && (
                          <p className="text-sm">{agent.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span>Model: {agent.model}</span>
                          <span>Conversations: {(agent.usage_stats as any)?.total_conversations || 0}</span>
                          <span>Tokens: {((agent.usage_stats as any)?.total_tokens || 0).toLocaleString()}</span>
                          {(agent.usage_stats as any)?.last_used && (
                            <span>Last used: {format(new Date((agent.usage_stats as any).last_used), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(agent.id, agent.status)}
                        >
                          {agent.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/agents/${agent.id}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/agents/${agent.id}/chat`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {user && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(agent.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgents;
