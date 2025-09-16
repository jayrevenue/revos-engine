import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, Building2, Briefcase, Target, Bot, CalendarDays, CheckCircle2, ArrowLeft, ArrowRight
} from 'lucide-react';

type StepKey = 'org' | 'engagement' | 'modules' | 'agent' | 'schedule' | 'done';

const steps: { key: StepKey; title: string; description: string; icon: any }[] = [
  { key: 'org', title: 'Organization', description: 'Create or select the client organization', icon: Building2 },
  { key: 'engagement', title: 'Engagement', description: 'Name and set dates for the engagement', icon: Briefcase },
  { key: 'modules', title: 'Modules', description: 'Pick RevOS modules to activate', icon: Target },
  { key: 'agent', title: 'AI Agent', description: 'Deploy a starter AI agent', icon: Bot },
  { key: 'schedule', title: 'Schedule', description: 'Create your first session', icon: CalendarDays },
  { key: 'done', title: 'Finish', description: 'Summary and next steps', icon: CheckCircle2 },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [active, setActive] = useState<StepKey>('org');
  const [saving, setSaving] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);

  // Collected IDs
  const [orgId, setOrgId] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState<string | null>(null);

  // Step 1: Org
  const [orgName, setOrgName] = useState('');

  // Step 2: Engagement
  const [engName, setEngName] = useState('New Engagement');
  const [engDesc, setEngDesc] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Step 3: Modules
  const [selectedModules, setSelectedModules] = useState<string[]>(['outcome_tracker', 'intervention_planner']);

  // Step 4: Agent
  const [agentName, setAgentName] = useState('AE Copilot');
  const [agentRole, setAgentRole] = useState('sales');

  // Step 5: Schedule
  const [sessionTitle, setSessionTitle] = useState('Kickoff Session');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());

  const progress = useMemo(() => {
    const idx = steps.findIndex(s => s.key === active);
    return Math.round(((idx + 1) / steps.length) * 100);
  }, [active]);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  // Load existing progress to resume
  useEffect(() => {
  const load = async () => {
    if (!user) return;
    // Use user preferences to track onboarding state
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
        setProgressId(data.id);
        // Use localStorage for onboarding state instead
        const onboardingState = localStorage.getItem('onboarding_state');
        if (onboardingState) {
          const state = JSON.parse(onboardingState);
          if (state.org_id) setOrgId(state.org_id);
          if (state.engagement_id) setEngagementId(state.engagement_id);
          if (state.step) setActive(state.step as StepKey);
        }
      }
    };
    load();
  }, [user]);

  const persistProgress = async (step: StepKey, oid?: string | null, eid?: string | null) => {
    if (!user) return;
    const payload: any = {
      user_id: user.id,
      step,
    };
    // Use user preferences to store progress
    if (user?.id) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...payload
        });
      if (error) console.error('Error saving progress:', error);
    }
  };

  const next = () => {
    const idx = steps.findIndex(s => s.key === active);
    if (idx < steps.length - 1) setActive(steps[idx + 1].key);
  };
  const prev = () => {
    const idx = steps.findIndex(s => s.key === active);
    if (idx > 0) setActive(steps[idx - 1].key);
  };

  const ensureOrg = async () => {
    if (!user) return null;
    if (orgId) return orgId;
    if (!orgName.trim()) {
      toast({ title: 'Organization name required', variant: 'destructive' });
      return null;
    }
    // Validate dates
    if (endDate && startDate && endDate < startDate) {
      toast({ title: 'End date must be after start date', variant: 'destructive' });
      return null;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('orgs').insert({ name: orgName }).select('id').single();
      if (error) throw error;
      setOrgId(data.id);
      // Add membership for current user (so RLS memberships are satisfied if enforced later)
      // Skip org_members insert as table doesn't exist
      await persistProgress('org', data.id, engagementId);
      toast({ title: 'Organization created' });
      return data.id;
    } catch (e: any) {
      toast({ title: 'Failed to create org', description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const ensureEngagement = async () => {
    if (!user) return null;
    if (engagementId) return engagementId;
    const oid = await ensureOrg();
    if (!oid) return null;
    setSaving(true);
    try {
      const payload: any = {
        org_id: oid,
        name: engName || 'New Engagement',
        description: engDesc,
        created_by: user.id,
        status: 'active',
        start_date: startDate ? startDate.toISOString().slice(0, 10) : null,
        end_date: endDate ? endDate.toISOString().slice(0, 10) : null,
      };
      const { data, error } = await supabase.from('engagements').insert(payload).select('id').single();
      if (error) throw error;
      setEngagementId(data.id);
      await persistProgress('engagement', orgId, data.id);
      toast({ title: 'Engagement created' });

      // Auto-create sample clarity audit dashboard and baseline outcomes
      await supabase.from('dashboards').insert({
        org_id: orgId || (await ensureOrg()),
        engagement_id: data.id,
        type: 'clarity_audit',
        data: {
          summary: 'Initial Clarity Audit generated by onboarding',
          notes: [],
        }
      });
      const baseline = [
        { metric_name: 'Revenue Baseline', baseline_value: 0, target_value: 100000, current_value: 0 },
        { metric_name: 'Conversion Rate (%)', baseline_value: 0, target_value: 10, current_value: 0 },
      ];
      await supabase.from('outcomes').insert(
        baseline.map(b => ({ ...b, engagement_id: data.id, created_by: user.id }))
      );
      return data.id;
    } catch (e: any) {
      toast({ title: 'Failed to create engagement', description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const createModules = async () => {
    if (!user) return false;
    const eid = await ensureEngagement();
    if (!eid) return false;
    if (!selectedModules.length) {
      toast({ title: 'Select at least one module', variant: 'destructive' });
      return false;
    }
    setSaving(true);
    try {
      const inserts = selectedModules.map((m) => ({ engagement_id: eid, module_type: m, title: m.replace('_', ' '), created_by: user.id, status: 'active' }));
      const { error } = await supabase.from('revos_modules').insert(inserts);
      if (error) throw error;
      await persistProgress('modules', orgId, engagementId);
      toast({ title: 'Modules added' });
      return true;
    } catch (e: any) {
      toast({ title: 'Failed to add modules', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createAgent = async () => {
    if (!user) return false;
    const eid = await ensureEngagement();
    const oid = orgId || (await ensureOrg());
    if (!eid || !oid) return false;
    setSaving(true);
    try {
      const { error } = await supabase.from('ai_agents').insert({
        name: agentName,
        role: agentRole,
        description: 'Starter agent deployed via onboarding',
        model: 'gpt-4o',
        status: 'active',
        created_by: user.id,
        engagement_id: eid,
        org_id: oid,
      });
      if (error) throw error;
      await persistProgress('agent', orgId, engagementId);
      toast({ title: 'AI Agent deployed' });
      return true;
    } catch (e: any) {
      toast({ title: 'Failed to deploy agent', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createSession = async () => {
    if (!user) return false;
    const eid = await ensureEngagement();
    if (!eid) return false;
    setSaving(true);
    try {
      const start = sessionDate ? new Date(sessionDate) : new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const { error } = await supabase.from('events').insert({
        title: sessionTitle,
        description: 'Initial onboarding session',
        event_type: 'engagement_session',
        engagement_id: eid,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        created_by: user.id,
      });
      if (error) throw error;
      await persistProgress('schedule', orgId, engagementId);
      toast({ title: 'Session scheduled' });
      return true;
    } catch (e: any) {
      toast({ title: 'Failed to schedule', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePrimary = async () => {
    switch (active) {
      case 'org': {
        const ok = await ensureOrg();
        if (ok) next();
        break;
      }
      case 'engagement': {
        const ok = await ensureEngagement();
        if (ok) next();
        break;
      }
      case 'modules': {
        const ok = await createModules();
        if (ok) next();
        break;
      }
      case 'agent': {
        const ok = await createAgent();
        if (ok) next();
        break;
      }
      case 'schedule': {
        const ok = await createSession();
        if (ok) next();
        break;
      }
      case 'done': {
        if (progressId) {
          // Save completion state to localStorage
          localStorage.setItem('onboarding_completed', 'true');
        }
        if (engagementId) navigate(`/engagements/${engagementId}`);
        else navigate('/engagements');
        break;
      }
    }
  };

  // Next best actions for Finish screen
  const [nbaLoading, setNbaLoading] = useState(false);
  const [nba, setNba] = useState<any[]>([]);
  const loadNextBestActions = async () => {
    try {
      setNbaLoading(true);
      const { data, error } = await supabase.functions.invoke('todays-goals', { body: {} });
      if (error) throw error;
      setNba(data?.tasks || []);
    } catch (e) {
      // ignore
    } finally {
      setNbaLoading(false);
    }
  };

  const stepContent = () => {
    switch (active) {
      case 'org':
        return (
          <div className="space-y-4">
            <Label>Organization Name</Label>
            <Input placeholder="Acme Corp" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <p className="text-sm text-muted-foreground">Creates the client container for this engagement.</p>
          </div>
        );
      case 'engagement':
        return (
          <div className="space-y-4">
            <Label>Engagement Name</Label>
            <Input value={engName} onChange={(e) => setEngName(e.target.value)} />
            <Label>Description</Label>
            <Textarea value={engDesc} onChange={(e) => setEngDesc(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="rounded-md border mt-2" />
              </div>
              <div>
                <Label>End Date (optional)</Label>
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="rounded-md border mt-2" />
              </div>
            </div>
          </div>
        );
      case 'modules':
        return (
          <div className="space-y-3">
            {[
              { key: 'outcome_tracker', label: 'Outcome Tracker' },
              { key: 'intervention_planner', label: 'Intervention Planner' },
              { key: 'pricing_strategy', label: 'Pricing Strategy Builder' },
              { key: 'cac_compression', label: 'CAC Compression Toolkit' },
              { key: 'agent_deployment', label: 'Agent Deployment SOP' },
            ].map((m) => (
              <label key={m.key} className="flex items-center gap-3">
                <Checkbox
                  checked={selectedModules.includes(m.key)}
                  onCheckedChange={(c) => {
                    setSelectedModules((prev) => (c ? [...prev, m.key] : prev.filter((x) => x !== m.key)));
                  }}
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        );
      case 'agent':
        return (
          <div className="space-y-4">
            <Label>Agent Name</Label>
            <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            <Label>Agent Role</Label>
            <Input value={agentRole} onChange={(e) => setAgentRole(e.target.value)} placeholder="e.g., sales, financial, compliance" />
            <p className="text-sm text-muted-foreground">You can refine advanced prompts and tools later.</p>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <Label>Session Title</Label>
            <Input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
            <Label>Session Date</Label>
            <Calendar mode="single" selected={sessionDate} onSelect={setSessionDate} className="rounded-md border mt-2" />
            <p className="text-sm text-muted-foreground">You can manage invites and conferencing links under Scheduling.</p>
          </div>
        );
      case 'done':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" />
              <p className="font-medium">Onboarding complete</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Go to Engagement</CardTitle>
                  <CardDescription>Manage Gap Map & Clarity Audit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => engagementId ? navigate(`/engagements/${engagementId}`) : navigate('/engagements')}>Open</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Open Agents</CardTitle>
                  <CardDescription>Chat and configure prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/agents')}>Agents</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">View Scheduling</CardTitle>
                  <CardDescription>Plan next sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/scheduling')}>Scheduling</Button>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Next Best Actions</p>
                <Button variant="outline" size="sm" onClick={loadNextBestActions} disabled={nbaLoading}>
                  {nbaLoading ? 'Loading…' : 'Generate'}
                </Button>
              </div>
              <div className="space-y-2">
                {nba.length === 0 && <p className="text-sm text-muted-foreground">No actions yet. Click Generate to fetch AI suggestions.</p>}
                {nba.map((t, i) => (
                  <div key={t.id || i} className="p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{String(t.type || 'general')}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{String(t.priority || 'medium')}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{t.title}</p>
                    {t.reason && <p className="text-xs text-muted-foreground">{t.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Engagement Onboarding</h1>
            <p className="text-muted-foreground">A guided, end-to-end setup for new engagements</p>
          </div>
        </div>
        <div className="w-48">
          <Progress value={progress} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Steps sidebar */}
        <div className="lg:col-span-1 bg-card border rounded-lg p-4 h-fit">
          <div className="space-y-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.key === active;
              const completed = steps.findIndex(x => x.key === active) > idx;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{s.title}</span>
                    {completed && <Badge variant="secondary">Done</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{steps.find(s => s.key === active)?.title}</CardTitle>
              <CardDescription>{steps.find(s => s.key === active)?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stepContent()}
              <Separator />
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={prev} disabled={active === 'org' || saving}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {active !== 'done' ? (
                    <Button onClick={handlePrimary} disabled={saving}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={() => engagementId ? navigate(`/engagements/${engagementId}`) : navigate('/engagements')}>
                      Go to Engagement
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {engagementId && (
                    <Button variant="destructive" onClick={async () => {
                      const really = window.confirm('Delete this engagement and related data created in onboarding?');
                      if (!really) return;
                      try {
                        setSaving(true);
                        const { error } = await supabase.from('engagements').delete().eq('id', engagementId);
                        if (error) throw error;
                        setEngagementId(null);
                        await persistProgress(active, orgId, null);
                        toast({ title: 'Engagement deleted' });
                      } catch (e: any) {
                        toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
                      } finally {
                        setSaving(false);
                      }
                    }}>Delete Engagement</Button>
                  )}
                  <Button variant="outline" disabled={!progressId} onClick={async () => {
                    if (!progressId) return;
                    const really = window.confirm('Reset onboarding wizard? This will clear your progress record (created data will remain).');
                    if (!really) return;
                    // Clear onboarding state from localStorage
                    localStorage.removeItem('onboarding_state');
                    localStorage.removeItem('onboarding_completed');
                    setProgressId(null);
                    setActive('org');
                    toast({ title: 'Wizard reset' });
                  }}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
