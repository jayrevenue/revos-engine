import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  DollarSign,
  Info
} from "lucide-react";

type Milestone = { id: string | number; title: string; completed: boolean; week?: number };
type Phase = { id: string | number; title: string; subtitle?: string; milestones: Milestone[] };

// Note: No dummy data. Phases start empty and can be created by the user.
// Data persists locally so you can start using it immediately.

 
 
 
 

export function EmpireRoadmap() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<Phase["id"] | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseSubtitle, setNewPhaseSubtitle] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("empire_roadmap");
      if (stored) {
        const parsed: Phase[] = JSON.parse(stored);
        setPhases(parsed);
        if (parsed.length > 0) setSelectedPhase(parsed[0].id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("empire_roadmap", JSON.stringify(phases));
    } catch {}
  }, [phases]);

  const selectedPhaseData = useMemo(
    () => phases.find((p) => p.id === selectedPhase),
    [phases, selectedPhase]
  );

  const addPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now();
    const phase: Phase = { id, title: newPhaseTitle.trim(), subtitle: newPhaseSubtitle.trim() || undefined, milestones: [] };
    const next = [...phases, phase];
    setPhases(next);
    setSelectedPhase(id);
    setNewPhaseTitle("");
    setNewPhaseSubtitle("");
  };

  const toggleMilestone = (milestoneId: Milestone["id"]) => {
    if (!selectedPhaseData) return;
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== selectedPhaseData.id
          ? p
          : { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m)) }
      )
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
      {/* Phase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-4">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">No phases yet</h3>
                  <p className="text-sm text-muted-foreground">Add your first phase to start planning your roadmap.</p>
                </div>
                <div className="flex gap-2 items-end">
                  <div>
                    <label className="text-xs block mb-1">Title</label>
                    <Input value={newPhaseTitle} onChange={(e) => setNewPhaseTitle(e.target.value)} placeholder="e.g., Foundation" />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Subtitle</label>
                    <Input value={newPhaseSubtitle} onChange={(e) => setNewPhaseSubtitle(e.target.value)} placeholder="Optional" />
                  </div>
                  <Button onClick={addPhase} disabled={!newPhaseTitle.trim()}>Add Phase</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {phases.map((phase) => (
          <Card 
            key={phase.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedPhase === phase.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedPhase(phase.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Users className={`h-6 w-6 ${selectedPhase === phase.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex items-center gap-2">
                  <Badge variant={selectedPhase === phase.id ? 'default' : 'secondary'}>
                    {selectedPhase === phase.id ? 'Active' : 'Pending'}
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Phase status"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" className="max-w-xs">
                      Active = current focus. Pending = upcoming. Click a card to view details for that phase.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{phase.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{phase.subtitle}</p>
              <Progress value={phase.milestones.length === 0 ? 0 : Math.round((phase.milestones.filter(m => m.completed).length / phase.milestones.length) * 100)} className="mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{phase.milestones.filter(m => m.completed).length}/{phase.milestones.length} tasks</span>
                <span>{phase.milestones.length === 0 ? 0 : Math.round((phase.milestones.filter(m => m.completed).length / phase.milestones.length) * 100)}%</span>
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
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{selectedPhaseData.title}</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          aria-label="Help: Phase details"
                          className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                        >
                          <Info className="h-4 w-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-sm">
                        This view shows milestones, progress, and success metrics for the selected phase. Use the controls to start tasks, set reminders, and manage completion.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPhaseData.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{selectedPhaseData.milestones.length === 0 ? 0 : Math.round((selectedPhaseData.milestones.filter(m => m.completed).length / selectedPhaseData.milestones.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <Progress value={selectedPhaseData.milestones.length === 0 ? 0 : Math.round((selectedPhaseData.milestones.filter(m => m.completed).length / selectedPhaseData.milestones.length) * 100)} className="w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Next Task
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-sm">
                    Jumps to the next incomplete milestone in this phase and opens its details.
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-sm">
                    Schedule a reminder for a milestone or the phase to keep momentum.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-completed" 
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked === true)}
                />
                <div className="flex items-center gap-1">
                  <label htmlFor="show-completed" className="text-sm">Show completed</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Help: Show completed"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" className="max-w-xs">
                      Toggle visibility of completed milestones to focus on what’s left.
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                    {milestone.week ? (
                      <Badge variant="outline">Week {milestone.week}</Badge>
                    ) : null}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => toggleMilestone(milestone.id)}>
                          {milestone.completed ? 'Undo' : 'Mark Complete'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end" className="max-w-sm">
                        {milestone.completed ? 'Mark as not completed' : 'Marks the milestone as done and updates phase progress.'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase Summary */}
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-primary">Phase Success Metrics</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      tabIndex={0}
                      aria-label="Help: Phase success metrics"
                      className="inline-flex h-5 w-5 items-center justify-center text-primary/80 hover:text-primary cursor-help"
                    >
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-sm">
                    Benchmarks that define “done” for the phase. Hitting these means you’re ready to move to the next phase.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">Define what success means for this phase using your own metrics and targets.</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}
