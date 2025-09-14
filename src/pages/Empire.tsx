import { useState } from "react";
import Page from "@/components/layout/Page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Building2, 
  Target, 
  TrendingUp, 
  Brain, 
  FileText,
  Award,
  DollarSign,
  Users,
  Rocket,
  ShieldCheck,
  Zap
} from "lucide-react";
import { EmpireDashboard } from "@/components/empire/EmpireDashboard";
import { EmpireRoadmap } from "@/components/empire/EmpireRoadmap";
import { RevenueCalculator } from "@/components/empire/RevenueCalculator";
import { AIAssistant } from "@/components/empire/AIAssistant";
import { KnowledgeLibrary } from "@/components/empire/KnowledgeLibrary";
import { PortfolioManager } from "@/components/empire/PortfolioManager";

export default function Empire() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [empirePhase] = useState<number | null>(null);

  return (
    <Page
      title="Revenue Expert Empire"
      description="Transform from employee to empire owner through the three‑pillar Revenue Operating System"
      actions={
        <Button variant="outline" size="sm">
          <Brain className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {empirePhase ? `Phase ${empirePhase}` : 'No phase set'}
          </Badge>
        </div>

        {/* Phase Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Phases</h3>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <Progress value={0} className="mb-2" />
              <p className="text-xs text-muted-foreground">No phases yet — add them in Roadmap</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">IP Development</h3>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <Progress value={0} className="mb-2" />
              <p className="text-xs text-muted-foreground">Track progress as you add data</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Scale & Acquire</h3>
                <Rocket className="h-4 w-4 text-muted-foreground" />
              </div>
              <Progress value={0} className="mb-2" />
              <p className="text-xs text-muted-foreground">Add equity deals and acquisitions</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Operations</h3>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <Progress value={0} className="mb-2" />
              <p className="text-xs text-muted-foreground">Set targets and track metrics</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Empire Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No achievements yet. Complete milestones to unlock achievements.</div>
          </CardContent>
        </Card>

        {/* Main Empire Tools */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <EmpireDashboard />
          </TabsContent>

          <TabsContent value="roadmap" className="mt-6">
            <EmpireRoadmap />
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <RevenueCalculator />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AIAssistant />
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <KnowledgeLibrary />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <PortfolioManager />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}
