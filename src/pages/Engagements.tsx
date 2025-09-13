import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Calendar, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Engagement {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  description: string | null;
  created_at: string;
  org: {
    id: string;
    name: string;
  };
}

const Engagements = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchEngagements();
    }
  }, [user, loading, navigate]);

  const fetchEngagements = async () => {
    try {
      setLoadingEngagements(true);
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          id,
          name,
          status,
          start_date,
          end_date,
          budget,
          description,
          created_at,
          orgs:org_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = data?.map(engagement => ({
        ...engagement,
        org: engagement.orgs as { id: string; name: string }
      })) || [];

      setEngagements(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch engagements",
        variant: "destructive",
      });
    } finally {
      setLoadingEngagements(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'complete': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || loadingEngagements) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Engagements</h1>
          <p className="text-muted-foreground">Track and manage all client engagements</p>
        </div>
        <Button onClick={() => navigate("/engagements/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Engagement
        </Button>
      </div>

      <div>
        {engagements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No engagements yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first client engagement
              </p>
              <Button onClick={() => navigate('/engagements/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Engagement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {engagements.map((engagement) => (
              <Card 
                key={engagement.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/engagements/${engagement.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{engagement.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="w-4 h-4 mr-1" />
                        {engagement.org?.name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(engagement.status)}>
                      {engagement.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {engagement.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {engagement.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {engagement.start_date ? (
                      <>
                        {new Date(engagement.start_date).toLocaleDateString()}
                        {engagement.end_date && (
                          <> - {new Date(engagement.end_date).toLocaleDateString()}</>
                        )}
                      </>
                    ) : (
                      'No dates set'
                    )}
                  </div>

                  {engagement.budget && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${engagement.budget.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Engagements;