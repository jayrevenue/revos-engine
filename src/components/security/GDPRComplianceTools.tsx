import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Lock,
  Eye,
  Download,
  Trash,
  FileText,
  User,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Key,
  Database,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Activity,
  Settings,
  Archive,
  Unlock,
  Copy,
  RefreshCw
} from 'lucide-react';

interface PersonalData {
  id: string;
  userId: string;
  category: 'identity' | 'contact' | 'financial' | 'behavioral' | 'technical' | 'health' | 'biometric';
  dataType: string;
  value: string;
  encrypted: boolean;
  source: string;
  collectedAt: Date;
  lastAccessed?: Date;
  processingPurpose: string[];
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  retentionPeriod: number; // months
  thirdPartySharing: boolean;
  location: 'eu' | 'us' | 'other';
  sensitive: boolean;
}

interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  method: 'explicit' | 'implied' | 'opt_in' | 'opt_out';
  ipAddress: string;
  userAgent: string;
  evidence: string;
  withdrawnAt?: Date;
  lastUpdated: Date;
  version: string;
  parentConsent?: string; // for consent updates
}

interface DataRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired';
  requestedAt: Date;
  dueDate: Date;
  description: string;
  requestorInfo: {
    name: string;
    email: string;
    verificationMethod: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
  };
  processingNotes: string[];
  affectedData: string[];
  completedAt?: Date;
  deliveryMethod: 'email' | 'secure_download' | 'api' | 'physical';
  assignedTo?: string;
}

interface PrivacyImpactAssessment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  createdAt: Date;
  lastUpdated: Date;
  createdBy: string;
  dataCategories: string[];
  processingActivities: string[];
  riskFactors: {
    factor: string;
    likelihood: number; // 1-5
    impact: number; // 1-5
    mitigation: string;
  }[];
  complianceChecks: {
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant';
    notes: string;
  }[];
  approver?: string;
  nextReviewDate?: Date;
}

interface BreachIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'contained' | 'resolved';
  discoveredAt: Date;
  reportedAt?: Date;
  affectedRecords: number;
  dataCategories: string[];
  rootCause?: string;
  containmentActions: string[];
  notificationRequired: boolean;
  notificationsSent: {
    authority: string;
    sentAt: Date;
    method: string;
  }[];
  affectedIndividuals: string[];
  remediationSteps: string[];
  assignedTo: string;
  estimatedImpact: string;
}

interface GDPRComplianceToolsProps {
  personalData: PersonalData[];
  consentRecords: ConsentRecord[];
  dataRequests: DataRequest[];
  piaAssessments: PrivacyImpactAssessment[];
  breachIncidents: BreachIncident[];
  onProcessRequest?: (requestId: string, action: string) => void;
  onUpdateConsent?: (userId: string, purpose: string, granted: boolean) => void;
  onEncryptData?: (dataId: string) => void;
  onDeleteData?: (dataId: string) => void;
}

