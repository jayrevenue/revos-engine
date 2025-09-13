import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Book, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  FileText,
  Video,
  Code,
  Users,
  Target,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink,
  Download
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  completed?: boolean;
}

const userGuides: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with TRS RevOS',
    description: 'Learn the basics of navigation, setup, and core features',
    level: 'Beginner',
    duration: '10 min',
    completed: true
  },
  {
    id: 'analytics-overview',
    title: 'Analytics Dashboard Overview',
    description: 'Understanding metrics, charts, and KPIs in your analytics dashboard',
    level: 'Beginner',
    duration: '15 min',
    completed: true
  },
  {
    id: 'ai-agents-setup',
    title: 'Setting Up AI Agents',
    description: 'Deploy and configure AI agents for your business processes',
    level: 'Intermediate',
    duration: '25 min',
    completed: false
  },
  {
    id: 'roi-analysis',
    title: 'Advanced ROI Analysis',
    description: 'Deep dive into ROI calculations, NPV, and performance optimization',
    level: 'Advanced',
    duration: '30 min',
    completed: false
  },
  {
    id: 'engagement-management',
    title: 'Engagement Management',
    description: 'Create, track, and optimize client engagements effectively',
    level: 'Intermediate',
    duration: '20 min',
    completed: false
  },
  {
    id: 'custom-reporting',
    title: 'Custom Reporting & Dashboards',
    description: 'Build custom reports and share insights with stakeholders',
    level: 'Advanced',
    duration: '35 min',
    completed: false
  }
];

const quickStart = [
  {
    step: 1,
    title: 'Complete Your Profile',
    description: 'Set up your organization details and user preferences',
    icon: Users,
    completed: true
  },
  {
    step: 2,
    title: 'Connect Your Data Sources',
    description: 'Integrate your CRM, marketing tools, and other business systems',
    icon: Settings,
    completed: true
  },
  {
    step: 3,
    title: 'Create Your First Engagement',
    description: 'Set up tracking for a client engagement or project',
    icon: Target,
    completed: false
  },
  {
    step: 4,
    title: 'Deploy an AI Agent',
    description: 'Choose and configure your first AI automation',
    icon: BarChart3,
    completed: false
  }
];

const faqs = [
  {
    question: "How do I interpret ROI calculations?",
    answer: "ROI is calculated using multiple factors including direct savings, indirect benefits, and risk mitigation. Our advanced metrics include NPV (Net Present Value) and IRR (Internal Rate of Return) for comprehensive analysis.",
    category: "Analytics"
  },
  {
    question: "What types of AI agents can I deploy?",
    answer: "TRS RevOS supports various AI agents including Sales Optimization, Lead Qualification, Process Automation, Customer Support, and Revenue Analytics agents. Each can be customized for your specific needs.",
    category: "AI Agents"
  },
  {
    question: "How often is data updated in dashboards?",
    answer: "Real-time data is updated every 15 minutes, while batch processes (like complex analytics) run hourly. Historical data is processed daily to ensure accuracy.",
    category: "Data"
  },
  {
    question: "Can I export reports and share them externally?",
    answer: "Yes, you can export reports as PDF, Excel, or create secure sharing links with customizable permissions and expiration dates.",
    category: "Reporting"
  }
];

const UserGuide = () => {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = userGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Intermediate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'Advanced': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Guide & Documentation</h2>
          <p className="text-muted-foreground">
            Comprehensive guides to help you master TRS RevOS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Guide
          </Button>
          <Button>
            <Video className="w-4 h-4 mr-2" />
            Video Tutorials
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search guides and FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide) => (
              <Card key={guide.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Book className="h-5 w-5 text-primary" />
                      {guide.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <Badge className={getLevelColor(guide.level)}>
                      {guide.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{guide.duration}</span>
                    <Button 
                      size="sm" 
                      variant={guide.completed ? "outline" : "default"}
                      onClick={() => setActiveGuide(guide.id)}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {guide.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quickstart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Checklist</CardTitle>
              <CardDescription>
                Complete these steps to get up and running with TRS RevOS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStart.map((step) => (
                  <div key={step.step} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? <CheckCircle className="w-4 h-4" /> : step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    <step.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <Badge variant="outline">{faq.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Comprehensive technical documentation and API references
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Code className="w-4 h-4 mr-2" />
                  API Documentation
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Integration Guide
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Guide
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Best Practices
                </CardTitle>
                <CardDescription>
                  Learn from successful implementations and optimization strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  ROI Optimization
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Team Collaboration
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Troubleshooting
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                Get in touch with our support team for personalized assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserGuide;