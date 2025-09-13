import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  Star,
  PlayCircle,
  Users,
  Building,
  Briefcase,
  DollarSign
} from "lucide-react";

const roadmapPhases = [
  {
    id: 1,
    title: "Foundation & Legal Structure",
    subtitle: "Months 1-3: While keeping W-2 job",
    status: "active",
    progress: 75,
    totalTasks: 12,
    completedTasks: 9,
    icon: Building,
    color: "primary",
    milestones: [
      { id: 1, title: "Form Burgess Family Trust", completed: true, week: 1 },
      { id: 2, title: "Register Lamb Capital Holdings, LLC", completed: true, week: 1 },
      { id: 3, title: "Form The Revenue Scientists, LLC + S-Corp", completed: true, week: 2 },
      { id: 4, title: "Form TRS IP, LLC in Delaware", completed: true, week: 2 },
      { id: 5, title: "Form Vibe AI Solutions, LLC", completed: true, week: 3 },
      { id: 6, title: "Form Burgess Investments, LLC", completed: true, week: 3 },
      { id: 7, title: "Open separate bank accounts", completed: true, week: 4 },
      { id: 8, title: "Set up QuickBooks for each entity", completed: true, week: 6 },
      { id: 9, title: "Draft intercompany agreements", completed: true, week: 8 },
      { id: 10, title: "Execute all legal agreements", completed: false, week: 10 },
      { id: 11, title: "Document RevenueOS IP", completed: false, week: 11 },
      { id: 12, title: "Start first Vibe AI projects", completed: false, week: 12 },
    ]
  },
  {
    id: 2,
    title: "IP Development & First Revenue",
    subtitle: "Months 4-9: Building while employed",
    status: "pending",
    progress: 25,
    totalTasks: 10,
    completedTasks: 2,
    icon: Star,
    color: "accent",
    milestones: [
      { id: 13, title: "Complete RevenueOS package", completed: false, week: 16 },
      { id: 14, title: "Create licensing templates", completed: false, week: 18 },
      { id: 15, title: "Identify licensing prospects", completed: false, week: 22 },
      { id: 16, title: "Scale Vibe AI to $15-25K/month", completed: false, week: 24 },
      { id: 17, title: "Close first IP licensing deal", completed: false, week: 26 },
      { id: 18, title: "Take salary from TRS", completed: false, week: 28 },
      { id: 19, title: "Implement anti-consulting rules", completed: false, week: 30 },
      { id: 20, title: "Build case studies", completed: false, week: 32 },
      { id: 21, title: "Identify equity partnership", completed: false, week: 34 },
      { id: 22, title: "Consider reducing W-2 to part-time", completed: false, week: 36 },
    ]
  },
  {
    id: 3,
    title: "Scale & First Acquisitions",
    subtitle: "Months 10-15: Transition to full-time",
    status: "locked",
    progress: 0,
    totalTasks: 8,
    completedTasks: 0,
    icon: Trophy,
    color: "secondary",
    milestones: [
      { id: 23, title: "Execute first equity deal", completed: false, week: 40 },
      { id: 24, title: "Exit W-2 job", completed: false, week: 44 },
      { id: 25, title: "Increase TRS salary", completed: false, week: 44 },
      { id: 26, title: "Close 2-3 IP licensing deals", completed: false, week: 48 },
      { id: 27, title: "Operationalize investments", completed: false, week: 50 },
      { id: 28, title: "Execute first acquisition", completed: false, week: 56 },
      { id: 29, title: "Install TRS in acquired business", completed: false, week: 58 },
      { id: 30, title: "Build team & revenue board", completed: false, week: 60 },
    ]
  },
  {
    id: 4,
    title: "Empire Operations & Scaling",
    subtitle: "Months 16-18+: Revenue expert status",
    status: "locked",
    progress: 0,
    totalTasks: 6,
    completedTasks: 0,
    icon: Users,
    color: "muted",
    milestones: [
      { id: 31, title: "Multiple IP licensing deals", completed: false, week: 64 },
      { id: 32, title: "2-3 equity partnerships", completed: false, week: 68 },
      { id: 33, title: "1-2 acquired businesses", completed: false, week: 70 },
      { id: 34, title: "Automated systems", completed: false, week: 72 },
      { id: 35, title: "Market recognition", completed: false, week: 74 },
      { id: 36, title: "$30K+ monthly revenue", completed: false, week: 76 },
    ]
  }
];

export function EmpireRoadmap() {
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [showCompleted, setShowCompleted] = useState(true);

  const selectedPhaseData = roadmapPhases.find(phase => phase.id === selectedPhase);

  return (
    <div className="space-y-6">
      {/* Phase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roadmapPhases.map((phase) => (
          <Card 
            key={phase.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPhase === phase.id 
                ? `ring-2 ring-${phase.color}` 
                : phase.status === 'locked' 
                ? 'opacity-60' 
                : ''
            }`}
            onClick={() => phase.status !== 'locked' && setSelectedPhase(phase.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <phase.icon className={`h-6 w-6 ${
                  phase.status === 'active' ? 'text-primary animate-pulse' :
                  phase.status === 'pending' ? 'text-accent' :
                  'text-muted-foreground'
                }`} />
                <Badge variant={
                  phase.status === 'active' ? 'default' :
                  phase.status === 'pending' ? 'secondary' :
                  'outline'
                }>
                  {phase.status === 'active' ? 'Active' :
                   phase.status === 'pending' ? 'Pending' :
                   'Locked'}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{phase.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{phase.subtitle}</p>
              <Progress value={phase.progress} className="mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{phase.completedTasks}/{phase.totalTasks} tasks</span>
                <span>{phase.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Phase View */}
      {selectedPhaseData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <selectedPhaseData.icon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>{selectedPhaseData.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedPhaseData.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{selectedPhaseData.progress}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <Progress value={selectedPhaseData.progress} className="w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Next Task
                </Button>
                <Button variant="ghost" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-completed" 
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked === true)}
                />
                <label htmlFor="show-completed" className="text-sm">Show completed</label>
              </div>
            </div>

            <div className="space-y-4">
              {selectedPhaseData.milestones
                .filter(milestone => showCompleted || !milestone.completed)
                .map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    milestone.completed 
                      ? 'bg-muted/30 border-muted' 
                      : 'bg-background border-border hover:shadow-sm'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className={`font-medium ${
                      milestone.completed ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">Week {milestone.week}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Week {milestone.week}
                    </Badge>
                    {!milestone.completed && (
                      <Button variant="ghost" size="sm">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Phase Summary */}
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Phase Success Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {selectedPhaseData.id === 1 && (
                  <>
                    <div>
                      <p className="font-medium">Legal Structure</p>
                      <p className="text-muted-foreground">All entities formed & operational</p>
                    </div>
                    <div>
                      <p className="font-medium">Banking Setup</p>
                      <p className="text-muted-foreground">Separate accounts for each entity</p>
                    </div>
                    <div>
                      <p className="font-medium">IP Documentation</p>
                      <p className="text-muted-foreground">RevenueOS ready for licensing</p>
                    </div>
                  </>
                )}
                {selectedPhaseData.id === 2 && (
                  <>
                    <div>
                      <p className="font-medium">First IP License</p>
                      <p className="text-muted-foreground">$2K+ monthly recurring</p>
                    </div>
                    <div>
                      <p className="font-medium">Consulting Revenue</p>
                      <p className="text-muted-foreground">$15-25K monthly from Vibe AI</p>
                    </div>
                    <div>
                      <p className="font-medium">TRS Salary</p>
                      <p className="text-muted-foreground">$3-5K monthly from S-corp</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}