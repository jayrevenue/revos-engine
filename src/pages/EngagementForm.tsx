import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Org {
  id: string;
  name: string;
}

interface EngagementForm {
  name: string;
  org_id: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
  description: string;
}

const EngagementForm = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [form, setForm] = useState<EngagementForm>({
    name: '',
    org_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    budget: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const isEdit = !!id && id !== 'new';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchOrgs();
      if (isEdit) {
        fetchEngagement();
      }
    }
  }, [user, loading, navigate, isEdit, id]);

  const fetchOrgs = async () => {
    try {
      const { data, error } = await supabase
        .from('orgs')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrgs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive",
      });
    }
  };

  const fetchEngagement = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('engagements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({
        name: data.name,
        org_id: data.org_id,
        status: data.status,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        budget: data.budget?.toString() || '',
        description: data.description || ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch engagement details",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const engagementData = {
        name: form.name,
        org_id: form.org_id,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        description: form.description || null,
        created_by: user.id
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from('engagements')
          .update(engagementData)
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('engagements')
          .insert(engagementData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Engagement ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate(isEdit ? `/engagements/${id}` : `/engagements/${result.data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} engagement`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/engagements')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engagements
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Engagement' : 'New Engagement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Engagement Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter engagement name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="org_id">Organization</Label>
                <Select value={form.org_id} onValueChange={(value) => setForm({ ...form, org_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="Enter budget amount"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter engagement description"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/engagements')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngagementForm;