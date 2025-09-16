import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Video,
  Users,
  Download,
  Search,
  Star,
  Clock,
  Play,
  ExternalLink,
  Eye,
  BookmarkPlus,
  Info,
  MessageSquare
} from "lucide-react";

// Data loaded dynamically from Supabase

export function KnowledgeLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [docs, setDocs] = useState<any[]>([]);
  const [plays, setPlays] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const experts: any[] = [];
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docsR, playsR, promptsR] = await Promise.all([
          supabase.from('documents').select('*').order('created_at', { ascending: false }),
          supabase.from('playbooks').select('*').order('created_at', { ascending: false }),
          supabase.from('prompt_library').select('*').order('created_at', { ascending: false }),
        ]);
        if (docsR.error) throw docsR.error;
        if (playsR.error) throw playsR.error;
        if (promptsR.error) throw promptsR.error;
        setDocs(docsR.data || []);
        setPlays(playsR.data || []);
        setPrompts(promptsR.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allTemplates = useMemo(() => {
    const docItems = docs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      category: (d.category || 'document').toLowerCase(),
      status: d.status || 'ready',
      tags: d.tags || [],
      kind: 'document' as const,
      file_url: d.file_url || null,
      content: d.content || null,
    }));
    const playItems = plays.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      category: (p.category || 'playbook').toLowerCase(),
      status: p.status || 'ready',
      tags: p.tags || [],
      kind: 'playbook' as const,
      file_url: null,
      content: p.content || null,
    }));
    const promptItems = prompts.map((pl) => ({
      id: pl.id,
      title: pl.name,
      description: pl.description || '',
      category: (pl.category || 'prompt').toLowerCase(),
      status: 'ready',
      tags: pl.tags || [],
      kind: 'prompt' as const,
      file_url: null,
      content: pl.content || null,
    }));
    return [...docItems, ...playItems, ...promptItems];
  }, [docs, plays, prompts]);

  const filteredTemplates = allTemplates.filter(template => 
    (selectedCategory === "all" || (template.category || '').toLowerCase() === selectedCategory) &&
    (template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     template.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTutorials = docs
    .filter((d) => d.file_type === 'video' || d.type === 'video')
    .filter(tutorial => 
      (selectedCategory === "all" || (tutorial.category || '').toLowerCase() === selectedCategory) &&
      (tutorial.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tutorial.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates, tutorials, experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              {["all", "legal", "equity", "m&a", "operations"].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "m&a" ? "M&A" : category}
                </Button>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} aria-label="Help: Category filter" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="end">Filter results by category. Use Search to narrow further.</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates & Documents
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Expert Network
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates or documents yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.status === 'ready' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label="Help: Template status" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                            <Info className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end">Ready = downloadable. Draft = in progress; contents may change.</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {template.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div />
                      <Badge variant="outline">{template.category}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-grow" onClick={() => setPreviewItem(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        if (template.file_url) {
                          window.open(template.file_url, '_blank');
                        } else if (template.content) {
                          const text = typeof template.content === 'string' ? template.content : JSON.stringify(template.content, null, 2);
                          const blob = new Blob([text], { type: 'text/plain' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `${template.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
                          a.click();
                          URL.revokeObjectURL(a.href);
                        }
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        try {
                          const tagList: string[] = Array.isArray(template.tags) ? [...template.tags] : [];
                          const has = tagList.includes('bookmarked');
                          const next = has ? tagList.filter(t => t !== 'bookmarked') : [...tagList, 'bookmarked'];
                          if (template.kind === 'document') {
                            const { error } = await supabase.from('documents').update({ tags: next }).eq('id', template.id);
                            if (error) throw error;
                          } else if (template.kind === 'playbook') {
                            const { error } = await supabase.from('playbooks').update({ tags: next }).eq('id', template.id);
                            if (error) throw error;
                          } else if (template.kind === 'prompt') {
                            const { error } = await supabase.from('prompt_library').update({ tags: next }).eq('id', template.id);
                            if (error) throw error;
                          }
                          template.tags = next;
                        } catch (err) {
                          console.error('Bookmark toggle failed', err);
                        }
                      }}>
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          {filteredTutorials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tutorials yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tutorial.status === 'published' ? 'default' : 'secondary'}>
                        {tutorial.status === 'coming-soon' ? 'Coming Soon' : 'Published'}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label="Help: Tutorial status" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                            <Info className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end">Published videos can be watched now. Coming Soon items are in production.</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {tutorial.completions}
                        </div>
                        {tutorial.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {tutorial.rating}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">{tutorial.category}</Badge>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={tutorial.status === 'coming-soon'}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {tutorial.status === 'coming-soon' ? 'Coming Soon' : 'Watch Tutorial'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">Play tutorial when available.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="experts" className="space-y-4">
          {experts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No experts listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert) => (
              <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{expert.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{expert.title}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex justify-center gap-2 mb-2">
                        {expert.specialties?.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {expert.rating} ({expert.reviews} reviews)
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>${expert.hourlyRate}/hour</p>
                    </div>

                    <div className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact Expert
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">Send a message to discuss your needs.</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">See full expertise and background.</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  );
}