import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';

type Prefs = {
  theme?: string;
  accent_color?: string;
  layout_density?: string;
};

const ACCENT_HSL: Record<string, string> = {
  orange: '25 95% 53%',
  blue: '212 100% 45%',
  green: '142 71% 45%',
  purple: '270 83% 60%'
};

function applyAppearance(prefs: Prefs) {
  const root = document.documentElement;

  // Theme handled by next-themes via class, but ensure density + accent here
  const accent = ACCENT_HSL[prefs.accent_color || 'blue'];
  if (accent) {
    root.style.setProperty('--primary', accent);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--ring', accent);
  }

  const density = prefs.layout_density || 'comfortable';
  root.setAttribute('data-density', density);
}

export default function AppearanceInitializer() {
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const lastPrefs = useRef<Prefs | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (!active) return;
      if (data?.theme) setTheme(data.theme);
      const prefs = {
        theme: data?.theme || 'system',
        accent_color: data?.accent_color || 'blue',
        layout_density: data?.layout_density || 'comfortable',
      } as Prefs;
      lastPrefs.current = prefs;
      applyAppearance(prefs);
    };
    load();
    return () => { active = false; };
  }, [user, setTheme]);

  // Reapply accent and density after theme class changes to avoid .dark/.light overrides
  useEffect(() => {
    if (lastPrefs.current) {
      applyAppearance(lastPrefs.current);
    }
  }, [resolvedTheme]);

  return null;
}
