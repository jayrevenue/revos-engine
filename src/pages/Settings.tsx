import { useState } from 'react';
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
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  X
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Mock user roles for permissions
  const mockUserRoles = [
    { id: '1', email: 'admin@trs.com', role: 'Super Admin', status: 'Active' },
    { id: '2', email: 'analyst@trs.com', role: 'Analyst', status: 'Active' },
    { id: '3', email: 'manager@trs.com', role: 'Manager', status: 'Pending' },
  ];

  const handleSave = (section: string) => {
    toast({
      title: "Settings Updated",
      description: `${section} settings have been saved successfully.`,
    });
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
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
      <div className="container mx-auto px-6 py-6">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" defaultValue="TRS RevOS" />
                  </div>
                  <div>
                    <Label htmlFor="org-domain">Domain</Label>
                    <Input id="org-domain" defaultValue="trs.com" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea 
                    id="org-description" 
                    defaultValue="Leading revenue optimization consulting firm specializing in digital transformation and operational excellence."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue="utc-5">
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
                    <Select defaultValue="usd">
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
                
                <Button onClick={() => handleSave('Organization')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
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
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable real-time dashboard updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>External Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow dashboard sharing with external stakeholders</p>
                  </div>
                  <Switch />
                </div>
                
                <Button onClick={() => handleSave('Platform')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user.email || ''} />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself and your role at TRS..."
                  />
                </div>
                
                <Button onClick={() => handleSave('Profile')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Profile
                </Button>
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
                
                <Button onClick={() => handleSave('Security')} className="flex items-center gap-2">
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
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Team Members</h4>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Invite User
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {mockUserRoles.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge className={user.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                
                <Button onClick={() => handleSave('Permissions')} className="flex items-center gap-2">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Event Types</h4>
                    {[
                      'New engagement created',
                      'Deliverable deadline approaching',
                      'AI agent conversation completed',
                      'Analytics report ready',
                      'Team member invited',
                      'System maintenance'
                    ].map((notification) => (
                      <div key={notification} className="flex items-center justify-between">
                        <span className="text-sm">{notification}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={() => handleSave('Notifications')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
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
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <div key={theme} className="border rounded-lg p-3 cursor-pointer hover:bg-muted">
                        <div className="text-center">
                          <div className={`w-full h-8 rounded mb-2 ${
                            theme === 'Light' ? 'bg-white border' :
                            theme === 'Dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-white to-gray-900'
                          }`}></div>
                          <span className="text-sm">{theme}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {['blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'gray'].map((color) => (
                      <div 
                        key={color} 
                        className={`w-8 h-8 rounded-full cursor-pointer bg-${color}-500`}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Layout Density</Label>
                  <Select defaultValue="comfortable">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => handleSave('Appearance')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Appearance
                </Button>
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
                    { name: 'Google Calendar', status: 'Connected', description: 'Sync scheduling events' },
                    { name: 'Notion', status: 'Not Connected', description: 'Export reports and documentation' },
                    { name: 'Slack', status: 'Connected', description: 'Send notifications to team channels' },
                    { name: 'Microsoft Teams', status: 'Not Connected', description: 'Video conferencing integration' },
                    { name: 'Salesforce', status: 'Not Connected', description: 'CRM data synchronization' }
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
                        <Button variant="outline" size="sm">
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