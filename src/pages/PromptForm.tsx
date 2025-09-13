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
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tables } from '@/integrations/supabase/types';

type PromptLibrary = Tables<'prompt_library'>;

const PromptForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [prompt, setPrompt] = useState<PromptLibrary | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    vertical: '',
    tags: [] as string[],
    variables: [] as { name: string; description: string; required: boolean }[],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchPrompt();
    }
  }, [id, user]);

  const fetchPrompt = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('prompt_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPrompt(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        content: data.content || '',
        category: data.category || '',
        vertical: data.vertical || '',
        tags: data.tags || [],
        variables: data.variables as any[] || [],
      });
    } catch (error: any) {
      toast({
        title: "Error fetching prompt",
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
      const promptData = {
        ...formData,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('prompt_library')
          .update(promptData)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Prompt updated",
          description: "The prompt has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('prompt_library')
          .insert([promptData]);

        if (error) throw error;
        
        toast({
          title: "Prompt created",
          description: "The prompt has been created successfully.",
        });
      }

      navigate('/library');
    } catch (error: any) {
      toast({
        title: "Error saving prompt",
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

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { name: '', description: '', required: false }]
    }));
  };

  const updateVariable = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
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
            {id ? 'Edit Prompt' : 'Create New Prompt'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter prompt name"
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
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter prompt description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Prompt Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the prompt content"
                  rows={8}
                  required
                />
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
                  <Label>Variables</Label>
                  <Button type="button" onClick={addVariable} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                {formData.variables.map((variable, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <Input
                      placeholder="Variable name"
                      value={variable.name}
                      onChange={(e) => updateVariable(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={variable.description}
                      onChange={(e) => updateVariable(index, 'description', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        onClick={() => removeVariable(index)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Prompt'}
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

export default PromptForm;