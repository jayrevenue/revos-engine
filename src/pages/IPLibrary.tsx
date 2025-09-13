import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Target, TrendingUp, DollarSign, Zap, Bot, BookOpen, Code, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptLibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  vertical: string;
  tags: string[];
  usage_count: number;
  created_at: string;
}

interface Playbook {
  id: string;
  title: string;
  description: string;
  category: string;
  vertical: string;
  status: string;
  usage_count: number;
  created_at: string;
}

interface Framework {
  id: string;
  title: string;
  description: string;
  category: string;
  framework_type: string;
  status: string;
  created_at: string;
}

const IPLibrary = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchIPAssets();
    }
  }, [user, loading, navigate]);

  const fetchIPAssets = async () => {
    try {
      setLoadingData(true);
      
      // Fetch prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompt_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (promptsError) throw promptsError;
      setPrompts(promptsData || []);

      // Fetch playbooks
      const { data: playbooksData, error: playbooksError } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (playbooksError) throw playbooksError;
      setPlaybooks(playbooksData || []);

      // Fetch frameworks
      const { data: frameworksData, error: frameworksError } = await supabase
        .from('frameworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (frameworksError) throw frameworksError;
      setFrameworks(frameworksData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch IP assets",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pricing': return <DollarSign className="w-5 h-5" />;
      case 'compliance': return <BookOpen className="w-5 h-5" />;
      case 'retention': return <Target className="w-5 h-5" />;
      case 'automation': return <Bot className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPlaybooks = playbooks.filter(playbook =>
    playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    playbook.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFrameworks = frameworks.filter(framework =>
    framework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">IP Library</h1>
            <p className="text-muted-foreground mt-2">
              Manage prompts, playbooks, frameworks, and RevOS intellectual property
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/library/prompts/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Prompt
            </Button>
            <Button onClick={() => navigate('/library/playbooks/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Playbook
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search IP assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="prompts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="prompts">Prompt Library</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prompt Library</h2>
              <Button onClick={() => navigate('/library/prompts/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>

            {filteredPrompts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Code className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your prompt library for AI agents
                  </p>
                  <Button onClick={() => navigate('/library/prompts/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{prompt.name}</span>
                        {getCategoryIcon(prompt.category)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {prompt.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{prompt.category}</Badge>
                        {prompt.vertical && (
                          <Badge variant="secondary">{prompt.vertical}</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {prompt.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{prompt.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Used {prompt.usage_count} times
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playbooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Playbooks</h2>
              <Button onClick={() => navigate('/library/playbooks/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Playbook
              </Button>
            </div>

            {filteredPlaybooks.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No playbooks found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create structured playbooks for your RevOS processes
                  </p>
                  <Button onClick={() => navigate('/library/playbooks/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Playbook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlaybooks.map((playbook) => (
                  <Card key={playbook.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{playbook.title}</span>
                        <BookOpen className="w-5 h-5" />
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {playbook.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{playbook.category}</Badge>
                        <Badge className={getStatusColor(playbook.status)}>
                          {playbook.status}
                        </Badge>
                      </div>
                      
                      {playbook.vertical && (
                        <Badge variant="secondary">{playbook.vertical}</Badge>
                      )}

                      <div className="text-sm text-muted-foreground">
                        Used {playbook.usage_count} times
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Frameworks & SOPs</h2>
              <Button onClick={() => navigate('/library/frameworks/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Framework
              </Button>
            </div>

            {filteredFrameworks.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No frameworks found</h3>
                  <p className="text-muted-foreground mb-4">
                    Store templates, SOPs, and visual frameworks
                  </p>
                  <Button onClick={() => navigate('/library/frameworks/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Framework
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFrameworks.map((framework) => (
                  <Card key={framework.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{framework.title}</span>
                        <Database className="w-5 h-5" />
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {framework.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{framework.category}</Badge>
                        <Badge className={getStatusColor(framework.status)}>
                          {framework.status}
                        </Badge>
                      </div>
                      
                      <Badge variant="secondary">{framework.framework_type}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-2xl font-bold">IP Library Overview</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{prompts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Playbooks</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {playbooks.filter(p => p.status === 'published').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frameworks</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{frameworks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {prompts.reduce((sum, p) => sum + p.usage_count, 0) + 
                     playbooks.reduce((sum, p) => sum + p.usage_count, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IPLibrary;