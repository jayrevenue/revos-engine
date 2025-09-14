import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown,
  Calculator,
  Map,
  Brain,
  BookOpen,
  PieChart,
  Mic,
  Building2,
  Zap,
  Eye,
  Settings,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

// Import all the new empire components
import { UnifiedEmpireDashboard } from "@/components/empire/UnifiedEmpireDashboard";
import { EmpireDashboard } from "@/components/empire/EmpireDashboard";
import { RevenueCalculator } from "@/components/empire/RevenueCalculator";
import { EmpireRoadmap } from "@/components/empire/EmpireRoadmap";
import { PortfolioManager } from "@/components/empire/PortfolioManager";
import { AIAssistant } from "@/components/empire/AIAssistant";
import { KnowledgeLibrary } from "@/components/empire/KnowledgeLibrary";
import { VoiceToTextRecorder } from "@/components/voice/VoiceToTextRecorder";
import { ContextSwitcher, usePortfolioContext } from "@/components/portfolio/ContextSwitcher";
import { ThreePillarMetrics } from "@/components/metrics/ThreePillarMetrics";
import { ProgressiveDisclosure, ProgressiveDisclosureContainer, useProgressiveDisclosure } from "@/components/ui/progressive-disclosure";

const empireFeatures = [
  {
    title: "Model Your Empire",
    description: "Calculate and plan three-pillar revenue streams with interactive scenario modeling",
    icon: Calculator,
    component: "calculator",
    level: "basic" as const
  },
  {
    title: "Execute Your Roadmap", 
    description: "Track milestones and manage deals through empire building phases",
    icon: Map,
    component: "roadmap",
    level: "basic" as const
  },
  {
    title: "Scale with AI Insights",
    description: "Manage portfolio performance with AI-powered strategy assistance",
    icon: Brain,
    component: "ai-assistant", 
    level: "intermediate" as const
  },
  {
    title: "Portfolio Management",
    description: "Advanced tools for managing multiple companies and deals simultaneously",
    icon: PieChart,
    component: "portfolio",
    level: "intermediate" as const
  },
  {
    title: "Voice-Powered Updates",
    description: "Capture deal notes and strategy sessions with voice-to-text technology",
    icon: Mic,
    component: "voice",
    level: "advanced" as const
  },
  {
    title: "Context Switching",
    description: "Seamlessly switch between different portfolio companies and deals",
    icon: Building2,
    component: "context-switcher",
    level: "advanced" as const
  }
];

export default function EmpireShowcase() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const portfolioContext = usePortfolioContext();
  const { userLevel, promoteUser, canAccess } = useProgressiveDisclosure('intermediate');

  const renderComponent = () => {
    switch (selectedComponent) {
      case "unified-dashboard":
        return <UnifiedEmpireDashboard />;
      case "calculator":
        return <RevenueCalculator />;
      case "roadmap":
        return <EmpireRoadmap />;
      case "portfolio":
        return <PortfolioManager />;
      case "ai-assistant":
        return <AIAssistant />;
      case "library":
        return <KnowledgeLibrary />;
      case "voice":
        return <VoiceToTextRecorder />;
      case "context-switcher":
        return (
          <ContextSwitcher
            selectedCompanyId={portfolioContext.selectedCompanyId || undefined}
            onCompanySelect={portfolioContext.selectCompany}
          />
        );
      case "three-pillar-metrics":
        return <ThreePillarMetrics />;
      default:
        return null;
    }
  };

  if (selectedComponent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedComponent(null)}
          >
            ← Back to Showcase
          </Button>
          <Badge variant="default">
            Live Component Demo
          </Badge>
        </div>
        {renderComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Crown className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Revenue Expert Empire Builder
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              The only tool you need to build a Revenue Expert Empire
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Model</h3>
            <p className="text-muted-foreground">Calculate and plan three-pillar revenue streams</p>
          </Card>
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <Map className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Execute</h3>
            <p className="text-muted-foreground">Track milestones and manage deals through phases</p>
          </Card>
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <Brain className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Scale</h3>
            <p className="text-muted-foreground">Manage portfolio performance with AI-powered insights</p>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => setSelectedComponent("unified-dashboard")}>
            <Play className="h-5 w-5 mr-2" />
            Try Live Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => setActiveTab("components")}>
            <Eye className="h-5 w-5 mr-2" />
            Explore Components
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Empire Overview</TabsTrigger>
          <TabsTrigger value="components">Interactive Components</TabsTrigger>
          <TabsTrigger value="metrics">Three-Pillar Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                Empire Dashboard Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmpireDashboard />
              <div className="flex justify-center mt-6">
                <Button onClick={() => setSelectedComponent("unified-dashboard")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Full Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ProgressiveDisclosureContainer 
            userLevel={userLevel} 
            title="Empire Building Tools"
            description="Discover features designed for your current empire building phase"
          >
            {empireFeatures.map((feature) => (
              <ProgressiveDisclosure
                key={feature.component}
                title={feature.title}
                subtitle={feature.description}
                level={feature.level}
                icon={feature.icon}
                locked={!canAccess(feature.level)}
                prerequisite={!canAccess(feature.level) ? `Unlock by progressing to ${feature.level} level` : undefined}
              >
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This component provides {feature.title.toLowerCase()} capabilities for your revenue empire.
                    Click the button below to see a live demo.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedComponent(feature.component)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Live Component
                    </Button>
                    {feature.level !== 'basic' && (
                      <Badge variant="outline">
                        {feature.level} level required
                      </Badge>
                    )}
                  </div>
                </div>
              </ProgressiveDisclosure>
            ))}
          </ProgressiveDisclosureContainer>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-primary" />
                Three-Pillar Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThreePillarMetrics />
              <div className="flex justify-center mt-6">
                <Button onClick={() => setSelectedComponent("three-pillar-metrics")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-6 w-6 text-primary" />
                  Voice-to-Text for Deal Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Capture insights during deal calls and strategy sessions with AI-powered voice transcription.
                </p>
                <Button onClick={() => setSelectedComponent("voice")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try Voice Recorder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Portfolio Context Switching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Seamlessly manage multiple portfolio companies and switch context between deals.
                </p>
                <Button onClick={() => setSelectedComponent("context-switcher")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Context Switcher
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  AI Strategy Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get AI-powered insights for deal structuring, risk assessment, and strategic planning.
                </p>
                <Button onClick={() => setSelectedComponent("ai-assistant")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Chat with AI Assistant
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Knowledge Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access templates, tutorials, and expert network for empire building guidance.
                </p>
                <Button onClick={() => setSelectedComponent("library")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Explore Library
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Simple but Powerful</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Start with the essentials and unlock advanced features as you grow. Progressive disclosure ensures 
            you're never overwhelmed while having access to enterprise-grade capabilities when needed.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={promoteUser}>
              <Zap className="h-4 w-4 mr-2" />
              Unlock Advanced Features
            </Button>
            <Button onClick={() => setSelectedComponent("unified-dashboard")}>
              <Play className="h-4 w-4 mr-2" />
              Start Building Your Empire
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}