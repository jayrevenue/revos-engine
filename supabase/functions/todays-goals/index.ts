import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function addDays(date = new Date(), days = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use anon key with the user's JWT so RLS applies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const next7 = addDays(new Date(), 7);

    const [eventsRes, interventionsRes, outcomesRes, revenueRes, agentsRes, engagementsRes] = await Promise.all([
      supabase.from('events')
        .select('id,title,start_time,engagement_id')
        .gte('start_time', todayStart)
        .lt('start_time', todayEnd)
        .order('start_time', { ascending: true })
        .limit(50),
      supabase.from('interventions')
        .select('id,title,status,priority,due_date')
        .in('status', ['planned','in_progress'])
        .lte('due_date', next7)
        .order('due_date', { ascending: true })
        .limit(50),
      supabase.from('outcomes')
        .select('id,metric_name,baseline_value,current_value,target_value,measurement_date,engagement_id')
        .order('measurement_date', { ascending: false })
        .limit(100),
      supabase.from('revenue')
        .select('id,amount,invoice_date,payment_date,payment_status,description')
        .in('payment_status', ['pending','overdue'])
        .order('invoice_date', { ascending: true })
        .limit(50),
      supabase.from('ai_agents')
        .select('id,name,status,usage_stats,engagement_id,org_id')
        .order('updated_at', { ascending: false })
        .limit(50),
      supabase.from('engagements')
        .select('id,name,status,start_date,end_date,org_id')
        .eq('status','active')
        .limit(100)
    ]);

    const events = eventsRes.data ?? [];
    const interventions = interventionsRes.data ?? [];
    const outcomes = outcomesRes.data ?? [];
    const revenue = revenueRes.data ?? [];
    const agents = agentsRes.data ?? [];
    const engagements = engagementsRes.data ?? [];

    // Basic heuristics to highlight behind/outstanding items
    const behindOutcomes = outcomes.filter(o => {
      const t = Number(o.target_value ?? 0);
      const c = Number(o.current_value ?? 0);
      return isFinite(t) && isFinite(c) && t > 0 && c < t;
    }).slice(0, 10);

    const overdueRevenue = revenue.filter(r => r.payment_status === 'overdue').slice(0, 10);
    const pendingRevenue = revenue.filter(r => r.payment_status === 'pending').slice(0, 10);
    const inactiveAgents = agents.filter(a => a.status !== 'active').slice(0, 10);

    const context = {
      today: new Date().toISOString(),
      counts: {
        eventsToday: events.length,
        interventionsDueSoon: interventions.length,
        behindOutcomes: behindOutcomes.length,
        overdueRevenue: overdueRevenue.length,
        pendingRevenue: pendingRevenue.length,
        inactiveAgents: inactiveAgents.length,
        activeEngagements: engagements.length,
      },
      samples: {
        events: events.slice(0, 5),
        interventions: interventions.slice(0, 5),
        behindOutcomes: behindOutcomes.slice(0, 5),
        overdueRevenue: overdueRevenue.slice(0, 5),
        pendingRevenue: pendingRevenue.slice(0, 5),
        inactiveAgents: inactiveAgents.slice(0, 5),
      }
    };

    let tasks: any[] = [];
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (apiKey) {
      const prompt = [
        {
          role: 'system',
          content: 'You are the Chief Revenue Scientist’s planner. Generate 5-10 precise, high-impact, actionable goals for today based on the provided RevOS context. Output a strict JSON object with a `tasks` array; each task has: id (string), title, reason, type (engagement|intervention|outcome|revenue|event|agent|general), priority (critical|high|medium|low), due_date (ISO, today if possible). Keep titles short and imperative. Prioritize items that unblock revenue and outcomes. '
        },
        {
          role: 'user',
          content: `Context JSON:\n${JSON.stringify(context)}`
        }
      ];

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: prompt,
          temperature: 0.3,
        }),
      });

      if (openAIResponse.ok) {
        const data = await openAIResponse.json();
        const content = data.choices?.[0]?.message?.content || '';
        try {
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.tasks)) {
            tasks = parsed.tasks;
          }
        } catch (_) {
          // Fallback: try to extract JSON block
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              const parsed = JSON.parse(match[0]);
              if (parsed && Array.isArray(parsed.tasks)) tasks = parsed.tasks;
            } catch {}
          }
        }
      }
    }

    // Heuristic fallback if AI not available or parse failed
    if (!tasks.length) {
      const fallback: any[] = [];
      if (overdueRevenue.length) fallback.push({ id: 'rev-collect', title: 'Collect overdue invoices', reason: 'Overdue revenue blocks cash flow', type: 'revenue', priority: 'critical', due_date: todayEnd });
      if (interventions.length) fallback.push({ id: 'interv-prioritize', title: 'Prioritize interventions due soon', reason: 'Tasks due within 7 days', type: 'intervention', priority: 'high', due_date: next7 });
      if (behindOutcomes.length) fallback.push({ id: 'outcome-catchup', title: 'Plan actions to reach outcome targets', reason: 'Outcomes behind target', type: 'outcome', priority: 'high', due_date: next7 });
      if (events.length) fallback.push({ id: 'prep-events', title: 'Prepare for today’s sessions', reason: 'Meetings scheduled today', type: 'event', priority: 'medium', due_date: todayEnd });
      if (inactiveAgents.length) fallback.push({ id: 'agent-activate', title: 'Review inactive agents', reason: 'Enable automation leverage', type: 'agent', priority: 'low', due_date: next7 });
      tasks = fallback.slice(0, 6);
    }

    return new Response(JSON.stringify({ tasks, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in todays-goals function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

