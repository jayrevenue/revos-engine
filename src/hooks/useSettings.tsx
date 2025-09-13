import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ProfileData {
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  new_engagement: boolean;
  deliverable_deadline: boolean;
  ai_conversation_completed: boolean;
  analytics_report_ready: boolean;
  team_member_invited: boolean;
  system_maintenance: boolean;
}

export interface UserPreferences {
  theme: string;
  accent_color: string;
  layout_density: string;
}

export interface OrgSettings {
  name: string;
  domain?: string;
  description?: string;
  timezone: string;
  currency: string;
  ai_auto_learning: boolean;
  real_time_analytics: boolean;
  external_sharing: boolean;
}

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  
  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  
  // Organization
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);

  // Load profile data
  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data || { full_name: '', email: user.email || '' });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Load notification preferences
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setNotifications(data || {
        email_notifications: true,
        new_engagement: true,
        deliverable_deadline: true,
        ai_conversation_completed: true,
        analytics_report_ready: true,
        team_member_invited: true,
        system_maintenance: false,
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setPreferences(data || {
        theme: 'system',
        accent_color: 'orange',
        layout_density: 'comfortable',
      });
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Load organization settings
  const loadOrgSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('org_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setOrgSettings(data || {
        name: 'TRS RevOS',
        domain: 'trs.com',
        description: 'Leading revenue optimization consulting firm',
        timezone: 'utc-5',
        currency: 'usd',
        ai_auto_learning: true,
        real_time_analytics: true,
        external_sharing: false,
      });
    } catch (error) {
      console.error('Error loading org settings:', error);
    }
  };

  // Save profile
  const saveProfile = async (data: Partial<ProfileData>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data,
        });
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : data as ProfileData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save notifications
  const saveNotifications = async (data: Partial<NotificationPreferences>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...data,
        });
      
      if (error) throw error;
      
      setNotifications(prev => prev ? { ...prev, ...data } : data as NotificationPreferences);
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
      return true;
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async (data: Partial<UserPreferences>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...data,
        });
      
      if (error) throw error;
      
      setPreferences(prev => prev ? { ...prev, ...data } : data as UserPreferences);
      toast({
        title: "Preferences Updated",
        description: "Your appearance preferences have been saved.",
      });
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save organization settings
  const saveOrgSettings = async (data: Partial<OrgSettings>) => {
    setLoading(true);
    try {
      // First, get or create the default org
      let { data: org, error: orgError } = await supabase
        .from('orgs')
        .select('id')
        .limit(1)
        .single();
      
      if (orgError && orgError.code === 'PGRST116') {
        // Create default org if it doesn't exist
        const { data: newOrg, error: createError } = await supabase
          .from('orgs')
          .insert({ name: 'Default Organization' })
          .select('id')
          .single();
        
        if (createError) throw createError;
        org = newOrg;
      } else if (orgError) {
        throw orgError;
      }
      
      const { error } = await supabase
        .from('org_settings')
        .upsert({
          org_id: org.id,
          ...data,
        });
      
      if (error) throw error;
      
      setOrgSettings(prev => prev ? { ...prev, ...data } : data as OrgSettings);
      toast({
        title: "Organization Updated",
        description: "Organization settings have been saved.",
      });
      return true;
    } catch (error) {
      console.error('Error saving org settings:', error);
      toast({
        title: "Error",
        description: "Failed to save organization settings.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    if (user) {
      loadProfile();
      loadNotifications();
      loadPreferences();
      loadOrgSettings();
    }
  }, [user]);

  return {
    loading,
    profile,
    notifications,
    preferences,
    orgSettings,
    saveProfile,
    saveNotifications,
    savePreferences,
    saveOrgSettings,
  };
};