export const GDPRComplianceTools = ({
  personalData,
  consentRecords,
  dataRequests,
  piaAssessments,
  breachIncidents,
  onProcessRequest,
  onUpdateConsent,
  onEncryptData,
  onDeleteData
}: GDPRComplianceToolsProps) => {
  const { toast } = useToast();
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [encryptionInProgress, setEncryptionInProgress] = useState<string[]>([]);

  // Calculate compliance metrics
  const complianceMetrics = useMemo(() => {
    const now = new Date();
    const overdueRequests = dataRequests.filter(req => req.dueDate < now && req.status !== 'completed');
    const pendingRequests = dataRequests.filter(req => req.status === 'pending');
    const expiredConsents = consentRecords.filter(consent => {
      const expiryDate = new Date(consent.timestamp);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 year consent validity
      return expiryDate < now && consent.granted;
    });
    const unencryptedSensitive = personalData.filter(data => data.sensitive && !data.encrypted);
    const retentionViolations = personalData.filter(data => {
      const retentionDate = new Date(data.collectedAt);
      retentionDate.setMonth(retentionDate.getMonth() + data.retentionPeriod);
      return retentionDate < now;
    });

    const totalDataSubjects = new Set(personalData.map(d => d.userId)).size;
    const consentCompliance = consentRecords.filter(c => c.granted).length / Math.max(consentRecords.length, 1);
    const encryptionCompliance = personalData.filter(d => d.encrypted || !d.sensitive).length / Math.max(personalData.length, 1);
    
    return {
      overdueRequests: overdueRequests.length,
      pendingRequests: pendingRequests.length,
      expiredConsents: expiredConsents.length,
      unencryptedSensitive: unencryptedSensitive.length,
      retentionViolations: retentionViolations.length,
      totalDataSubjects,
      consentCompliance: Math.round(consentCompliance * 100),
      encryptionCompliance: Math.round(encryptionCompliance * 100),
      overallCompliance: Math.round((consentCompliance + encryptionCompliance) / 2 * 100)
    };
  }, [personalData, consentRecords, dataRequests]);

  // Filter personal data
  const filteredPersonalData = useMemo(() => {
    let filtered = personalData;

    if (selectedDataType) {
      filtered = filtered.filter(data => data.category === selectedDataType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(data =>
        data.dataType.toLowerCase().includes(query) ||
        data.userId.toLowerCase().includes(query) ||
        data.source.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.collectedAt.getTime() - a.collectedAt.getTime());
  }, [personalData, selectedDataType, searchQuery]);

  const getDataIcon = (category: string) => {
    switch (category) {
      case 'identity': return <User className="h-4 w-4" />;
      case 'contact': return <Mail className="h-4 w-4" />;
      case 'financial': return <CreditCard className="h-4 w-4" />;
      case 'behavioral': return <Activity className="h-4 w-4" />;
      case 'technical': return <Settings className="h-4 w-4" />;
      case 'health': return <Shield className="h-4 w-4" />;
      case 'biometric': return <Key className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'access': return <Eye className="h-4 w-4" />;
      case 'rectification': return <Settings className="h-4 w-4" />;
      case 'erasure': return <Trash className="h-4 w-4" />;
      case 'portability': return <Download className="h-4 w-4" />;
      case 'restriction': return <Lock className="h-4 w-4" />;
      case 'objection': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'resolved': case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'rejected': case 'failed': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'very_high': case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const handleEncryptData = async (dataId: string) => {
    setEncryptionInProgress(prev => [...prev, dataId]);
    
    // Simulate encryption process
    setTimeout(() => {
      onEncryptData?.(dataId);
      setEncryptionInProgress(prev => prev.filter(id => id !== dataId));
      toast({
        title: "Data Encrypted",
        description: "Personal data has been successfully encrypted",
      });
    }, 2000);
  };

  const urgentRequests = dataRequests.filter(req => {
    const daysUntilDue = Math.ceil((req.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && req.status !== 'completed';
  });

  const activeBreach = breachIncidents.find(incident => 
    incident.status === 'reported' || incident.status === 'investigating'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GDPR Compliance Tools</h2>
          <p className="text-muted-foreground">
            Data protection and privacy compliance management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={complianceMetrics.overallCompliance >= 90 ? 'default' : 'destructive'}>
            {complianceMetrics.overallCompliance}% Compliant
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Privacy Impact Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Privacy Impact Assessment</DialogTitle>
                <DialogDescription>
                  Create a PIA for new data processing activities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>PIA creation form would be implemented here</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Alerts */}
      {(urgentRequests.length > 0 || complianceMetrics.overdueRequests > 0 || activeBreach) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Compliance Issues</AlertTitle>
          <AlertDescription className="text-red-700">
            {complianceMetrics.overdueRequests > 0 && `${complianceMetrics.overdueRequests} overdue data requests. `}
            {urgentRequests.length > 0 && `${urgentRequests.length} requests due within 7 days. `}
            {activeBreach && `Active data breach incident: ${activeBreach.title}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complianceMetrics.overallCompliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.totalDataSubjects} data subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {complianceMetrics.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.overdueRequests} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Encryption Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complianceMetrics.encryptionCompliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.unencryptedSensitive} sensitive unencrypted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consent Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {complianceMetrics.consentCompliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.expiredConsents} expired consents
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal-data">Personal Data</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="assessments">Privacy Impact</TabsTrigger>
          <TabsTrigger value="breaches">Breach Management</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-data" className="space-y-6">
          {/* Data Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Data Inventory</CardTitle>
              <CardDescription>
                Manage and monitor all personal data processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Data Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="biometric">Biometric</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data Map
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data List */}
          <Card>
            <CardHeader>
              <CardTitle>Data Records ({filteredPersonalData.length.toLocaleString()})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredPersonalData.slice(0, 50).map(data => (
                    <div key={data.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDataIcon(data.category)}
                        {data.sensitive && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {data.encrypted ? <Lock className="h-4 w-4 text-green-600" /> : <Unlock className="h-4 w-4 text-red-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{data.dataType}</span>
                          <Badge variant="outline" size="sm">{data.category}</Badge>
                          {data.sensitive && <Badge variant="destructive" size="sm">Sensitive</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User: {data.userId} • Source: {data.source} • 
                          Collected: {data.collectedAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Purpose: {data.processingPurpose.join(', ')} • 
                          Legal Basis: {data.legalBasis} • 
                          Retention: {data.retentionPeriod} months
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!data.encrypted && data.sensitive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEncryptData(data.id)}
                            disabled={encryptionInProgress.includes(data.id)}
                          >
                            {encryptionInProgress.includes(data.id) ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Data Record Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium">Data Type:</label>
                                  <div>{data.dataType}</div>
                                </div>
                                <div>
                                  <label className="font-medium">Category:</label>
                                  <div>{data.category}</div>
                                </div>
                                <div>
                                  <label className="font-medium">Value:</label>
                                  <div className="font-mono bg-muted p-2 rounded">
                                    {data.encrypted ? '[ENCRYPTED]' : data.value}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Legal Basis:</label>
                                  <div>{data.legalBasis}</div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="font-medium text-sm">Processing Purposes:</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {data.processingPurpose.map(purpose => (
                                    <Badge key={purpose} variant="outline" size="sm">
                                      {purpose}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteData?.(data.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <CardDescription>
                Track and manage user consent across all processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {consentRecords.map(consent => (
                    <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{consent.purpose}</span>
                          <Badge className={consent.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {consent.granted ? 'Granted' : 'Withdrawn'}
                          </Badge>
                          <Badge variant="outline" size="sm">{consent.method}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User: {consent.userId} • 
                          Date: {consent.timestamp.toLocaleDateString()} • 
                          Version: {consent.version}
                        </div>
                        {consent.withdrawnAt && (
                          <div className="text-xs text-red-600">
                            Withdrawn: {consent.withdrawnAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={consent.granted}
                          onCheckedChange={(checked) => onUpdateConsent?.(consent.userId, consent.purpose, checked)}
                        />
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>
                Process GDPR data subject access requests within 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRequests.map(request => {
                  const daysUntilDue = Math.ceil((request.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntilDue <= 7 && request.status !== 'completed';
                  
                  return (
                    <Card key={request.id} className={isUrgent ? 'border-red-300 bg-red-50' : ''}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRequestIcon(request.type)}
                            <CardTitle className="text-lg capitalize">{request.type} Request</CardTitle>
                            {isUrgent && <Badge variant="destructive">Urgent</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                            </span>
                          </div>
                        </div>
                        <CardDescription>
                          {request.requestorInfo.name} ({request.requestorInfo.email})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm">
                          <p><strong>Description:</strong> {request.description}</p>
                          <p><strong>Requested:</strong> {request.requestedAt.toLocaleDateString()}</p>
                          <p><strong>Due:</strong> {request.dueDate.toLocaleDateString()}</p>
                        </div>

                        {request.affectedData.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Affected Data:</h4>
                            <div className="flex flex-wrap gap-1">
                              {request.affectedData.map(data => (
                                <Badge key={data} variant="outline" size="sm">
                                  {data}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.processingNotes.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Processing Notes:</h4>
                            <div className="space-y-1">
                              {request.processingNotes.map((note, i) => (
                                <div key={i} className="text-sm text-muted-foreground">
                                  • {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onProcessRequest?.(request.id, 'in_progress')}
                            disabled={request.status === 'completed'}
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onProcessRequest?.(request.id, 'completed')}
                            disabled={request.status === 'completed'}
                          >
                            Complete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {dataRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Data Requests</h3>
                    <p className="text-sm">All data subject requests are up to date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {piaAssessments.map(pia => (
              <Card key={pia.id} className={`border-l-4 ${getRiskColor(pia.riskLevel)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pia.name}</CardTitle>
                    <Badge className={getStatusColor(pia.status)}>
                      {pia.status}
                    </Badge>
                  </div>
                  <CardDescription>{pia.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Risk Level:</span>
                      <div className={`font-medium ${pia.riskLevel === 'very_high' ? 'text-red-600' : 
                        pia.riskLevel === 'high' ? 'text-orange-600' : 
                        pia.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {pia.riskLevel.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <div className="font-medium">{pia.createdAt.toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Data Categories:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pia.dataCategories.map(category => (
                        <Badge key={category} variant="outline" size="sm">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Risk Factors ({pia.riskFactors.length}):</h4>
                    <div className="space-y-1">
                      {pia.riskFactors.slice(0, 2).map((risk, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{risk.factor}</span>
                          <div className="text-muted-foreground text-xs">
                            Likelihood: {risk.likelihood}/5, Impact: {risk.impact}/5
                          </div>
                        </div>
                      ))}
                      {pia.riskFactors.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{pia.riskFactors.length - 2} more risks
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                    {pia.status === 'draft' && (
                      <Button size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breaches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Breach Management</CardTitle>
              <CardDescription>
                Track and manage data breach incidents with 72-hour reporting requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breachIncidents.map(incident => {
                  const hoursToReport = Math.ceil((Date.now() - incident.discoveredAt.getTime()) / (1000 * 60 * 60));
                  const reportingUrgent = hoursToReport >= 60 && !incident.reportedAt;
                  
                  return (
                    <Card key={incident.id} className={reportingUrgent ? 'border-red-300 bg-red-50' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                            {reportingUrgent && <Badge variant="destructive">Report Due</Badge>}
                          </div>
                        </div>
                        <CardDescription>{incident.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Discovered:</span>
                            <div className="font-medium">{incident.discoveredAt.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Affected Records:</span>
                            <div className="font-medium">{incident.affectedRecords.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Notification Required:</span>
                            <div className={`font-medium ${incident.notificationRequired ? 'text-red-600' : 'text-green-600'}`}>
                              {incident.notificationRequired ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>

                        {incident.dataCategories.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Affected Data Categories:</h4>
                            <div className="flex flex-wrap gap-1">
                              {incident.dataCategories.map(category => (
                                <Badge key={category} variant="destructive" size="sm">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {incident.containmentActions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Containment Actions:</h4>
                            <div className="space-y-1">
                              {incident.containmentActions.map((action, i) => (
                                <div key={i} className="text-sm flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  {action}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {incident.notificationRequired && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">72-Hour Reporting Window</span>
                            </div>
                            <div className="text-sm text-yellow-700">
                              {incident.reportedAt ? 
                                `Reported ${incident.reportedAt.toLocaleString()}` :
                                `${Math.max(0, 72 - hoursToReport)} hours remaining to report`
                              }
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {breachIncidents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Breach Incidents</h3>
                    <p className="text-sm">No data breaches have been reported</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};