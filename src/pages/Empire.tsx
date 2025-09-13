import { useState } from "react";
import { BrandHeader } from "@/components/ui/brand-header";
import { NotionLayout } from "@/components/layout/NotionLayout";
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
  const [empirePhase] = useState(1); // Mock data - would come from user progress

  const phases = [
    { id: 1, name: "Foundation", progress: 75, status: "active" },
    { id: 2, name: "IP Development", progress: 30, status: "pending" },
    { id: 3, name: "Scale & Acquire", progress: 0, status: "locked" },
    { id: 4, name: "Empire Operations", progress: 0, status: "locked" }
  ];

  const achievements = [
    { name: "Legal Structure", icon: Building2, completed: true },
    { name: "First IP License", icon: FileText, completed: false },
    { name: "Equity Deal", icon: TrendingUp, completed: false },
    { name: "Business Acquisition", icon: Crown, completed: false }
  ];

  return (
    <NotionLayout>
      <div className="space-y-6">
        <BrandHeader
          title="Revenue Expert Empire"
          subtitle="Transform from employee to empire owner through the three-pillar Revenue Operating System"
          className="bg-gradient-to-r from-primary/5 to-accent/5"
        >
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Phase {empirePhase}: Foundation
            </Badge>
            <Button variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </BrandHeader>

        {/* Phase Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {phases.map((phase) => (
            <Card key={phase.id} className={`transition-all hover:shadow-lg ${
              phase.status === 'active' ? 'ring-2 ring-primary' : 
              phase.status === 'locked' ? 'opacity-60' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{phase.name}</h3>
                  {phase.status === 'active' && <Zap className="h-4 w-4 text-primary animate-pulse" />}
                  {phase.status === 'locked' && <ShieldCheck className="h-4 w-4 text-muted-foreground" />}
                </div>
                <Progress value={phase.progress} className="mb-2" />
                <p className="text-xs text-muted-foreground">{phase.progress}% Complete</p>
              </CardContent>
            </Card>
          ))}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  achievement.completed 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-dashed border-muted-foreground/30 text-muted-foreground'
                }`}>
                  <achievement.icon className={`h-8 w-8 mb-2 ${
                    achievement.completed ? 'animate-pulse' : ''
                  }`} />
                  <span className="text-sm font-medium text-center">{achievement.name}</span>
                  {achievement.completed && (
                    <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary">
                      Unlocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
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
    </NotionLayout>
  );
}