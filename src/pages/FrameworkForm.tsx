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
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tables } from '@/integrations/supabase/types';

type Framework = Tables<'frameworks'>;

const FrameworkForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [framework, setFramework] = useState<Framework | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    framework_type: 'process' as 'methodology' | 'process' | 'template' | 'model',
    status: 'draft' as 'draft' | 'published' | 'archived',
    version: '1.0',
    tags: [] as string[],
    content: {} as Record<string, any>,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchFramework();
    }
  }, [id, user]);

  const fetchFramework = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFramework(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        framework_type: data.framework_type as any || 'process',
        status: data.status as any || 'draft',
        version: data.version || '1.0',
        tags: data.tags || [],
        content: data.content as Record<string, any> || {},
      });
    } catch (error: any) {
      toast({
        title: "Error fetching framework",
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
      const frameworkData = {
        ...formData,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('frameworks')
          .update(frameworkData)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Framework updated",
          description: "The framework has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('frameworks')
          .insert([frameworkData]);

        if (error) throw error;
        
        toast({
          title: "Framework created",
          description: "The framework has been created successfully.",
        });
      }

      navigate('/library');
    } catch (error: any) {
      toast({
        title: "Error saving framework",
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

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
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
            {id ? 'Edit Framework' : 'Create New Framework'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Framework Details</CardTitle>
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
                    placeholder="Enter framework title"
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
                      <SelectItem value="methodology">Methodology</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="strategy">Strategy</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="framework_type">Framework Type</Label>
                  <Select
                    value={formData.framework_type}
                    onValueChange={(value: 'methodology' | 'process' | 'template' | 'model') => 
                      setFormData(prev => ({ ...prev, framework_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="methodology">Methodology</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="model">Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter framework description"
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
                <Label>Framework Content</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overview">Overview</Label>
                    <Textarea
                      id="overview"
                      value={formData.content.overview || ''}
                      onChange={(e) => handleContentChange('overview', e.target.value)}
                      placeholder="Provide an overview of the framework"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objectives">Objectives</Label>
                    <Textarea
                      id="objectives"
                      value={formData.content.objectives || ''}
                      onChange={(e) => handleContentChange('objectives', e.target.value)}
                      placeholder="List the key objectives of this framework"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Textarea
                      id="methodology"
                      value={formData.content.methodology || ''}
                      onChange={(e) => handleContentChange('methodology', e.target.value)}
                      placeholder="Describe the methodology and approach"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliverables">Expected Deliverables</Label>
                    <Textarea
                      id="deliverables"
                      value={formData.content.deliverables || ''}
                      onChange={(e) => handleContentChange('deliverables', e.target.value)}
                      placeholder="List the expected deliverables"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tools">Tools & Resources</Label>
                    <Textarea
                      id="tools"
                      value={formData.content.tools || ''}
                      onChange={(e) => handleContentChange('tools', e.target.value)}
                      placeholder="List required tools and resources"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Framework'}
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

export default FrameworkForm;