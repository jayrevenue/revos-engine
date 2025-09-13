import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, X, MoveUp, MoveDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tables } from '@/integrations/supabase/types';

type Playbook = Tables<'playbooks'>;

interface PlaybookStep {
  title: string;
  description: string;
  duration?: string;
  resources?: string[];
}

const PlaybookForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    vertical: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    tags: [] as string[],
    steps: [] as PlaybookStep[],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchPlaybook();
    }
  }, [id, user]);

  const fetchPlaybook = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPlaybook(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        vertical: data.vertical || '',
        status: data.status as any || 'draft',
        tags: data.tags || [],
        steps: (data.steps as any) || [],
      });
    } catch (error: any) {
      toast({
        title: "Error fetching playbook",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const playbookData = {
        ...formData,
        steps: formData.steps as any,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('playbooks')
          .update(playbookData)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Playbook updated",
          description: "The playbook has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('playbooks')
          .insert([playbookData]);

        if (error) throw error;
        
        toast({
          title: "Playbook created",
          description: "The playbook has been created successfully.",
        });
      }

      navigate('/library');
    } catch (error: any) {
      toast({
        title: "Error saving playbook",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '', duration: '', resources: [] }]
    }));
  };

  const updateStep = (index: number, field: keyof PlaybookStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...formData.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Loading...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/library')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? 'Edit Playbook' : 'Create New Playbook'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Playbook Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter playbook title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vertical">Vertical</Label>
                  <Input
                    id="vertical"
                    value={formData.vertical}
                    onChange={(e) => setFormData(prev => ({ ...prev, vertical: e.target.value }))}
                    placeholder="e.g., Healthcare, Finance, Technology"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter playbook description"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Playbook Steps</Label>
                  <Button type="button" onClick={addStep} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                {formData.steps.map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Step {index + 1}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => moveStep(index, 'up')}
                          variant="outline"
                          size="sm"
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => moveStep(index, 'down')}
                          variant="outline"
                          size="sm"
                          disabled={index === formData.steps.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeStep(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Step title"
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Duration (optional)"
                        value={step.duration || ''}
                        onChange={(e) => updateStep(index, 'duration', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Playbook'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/library')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PlaybookForm;