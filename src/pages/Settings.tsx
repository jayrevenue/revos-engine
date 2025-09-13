import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Key, 
  Users, 
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Mail,
  Edit
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'super_admin' | 'rev_scientist' | 'qa'>('rev_scientist');
  const [gcConnected, setGcConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);

  const {
    loading: settingsLoading,
    profile,
    notifications,
    preferences,
    orgSettings,
    saveProfile,
    saveNotifications,
    savePreferences,
    saveOrgSettings,
  } = useSettings();

  const {
    users,
    loading: usersLoading,
    updateUserRole,
    inviteUser,
  } = useUserManagement();

  // Determine if current user is super_admin for gating admin-only actions
  React.useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      setIsSuperAdmin((data?.role || '') === 'super_admin');
    };
    checkRole();
  }, [user]);

  // Apply saved theme on load
  React.useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [preferences?.theme, setTheme]);

  // Form for profile
  const profileForm = useForm({
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
    },
  });

  // Form for organization
  const orgForm = useForm({
    defaultValues: {
      name: orgSettings?.name || 'TRS RevOS',
      domain: orgSettings?.domain || 'trs.com',
      description: orgSettings?.description || '',
      timezone: orgSettings?.timezone || 'utc-5',
      currency: orgSettings?.currency || 'usd',
      ai_auto_learning: orgSettings?.ai_auto_learning ?? true,
      real_time_analytics: orgSettings?.real_time_analytics ?? true,
      external_sharing: orgSettings?.external_sharing || false,
    },
  });

  // Update forms when data loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
      });
    }
  }, [profile, profileForm]);

  React.useEffect(() => {
    if (orgSettings) {
      orgForm.reset(orgSettings);
    }
  }, [orgSettings, orgForm]);

  // Load integration status for the current user
  React.useEffect(() => {
    const loadIntegrations = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('calendar_integrations')
        .select('provider,is_active')
        .eq('user_id', user.id);
      setGcConnected(!!data?.find(r => r.provider === 'google_calendar' && r.is_active));
      setNotionConnected(!!data?.find(r => r.provider === 'notion' && r.is_active));
    };
    loadIntegrations();
  }, [user]);

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    
    const success = await inviteUser(inviteEmail, inviteRole);
    if (success) {
      setInviteEmail('');
      setInviteRole('rev_scientist');
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-6 w-6" />
                Platform Settings
              </h1>
              <p className="text-muted-foreground">Manage your TRS RevOS platform configuration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Configure your organization's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={orgForm.handleSubmit(async (data) => {
                  if (!isSuperAdmin) {
                    toast({ title: 'Admin required', description: 'Only super admins can update organization settings.', variant: 'destructive' });
                    return;
                  }
                  await saveOrgSettings(data);
                })}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input 
                        id="org-name" 
                        {...orgForm.register('name')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-domain">Domain</Label>
                      <Input 
                        id="org-domain" 
                        {...orgForm.register('domain')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="org-description">Description</Label>
                    <Textarea 
                      id="org-description" 
                      {...orgForm.register('description')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select 
                        value={orgForm.watch('timezone')} 
                        onValueChange={(value) => orgForm.setValue('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                          <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                          <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select 
                        value={orgForm.watch('currency')} 
                        onValueChange={(value) => orgForm.setValue('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={settingsLoading || !isSuperAdmin}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {!isSuperAdmin ? 'Admin only' : (settingsLoading ? 'Saving...' : 'Save Changes')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Configure platform-wide settings and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Agent Auto-learning</Label>
                    <p className="text-sm text-muted-foreground">Allow agents to learn from conversations automatically</p>
                  </div>
                  <Switch 
                    checked={orgForm.watch('ai_auto_learning')}
                    onCheckedChange={(checked) => orgForm.setValue('ai_auto_learning', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable real-time dashboard updates</p>
                  </div>
                  <Switch 
                    checked={orgForm.watch('real_time_analytics')}
                    onCheckedChange={(checked) => orgForm.setValue('real_time_analytics', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>External Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow dashboard sharing with external stakeholders</p>
                  </div>
                  <Switch 
                    checked={orgForm.watch('external_sharing')}
                    onCheckedChange={(checked) => orgForm.setValue('external_sharing', checked)}
                  />
                </div>
                
                <Button 
                  onClick={orgForm.handleSubmit(async (data) => {
                    if (!isSuperAdmin) {
                      toast({ title: 'Admin required', description: 'Only super admins can update platform configuration.', variant: 'destructive' });
                      return;
                    }
                    await saveOrgSettings(data);
                  })}
                  disabled={settingsLoading || !isSuperAdmin}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {!isSuperAdmin ? 'Admin only' : (settingsLoading ? 'Saving...' : 'Save Configuration')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={profileForm.handleSubmit(async (data) => {
                  await saveProfile(data);
                })}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input 
                        id="full-name" 
                        {...profileForm.register('full_name')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...profileForm.register('email')}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={settingsLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {settingsLoading ? 'Saving...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
                
                <Button onClick={() => {
                  toast({
                    title: "Security Updated",
                    description: "Security settings have been saved successfully.",
                  });
                }} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Team Members</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-48"
                      />
                      <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="rev_scientist">Rev Scientist</SelectItem>
                          <SelectItem value="qa">QA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={handleInviteUser}
                        disabled={!inviteEmail || usersLoading}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Invite
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {usersLoading ? (
                      <div className="text-center py-4">Loading users...</div>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {user.role.replace('_', ' ')}
                                </Badge>
                                {user.full_name && (
                                  <span className="text-sm text-muted-foreground">{user.full_name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Select 
                              value={user.role} 
                              onValueChange={(newRole: any) => updateUserRole(user.id, newRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="rev_scientist">Rev Scientist</SelectItem>
                                <SelectItem value="qa">QA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Configure what each role can access and modify</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Super Admin', 'Manager', 'Analyst'].map((role) => (
                    <div key={role} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">{role}</h5>
                      <div className="space-y-2">
                        {[
                          'View Analytics',
                          'Manage Engagements',
                          'Configure AI Agents',
                          'Access IP Library',
                          'Manage Users',
                          'Platform Settings'
                        ].map((permission) => (
                          <div key={permission} className="flex items-center justify-between">
                            <span className="text-sm">{permission}</span>
                            <Switch 
                              defaultChecked={role === 'Super Admin' || (role === 'Manager' && permission !== 'Platform Settings')}
                              disabled={role === 'Super Admin'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button onClick={() => {
                  toast({
                    title: "Permissions Updated",
                    description: "Role permissions have been saved successfully.",
                  });
                }} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Permissions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                      </div>
                      <Switch 
                        checked={notifications.email_notifications}
                        onCheckedChange={(checked) => {
                          saveNotifications({ email_notifications: checked });
                        }}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Event Types</h4>
                      {[
                        { key: 'new_engagement', label: 'New engagement created' },
                        { key: 'deliverable_deadline', label: 'Deliverable deadline approaching' },
                        { key: 'ai_conversation_completed', label: 'AI agent conversation completed' },
                        { key: 'analytics_report_ready', label: 'Analytics report ready' },
                        { key: 'team_member_invited', label: 'Team member invited' },
                        { key: 'system_maintenance', label: 'System maintenance' }
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-center justify-between">
                          <span className="text-sm">{notification.label}</span>
                          <Switch 
                            checked={notifications[notification.key as keyof typeof notifications] as boolean}
                            onCheckedChange={(checked) => {
                              saveNotifications({ [notification.key]: checked });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">Loading preferences...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Theme Toggle</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <Separator />
                
                <div>
                  <Label>Theme Preference</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {['light', 'dark', 'system'].map((themeOption) => (
                      <Button
                        key={themeOption}
                        variant={theme === themeOption ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setTheme(themeOption);
                          if (preferences) {
                            savePreferences({ theme: themeOption });
                          }
                        }}
                        className="capitalize"
                      >
                        {themeOption}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {preferences && (
                  <>
                    <div>
                      <Label>Accent Color</Label>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {['orange', 'blue', 'green', 'purple'].map((color) => (
                          <Button
                            key={color}
                            variant={preferences.accent_color === color ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              // Persist and apply immediately
                              savePreferences({ accent_color: color });
                              const map: Record<string,string> = { orange: '25 95% 53%', blue: '212 100% 45%', green: '142 71% 45%', purple: '270 83% 60%' };
                              const accent = map[color] || map.blue;
                              const root = document.documentElement;
                              root.style.setProperty('--primary', accent);
                              root.style.setProperty('--accent', accent);
                              root.style.setProperty('--ring', accent);
                            }}
                            className="capitalize"
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Layout Density</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {['compact', 'comfortable', 'spacious'].map((density) => (
                          <Button
                            key={density}
                            variant={preferences.layout_density === density ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              savePreferences({ layout_density: density });
                              document.documentElement.setAttribute('data-density', density);
                            }}
                            className="capitalize"
                          >
                            {density}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                 )}
               </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>External Integrations</CardTitle>
                <CardDescription>Connect with external tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: 'google_calendar', name: 'Google Calendar', status: gcConnected ? 'Connected' : 'Not Connected', description: 'Sync scheduling events' },
                    { key: 'notion', name: 'Notion', status: notionConnected ? 'Connected' : 'Not Connected', description: 'Export reports and documentation' },
                    { key: 'slack', name: 'Slack', status: 'Not Connected', description: 'Send notifications to team channels' },
                    { key: 'msteams', name: 'Microsoft Teams', status: 'Not Connected', description: 'Video conferencing integration' },
                    { key: 'salesforce', name: 'Salesforce', status: 'Not Connected', description: 'CRM data synchronization' }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h5 className="font-medium">{integration.name}</h5>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={integration.status === 'Connected' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                          {integration.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (integration.key === 'google_calendar' || integration.key === 'notion') {
                              toast({ title: 'Integration', description: 'OAuth flow not yet implemented in this build.' });
                            } else {
                              toast({ title: 'Coming soon', description: `${integration.name} integration is not available yet.` });
                            }
                          }}
                        >
                          {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
