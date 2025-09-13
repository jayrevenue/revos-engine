import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, Share2, Eye, Clock, Users, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SharedDashboard {
  id: string;
  title: string;
  type: 'gap-map' | 'clarity-audit' | 'agent-roi' | 'overview';
  shareUrl: string;
  isPublic: boolean;
  expiresAt: Date | null;
  accessCount: number;
  createdAt: Date;
  lastAccessed: Date | null;
}

const DashboardSharing = () => {
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    requirePassword: false,
    password: '',
    expiresInDays: 30,
    allowedDomains: '',
    description: ''
  });

  // Mock data for shared dashboards
  const sharedDashboards: SharedDashboard[] = [
    {
      id: '1',
      title: 'Q4 Gap Analysis Report',
      type: 'gap-map',
      shareUrl: 'https://revos.app/share/gap-analysis-q4-2024',
      isPublic: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      accessCount: 24,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Clarity Audit - TechCorp',
      type: 'clarity-audit',
      shareUrl: 'https://revos.app/share/clarity-techcorp-dec24',
      isPublic: false,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      accessCount: 8,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'AI Agent ROI Dashboard',
      type: 'agent-roi',
      shareUrl: 'https://revos.app/share/agent-roi-analysis-2024',
      isPublic: true,
      expiresAt: null,
      accessCount: 156,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  const generateShareLink = () => {
    if (!selectedDashboard) {
      toast({
        title: "Error",
        description: "Please select a dashboard to share",
        variant: "destructive",
      });
      return;
    }

    const shareId = Math.random().toString(36).substring(2, 15);
    const shareUrl = `https://revos.app/share/${selectedDashboard}-${shareId}`;
    
    toast({
      title: "Share Link Generated",
      description: "Dashboard share link has been created successfully",
    });

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    setIsShareDialogOpen(false);
  };

  const exportToPDF = async (dashboardId: string, title: string) => {
    try {
      // Find the dashboard element to export
      const element = document.getElementById('dashboard-content');
      if (!element) {
        toast({
          title: "Error",
          description: "Dashboard content not found for export",
          variant: "destructive",
        });
        return;
      }

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "PDF Exported",
        description: "Dashboard has been exported to PDF successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export dashboard to PDF",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const getDashboardTypeColor = (type: string) => {
    switch (type) {
      case 'gap-map': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'clarity-audit': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'agent-roi': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'overview': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Sharing</h2>
          <p className="text-muted-foreground">Share dashboards securely with clients and stakeholders</p>
        </div>
        
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Dashboard</DialogTitle>
              <DialogDescription>
                Configure sharing settings for your dashboard
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="dashboard">Select Dashboard</Label>
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose dashboard to share" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gap-map">Gap Map Dashboard</SelectItem>
                    <SelectItem value="clarity-audit">Clarity Audit Dashboard</SelectItem>
                    <SelectItem value="agent-roi">Agent ROI Dashboard</SelectItem>
                    <SelectItem value="overview">Overview Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Public Access</Label>
                <Switch 
                  id="public"
                  checked={shareSettings.isPublic}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Require Password</Label>
                <Switch 
                  id="password"
                  checked={shareSettings.requirePassword}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, requirePassword: checked }))}
                />
              </div>
              
              {shareSettings.requirePassword && (
                <div>
                  <Label htmlFor="pwd">Password</Label>
                  <Input 
                    id="pwd"
                    type="password"
                    value={shareSettings.password}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="expires">Expires In (Days)</Label>
                <Select 
                  value={shareSettings.expiresInDays.toString()} 
                  onValueChange={(value) => setShareSettings(prev => ({ ...prev, expiresInDays: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                    <SelectItem value="90">3 Months</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description"
                  value={shareSettings.description}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description for this shared dashboard..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={generateShareLink} className="flex-1">
                  Generate Link
                </Button>
                <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Shares */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shared Dashboards</CardTitle>
          <CardDescription>Manage and monitor your shared dashboard links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedDashboards.map((dashboard) => (
              <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  <Share2 className="h-5 w-5 mt-1 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{dashboard.title}</h4>
                      <Badge className={getDashboardTypeColor(dashboard.type)}>
                        {dashboard.type.replace('-', ' ')}
                      </Badge>
                      {dashboard.isPublic ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{dashboard.accessCount} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Created {formatDate(dashboard.createdAt)}</span>
                      </div>
                      <div>
                        {dashboard.expiresAt ? `Expires ${formatDate(dashboard.expiresAt)}` : 'No expiration'}
                      </div>
                      <div>
                        {dashboard.lastAccessed ? `Last viewed ${formatDate(dashboard.lastAccessed)}` : 'Never accessed'}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-muted rounded text-sm font-mono">
                      {dashboard.shareUrl}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyShareLink(dashboard.shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToPDF(dashboard.id, dashboard.title)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sharing Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedDashboards.length}</div>
            <p className="text-xs text-muted-foreground">Active dashboard shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sharedDashboards.reduce((sum, d) => sum + d.accessCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all shared dashboards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Shares</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sharedDashboards.filter(d => d.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">Publicly accessible</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSharing;