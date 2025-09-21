import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  metadata: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityMetrics {
  totalValue: number;
  totalItems: number;
  highPriorityItems: number;
  ipLicensing: {
    count: number;
    value: number;
    target: number;
  };
  equityDeals: {
    count: number;
    value: number;
    target: number;
  };
  acquisitions: {
    count: number;
    value: number;
    target: number;
  };
}

export function useActivities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    totalValue: 0,
    totalItems: 0,
    highPriorityItems: 0,
    ipLicensing: { count: 0, value: 0, target: 15000 },
    equityDeals: { count: 0, value: 0, target: 12000 },
    acquisitions: { count: 0, value: 0, target: 8000 }
  });

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActivities(data || []);
      calculateMetrics(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (activitiesData: Activity[]) => {
    const ipActivities = activitiesData.filter(a => a.type === 'ip');
    const equityActivities = activitiesData.filter(a => a.type === 'equity');
    const acquisitionActivities = activitiesData.filter(a => a.type === 'acquisition');

    const getValueFromMetadata = (activity: Activity) => {
      return activity.metadata?.value || activity.metadata?.revenue || activity.metadata?.amount || 0;
    };

    const ipValue = ipActivities.reduce((sum, activity) => sum + getValueFromMetadata(activity), 0);
    const equityValue = equityActivities.reduce((sum, activity) => sum + getValueFromMetadata(activity), 0);
    const acquisitionValue = acquisitionActivities.reduce((sum, activity) => sum + getValueFromMetadata(activity), 0);

    const totalValue = ipValue + equityValue + acquisitionValue;
    const totalItems = activitiesData.length;
    const highPriorityItems = activitiesData.filter(a => a.priority === 'high').length;

    setMetrics({
      totalValue,
      totalItems,
      highPriorityItems,
      ipLicensing: { count: ipActivities.length, value: ipValue, target: 15000 },
      equityDeals: { count: equityActivities.length, value: equityValue, target: 12000 },
      acquisitions: { count: acquisitionActivities.length, value: acquisitionValue, target: 8000 }
    });
  };

  const refreshActivities = () => {
    fetchActivities();
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  return {
    activities,
    metrics,
    loading,
    refreshActivities
  };
}