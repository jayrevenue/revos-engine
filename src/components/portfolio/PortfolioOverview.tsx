import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Handshake,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Plus,
  Eye,
  Edit,
  RefreshCw
} from "lucide-react";

export function PortfolioOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load portfolio items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type?.includes('ip') || type?.includes('IP')) return <FileText className="h-4 w-4" />;
    if (type?.includes('equity')) return <Handshake className="h-4 w-4" />;
    if (type?.includes('acquisition')) return <ShoppingCart className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    if (type?.includes('ip') || type?.includes('IP')) return 'bg-accent/20 text-accent';
    if (type?.includes('equity')) return 'bg-secondary/20 text-secondary';
    if (type?.includes('acquisition')) return 'bg-muted/20 text-foreground';
    return 'bg-primary/20 text-primary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalValue = activities.reduce((sum, item) => {
    const value = item.metadata?.potential_value || item.metadata?.estimated_revenue || item.metadata?.asset_value || 0;
    return sum + (typeof value === 'string' ? parseFloat(value) || 0 : value);
  }, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
          <p className="text-muted-foreground">Track and manage all your revenue-generating assets</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchActivities}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/start')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activities.length}</p>
                <p className="text-sm text-muted-foreground">Active Items</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activities.filter(a => a.priority === 'high').length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Portfolio Items Yet</h3>
                <p className="text-muted-foreground">Start tracking your IP, equity deals, and acquisitions</p>
              </div>
              <Button onClick={() => navigate('/start')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activities.map((item) => {
            const value = item.metadata?.potential_value || item.metadata?.estimated_revenue || item.metadata?.asset_value || 0;
            const displayValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge className={getStatusColor(item.priority)} variant="secondary">
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Value</span>
                      <span className="font-semibold">
                        {displayValue > 0 ? `$${(displayValue / 1000).toFixed(1)}K` : 'TBD'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Type: {item.entity_type || item.type}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Add More?</h3>
              <p className="text-muted-foreground">Expand your revenue empire with new tracking items</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/start?type=ip')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                New IP
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/start?type=equity')}
                className="flex items-center gap-2"
              >
                <Handshake className="h-4 w-4" />
                Equity Deal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/start?type=acquisition')}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Acquisition
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}