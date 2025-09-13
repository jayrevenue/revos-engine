import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Search,
  Download,
  Filter,
  Calendar as CalendarIcon,
  User,
  FileText,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Monitor,
  Smartphone,
  Globe,
  Settings,
  UserCheck,
  Activity,
  Bell,
  Mail,
  Key,
  Fingerprint
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'auth' | 'data' | 'security' | 'system' | 'user' | 'compliance';
  resource: string;
  resourceId?: string;
  details: {
    [key: string]: any;
  };
  outcome: 'success' | 'failure' | 'pending';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  sessionId: string;
  correlationId?: string;
  compliance?: {
    regulation: string[];
    retention: number; // days
    sensitive: boolean;
  };
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'policy_violation' | 'anomaly_detected' | 'compliance_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  auditEvents: string[];
  detectedAt: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  mitigationActions: string[];
  affectedUsers: string[];
  riskScore: number; // 0-100
}

interface ComplianceReport {
  id: string;
  name: string;
  regulation: 'gdpr' | 'sox' | 'hipaa' | 'iso27001' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  status: 'generating' | 'completed' | 'failed';
  events: number;
  violations: number;
  coverage: number; // percentage
  generatedAt?: Date;
  downloadUrl?: string;
}

interface AuditFilter {
  userId?: string;
  category?: string;
  action?: string;
  outcome?: string;
  riskLevel?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

interface AuditTrailSystemProps {
  events: AuditEvent[];
  alerts: SecurityAlert[];
  reports: ComplianceReport[];
  onExportAudit?: (filter: AuditFilter) => void;
  onGenerateReport?: (regulation: string, period: { start: Date; end: Date }) => void;
  onResolveAlert?: (alertId: string, resolution: string) => void;
}

export const AuditTrailSystem = ({
  events,
  alerts,
  reports,
  onExportAudit,
  onGenerateReport,
  onResolveAlert
}: AuditTrailSystemProps) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AuditFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (filters.userId) {
      filtered = filtered.filter(event => event.userId.includes(filters.userId!));
    }

    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    if (filters.action) {
      filtered = filtered.filter(event => event.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }

    if (filters.outcome) {
      filtered = filtered.filter(event => event.outcome === filters.outcome);
    }

    if (filters.riskLevel) {
      filtered = filtered.filter(event => event.riskLevel === filters.riskLevel);
    }

    if (filters.dateRange?.start && filters.dateRange?.end) {
      filtered = filtered.filter(event => 
        event.timestamp >= filters.dateRange!.start! && 
        event.timestamp <= filters.dateRange!.end!
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.action.toLowerCase().includes(query) ||
        event.resource.toLowerCase().includes(query) ||
        event.userName.toLowerCase().includes(query) ||
        JSON.stringify(event.details).toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, filters, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: events.length,
      last24h: events.filter(e => e.timestamp >= last24h).length,
      last7d: events.filter(e => e.timestamp >= last7d).length,
      highRisk: events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length,
      failures: events.filter(e => e.outcome === 'failure').length,
      activeAlerts: alerts.filter(a => a.status === 'open').length,
      categories: {
        auth: events.filter(e => e.category === 'auth').length,
        data: events.filter(e => e.category === 'data').length,
        security: events.filter(e => e.category === 'security').length,
        system: events.filter(e => e.category === 'system').length,
        user: events.filter(e => e.category === 'user').length,
        compliance: events.filter(e => e.category === 'compliance').length
      }
    };
  }, [events, alerts]);

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login') || actionLower.includes('auth')) return <Key className="h-4 w-4" />;
    if (actionLower.includes('view') || actionLower.includes('read')) return <Eye className="h-4 w-4" />;
    if (actionLower.includes('edit') || actionLower.includes('update')) return <Edit className="h-4 w-4" />;
    if (actionLower.includes('delete') || actionLower.includes('remove')) return <Trash className="h-4 w-4" />;
    if (actionLower.includes('create') || actionLower.includes('add')) return <Plus className="h-4 w-4" />;
    if (actionLower.includes('download') || actionLower.includes('export')) return <Download className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Fingerprint className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failure': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    if (userAgent.includes('Desktop')) return <Monitor className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const handleExport = () => {
    onExportAudit?.(filters);
    toast({
      title: "Export Started",
      description: "Audit trail export is being prepared for download",
    });
  };

  const activeAlerts = alerts.filter(a => a.status === 'open');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Trail System</h2>
          <p className="text-muted-foreground">
            Comprehensive audit logging with compliance reporting and security monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Create an audit report for compliance requirements
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Report generation form would be implemented here</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Security Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800">Critical Security Alerts</h3>
            <Badge variant="destructive">{criticalAlerts.length}</Badge>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="text-sm text-red-700">
                <span className="font-medium">{alert.title}</span> - {alert.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.last24h} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.failures}</div>
            <p className="text-xs text-muted-foreground">
              Security incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Open investigations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Audit Events</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Event Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filters.category || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, category: value || undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="data">Data Access</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User Management</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.outcome || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, outcome: value || undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateRange.start,
                          to: dateRange.end
                        }}
                        onSelect={(range) => {
                          setDateRange({ start: range?.from, end: range?.to });
                          setFilters(prev => ({
                            ...prev,
                            dateRange: range?.from && range?.to ? {
                              start: range.from,
                              end: range.to
                            } : undefined
                          }));
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters({});
                        setSearchQuery('');
                        setDateRange({});
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {showAdvancedFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <Select value={filters.riskLevel || ''} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, riskLevel: value || undefined }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Risk Levels</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="User ID"
                      value={filters.userId || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value || undefined }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Events ({filteredEvents.length.toLocaleString()})</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(50, filteredEvents.length)} of {filteredEvents.length} events
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredEvents.slice(0, 50).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(event.category)}
                        {getActionIcon(event.action)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.action}</span>
                          <span className="text-muted-foreground">on</span>
                          <span className="font-medium">{event.resource}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.userName} • {event.timestamp.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getOutcomeColor(event.outcome)}>
                          {event.outcome}
                        </Badge>
                        <Badge className={getRiskColor(event.riskLevel)}>
                          {event.riskLevel}
                        </Badge>
                        {getDeviceIcon(event.userAgent)}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}

                  {filteredEvents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium">No events found</h3>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <Badge className={
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.status === 'open' ? 'destructive' : 'outline'}>
                        {alert.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Risk: {alert.riskScore}/100
                      </span>
                    </div>
                  </div>
                  <CardDescription>{alert.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Detected:</span>
                      <div className="font-medium">{alert.detectedAt.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Events:</span>
                      <div className="font-medium">{alert.auditEvents.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Affected Users:</span>
                      <div className="font-medium">{alert.affectedUsers.length}</div>
                    </div>
                  </div>

                  {alert.mitigationActions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Mitigation Actions:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {alert.mitigationActions.map((action, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onResolveAlert?.(alert.id, action);
                              toast({
                                title: "Action Initiated",
                                description: action,
                              });
                            }}
                            className="justify-start text-left h-auto py-2"
                          >
                            <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{action}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Security Alerts</h3>
                <p className="text-sm">All systems operating normally</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant={
                      report.status === 'completed' ? 'default' :
                      report.status === 'generating' ? 'secondary' :
                      'destructive'
                    }>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {report.regulation.toUpperCase()} Compliance Report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Period:</span>
                      <div className="font-medium">
                        {format(report.period.start, 'MMM d')} - {format(report.period.end, 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Events:</span>
                      <div className="font-medium">{report.events.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Violations:</span>
                      <div className={`font-medium ${report.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {report.violations}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coverage:</span>
                      <div className="font-medium">{report.coverage}%</div>
                    </div>
                  </div>

                  {report.status === 'completed' && report.downloadUrl && (
                    <Button className="w-full" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  )}

                  {report.generatedAt && (
                    <div className="text-xs text-muted-foreground">
                      Generated: {report.generatedAt.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Event Category Breakdown</CardTitle>
              <CardDescription>Distribution of audit events by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3 p-3 border rounded">
                    {getCategoryIcon(category)}
                    <div>
                      <div className="font-medium capitalize">{category}</div>
                      <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
              <CardDescription>Audit event volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2" />
                  <p>Timeline chart would be implemented here</p>
                  <p className="text-sm">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getActionIcon(selectedEvent.action)}
                Event Details
              </DialogTitle>
              <DialogDescription>
                {selectedEvent.action} on {selectedEvent.resource}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">User</label>
                  <div className="text-sm">{selectedEvent.userName} ({selectedEvent.userRole})</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <div className="text-sm">{selectedEvent.timestamp.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <div className="text-sm">{selectedEvent.ipAddress}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Session</label>
                  <div className="text-sm">{selectedEvent.sessionId}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">User Agent</label>
                <div className="text-sm text-muted-foreground">{selectedEvent.userAgent}</div>
              </div>

              {selectedEvent.location && (
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div className="text-sm">{selectedEvent.location.city}, {selectedEvent.location.country}</div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Event Details</label>
                <ScrollArea className="h-32">
                  <pre className="text-xs bg-muted p-3 rounded">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </ScrollArea>
              </div>

              {selectedEvent.compliance && (
                <div>
                  <label className="text-sm font-medium">Compliance Information</label>
                  <div className="text-sm space-y-1">
                    <div>Regulations: {selectedEvent.compliance.regulation.join(', ')}</div>
                    <div>Retention: {selectedEvent.compliance.retention} days</div>
                    <div>Sensitive: {selectedEvent.compliance.sensitive ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};