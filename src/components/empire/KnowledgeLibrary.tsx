import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  BookmarkPlus
} from "lucide-react";

const templates = [
  {
    id: 1,
    title: "IP Licensing Agreement Template",
    description: "Comprehensive template for licensing RevenueOS to agencies and vendors",
    category: "Legal",
    type: "document",
    status: "ready",
    tags: ["licensing", "legal", "revenue-share"],
    downloads: 45,
    rating: 4.8
  },
  {
    id: 2,
    title: "Outcomes-as-Product Equity Structure",
    description: "Milestone-based equity agreement for Revenue OS implementations",
    category: "Equity",
    type: "document",
    status: "ready",
    tags: ["equity", "milestones", "implementation"],
    downloads: 32,
    rating: 4.9
  },
  {
    id: 3,
    title: "Business Acquisition Checklist",
    description: "Due diligence checklist for acquiring cashflow businesses",
    category: "M&A",
    type: "checklist",
    status: "ready",
    tags: ["acquisition", "due-diligence", "evaluation"],
    downloads: 28,
    rating: 4.7
  },
  {
    id: 4,
    title: "Management Services Agreement",
    description: "Template for TRS management of portfolio companies",
    category: "Operations",
    type: "document",
    status: "draft",
    tags: ["management", "portfolio", "services"],
    downloads: 15,
    rating: 4.5
  }
];

const tutorials = [
  {
    id: 1,
    title: "Phase 1: Legal Structure Setup",
    description: "Step-by-step guide to forming your empire entities",
    duration: "45 min",
    category: "Foundation",
    type: "video",
    status: "published",
    completions: 156,
    rating: 4.9
  },
  {
    id: 2,
    title: "IP Licensing Deal Negotiation",
    description: "How to structure and negotiate profitable licensing deals",
    duration: "32 min",
    category: "IP",
    type: "video",
    status: "published",
    completions: 89,
    rating: 4.8
  },
  {
    id: 3,
    title: "Equity Deal Structure & Milestones",
    description: "Designing milestone-based equity partnerships",
    duration: "28 min",
    category: "Equity",
    type: "video",
    status: "published",
    completions: 67,
    rating: 4.7
  },
  {
    id: 4,
    title: "Business Acquisition Fundamentals",
    description: "Finding, evaluating, and acquiring cashflow businesses",
    duration: "52 min",
    category: "M&A",
    type: "video",
    status: "coming-soon",
    completions: 0,
    rating: 0
  }
];

const experts = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Corporate Attorney",
    specialty: "Entity Formation & Structuring",
    rating: 4.9,
    consultations: 234,
    hourlyRate: 450,
    availability: "Available",
    bio: "20+ years experience in complex business structures and tax optimization"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    title: "M&A Advisor",
    specialty: "Business Acquisitions",
    rating: 4.8,
    consultations: 156,
    hourlyRate: 520,
    availability: "Booked",
    bio: "Former investment banker specializing in small business acquisitions"
  },
  {
    id: 3,
    name: "Dr. Amanda Foster",
    title: "CPA & Tax Strategist",
    specialty: "Multi-Entity Tax Planning",
    rating: 4.9,
    consultations: 312,
    hourlyRate: 380,
    availability: "Available",
    bio: "Tax optimization for complex business structures and revenue models"
  }
];

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
            <div className="flex gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <Badge variant={template.status === 'ready' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
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
                      <Button size="sm" className="flex-grow">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                    </div>
                    <Badge variant={tutorial.status === 'published' ? 'default' : 'secondary'}>
                      {tutorial.status === 'coming-soon' ? 'Coming Soon' : 'Published'}
                    </Badge>
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

                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={tutorial.status === 'coming-soon'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {tutorial.status === 'coming-soon' ? 'Coming Soon' : 'Watch Tutorial'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experts" className="space-y-4">
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

                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={expert.availability === 'Booked'}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {expert.availability === 'Booked' ? 'Fully Booked' : 'Book Consultation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}