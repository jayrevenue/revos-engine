import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Users,
  Download,
  Search,
  Filter,
  Star,
  Clock,
  Play,
  ExternalLink,
  Eye,
  BookmarkPlus,
  Info
} from "lucide-react";

const templates: Array<any> = [];

const tutorials: Array<any> = [];

const experts: Array<any> = [];

export function KnowledgeLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = templates.filter(template => 
    (selectedCategory === "all" || template.category.toLowerCase() === selectedCategory) &&
    (template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTutorials = tutorials.filter(tutorial => 
    (selectedCategory === "all" || tutorial.category.toLowerCase() === selectedCategory) &&
    (tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {template.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {template.rating}
                        </div>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" className="flex-grow">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">Open a read-only view of the template.</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">Save a copy to your device.</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">Bookmark to find it quickly later.</TooltipContent>
                      </Tooltip>
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
                    <Badge variant="outline" className="mt-2">
                      {expert.specialty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">{expert.bio}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {expert.rating}
                      </div>
                      <span className="text-muted-foreground">{expert.consultations} consultations</span>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Starting at</p>
                      <p className="text-lg font-bold">${expert.hourlyRate}/hour</p>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full"
                          disabled={expert.availability === 'Booked'}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {expert.availability === 'Booked' ? 'Fully Booked' : 'Book Consultation'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">Request time with this expert to review deals or docs.</TooltipContent>
                    </Tooltip>
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
