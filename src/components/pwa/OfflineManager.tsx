import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Wifi,
  WifiOff,
  Download,
  Upload,
  RotateCcw as Sync,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Settings,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  CloudOff,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

interface OfflineData {
  id: string;
  type: 'engagement' | 'client' | 'report' | 'analytics' | 'user' | 'settings';
  title: string;
  lastModified: Date;
  size: number; // bytes
  syncStatus: 'synced' | 'pending' | 'conflict' | 'failed';
  priority: 'high' | 'medium' | 'low';
  cacheExpiry?: Date;
  localChanges: number;
  remoteChanges: number;
}

interface SyncConflict {
  id: string;
  dataId: string;
  type: 'engagement' | 'client' | 'report';
  field: string;
  localValue: any;
  remoteValue: any;
  timestamp: Date;
  autoResolvable: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface OfflineCapability {
  feature: string;
  available: boolean;
  description: string;
  dataTypes: string[];
  limitations: string[];
}

interface NetworkInfo {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  rtt: number; // ms
  saveData: boolean;
}

interface OfflineManagerProps {
  offlineData: OfflineData[];
  syncConflicts: SyncConflict[];
  networkInfo: NetworkInfo;
  storageUsed: number; // bytes
  storageQuota: number; // bytes
  onSyncData?: (dataIds: string[]) => void;
  onResolveConflict?: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void;
  onDownloadForOffline?: (dataId: string) => void;
  onClearOfflineData?: (dataIds: string[]) => void;
  onToggleOfflineMode?: (enabled: boolean) => void;
}

export const OfflineManager = ({
  offlineData,
  syncConflicts,
  networkInfo,
  storageUsed,
  storageQuota,
  onSyncData,
  onResolveConflict,
  onDownloadForOffline,
  onClearOfflineData,
  onToggleOfflineMode
}: OfflineManagerProps) => {
  const { toast } = useToast();
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);

  // Offline capabilities
  const offlineCapabilities: OfflineCapability[] = [
    {
      feature: 'Engagement Management',
      available: true,
      description: 'View and edit engagements offline',
      dataTypes: ['engagements', 'milestones', 'tasks'],
      limitations: ['New engagement creation requires online connection']
    },
    {
      feature: 'Client Data',
      available: true,
      description: 'Access client information and history',
      dataTypes: ['clients', 'contacts', 'documents'],
      limitations: ['Document downloads require online connection']
    },
    {
      feature: 'Analytics & Reports',
      available: true,
      description: 'View cached reports and analytics',
      dataTypes: ['reports', 'dashboards', 'charts'],
      limitations: ['Real-time data updates unavailable', 'Export features disabled']
    },
    {
      feature: 'Team Collaboration',
      available: false,
      description: 'Limited offline collaboration features',
      dataTypes: ['comments', 'notifications', 'messages'],
      limitations: ['Read-only access to cached data', 'No real-time updates']
    },
    {
      feature: 'File Management',
      available: true,
      description: 'Access downloaded files and documents',
      dataTypes: ['documents', 'attachments', 'templates'],
      limitations: ['File uploads queue for next sync', 'Large files may not be cached']
    }
  ];

  // Calculate storage metrics
  const storageMetrics = useMemo(() => {
    const usagePercent = (storageUsed / storageQuota) * 100;
    const availableSpace = storageQuota - storageUsed;
    const dataByType = offlineData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.size;
      return acc;
    }, {} as Record<string, number>);

    return {
      usagePercent,
      availableSpace,
      dataByType,
      totalItems: offlineData.length,
      pendingSync: offlineData.filter(item => item.syncStatus === 'pending').length,
      conflicts: syncConflicts.length,
      failedItems: offlineData.filter(item => item.syncStatus === 'failed').length
    };
  }, [storageUsed, storageQuota, offlineData, syncConflicts]);

  // Auto-sync when online
  useEffect(() => {
    if (networkInfo.isOnline && autoSync && storageMetrics.pendingSync > 0) {
      handleSync();
    }
  }, [networkInfo.isOnline, autoSync, storageMetrics.pendingSync]);

  // Service Worker registration and updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            toast({
              title: "App Update Available",
              description: "A new version is available. Refresh to update.",
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, [toast]);

  const handleSync = async () => {
    if (!networkInfo.isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline",
        variant: "destructive"
      });
      return;
    }

    setSyncInProgress(true);
    const pendingItems = offlineData.filter(item => item.syncStatus === 'pending').map(item => item.id);
    
    try {
      await onSyncData?.(pendingItems);
      toast({
        title: "Sync Complete",
        description: `${pendingItems.length} items synchronized`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Some items could not be synchronized",
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDataTypes.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select data types to download",
        variant: "destructive"
      });
      return;
    }

    const itemsToDownload = offlineData
      .filter(item => selectedDataTypes.includes(item.type))
      .map(item => item.id);

    try {
      await Promise.all(itemsToDownload.map(id => onDownloadForOffline?.(id)));
      toast({
        title: "Download Complete",
        description: `${itemsToDownload.length} items downloaded for offline use`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Some items could not be downloaded",
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionIcon = () => {
    if (!networkInfo.isOnline) return <WifiOff className="h-4 w-4 text-red-600" />;
    switch (networkInfo.connectionType) {
      case 'wifi': return <Wifi className="h-4 w-4 text-green-600" />;
      case '4g': return <Smartphone className="h-4 w-4 text-blue-600" />;
      case '3g': return <Smartphone className="h-4 w-4 text-yellow-600" />;
      case 'slow-2g': return <Smartphone className="h-4 w-4 text-red-600" />;
      default: return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'engagement': return <BarChart3 className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'conflict': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'conflict': return 'text-orange-600 bg-orange-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offline Manager</h2>
          <p className="text-muted-foreground">
            Progressive Web App with offline capabilities and data synchronization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-sm">
              {networkInfo.isOnline ? 'Online' : 'Offline'} 
              {networkInfo.isOnline && ` (${networkInfo.connectionType.toUpperCase()})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="offline-mode">Offline Mode</Label>
            <Switch
              id="offline-mode"
              checked={offlineModeEnabled}
              onCheckedChange={(checked) => {
                setOfflineModeEnabled(checked);
                onToggleOfflineMode?.(checked);
              }}
            />
          </div>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!networkInfo.isOnline && (
        <Alert>
          <CloudOff className="h-4 w-4" />
          <AlertTitle>You're currently offline</AlertTitle>
          <AlertDescription>
            You can continue working with cached data. Changes will sync when connection is restored.
            {storageMetrics.pendingSync > 0 && ` ${storageMetrics.pendingSync} items are waiting to sync.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Conflicts Alert */}
      {syncConflicts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Sync Conflicts Detected</AlertTitle>
          <AlertDescription className="text-orange-700">
            {syncConflicts.length} conflict{syncConflicts.length > 1 ? 's' : ''} need{syncConflicts.length === 1 ? 's' : ''} your attention before syncing can continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Storage & Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(storageMetrics.usagePercent)}%</div>
            <Progress value={storageMetrics.usagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(storageUsed)} of {formatBytes(storageQuota)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offline Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageMetrics.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(Object.values(storageMetrics.dataByType).reduce((a, b) => a + b, 0))} cached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{storageMetrics.pendingSync}</div>
            <p className="text-xs text-muted-foreground">
              {storageMetrics.failedItems} failed items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {networkInfo.isOnline ? networkInfo.effectiveType.toUpperCase() : 'OFFLINE'}
            </div>
            <p className="text-xs text-muted-foreground">
              {networkInfo.isOnline && `${networkInfo.downlink} Mbps, ${networkInfo.rtt}ms RTT`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offline Data Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Offline Data</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSync}
                    disabled={!networkInfo.isOnline || syncInProgress}
                  >
                    <Sync className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
                    {syncInProgress ? 'Syncing...' : 'Sync All'}
                  </Button>
                  <Button size="sm" onClick={handleBulkDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {offlineData.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDataTypeIcon(item.type)}
                        {getSyncStatusIcon(item.syncStatus)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.title}</span>
                          <Badge className={getSyncStatusColor(item.syncStatus)} size="sm">
                            {item.syncStatus}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Modified: {item.lastModified.toLocaleDateString()} • 
                          Size: {formatBytes(item.size)}
                          {(item.localChanges > 0 || item.remoteChanges > 0) && (
                            <span className="ml-2">
                              {item.localChanges > 0 && `${item.localChanges} local`}
                              {item.localChanges > 0 && item.remoteChanges > 0 && ', '}
                              {item.remoteChanges > 0 && `${item.remoteChanges} remote`}
                              {' changes'}
                            </span>
                          )}
                        </div>
                        {item.cacheExpiry && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {item.cacheExpiry.toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={item.priority === 'high' ? 'destructive' : 
                                      item.priority === 'medium' ? 'default' : 'secondary'} size="sm">
                          {item.priority}
                        </Badge>
                        
                        {item.syncStatus === 'pending' && networkInfo.isOnline && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSyncData?.([item.id])}
                          >
                            <Upload className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {item.syncStatus === 'synced' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onClearOfflineData?.([item.id])}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {offlineData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium">No Offline Data</h3>
                      <p className="text-sm">Download data for offline access</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sync Conflicts */}
          {syncConflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Conflicts</CardTitle>
                <CardDescription>
                  Resolve conflicts between local and remote changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {syncConflicts.map(conflict => (
                    <div key={conflict.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">
                            {conflict.type}: {conflict.field}
                          </span>
                          <Badge variant={conflict.priority === 'high' ? 'destructive' : 'default'} size="sm">
                            {conflict.priority}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {conflict.timestamp.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Local Value:</h4>
                          <div className="p-2 bg-white border rounded text-sm">
                            {JSON.stringify(conflict.localValue)}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Remote Value:</h4>
                          <div className="p-2 bg-white border rounded text-sm">
                            {JSON.stringify(conflict.remoteValue)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResolveConflict?.(conflict.id, 'local')}
                        >
                          Use Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResolveConflict?.(conflict.id, 'remote')}
                        >
                          Use Remote
                        </Button>
                        {conflict.autoResolvable && (
                          <Button
                            size="sm"
                            onClick={() => onResolveConflict?.(conflict.id, 'merge')}
                          >
                            Auto Merge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Offline Capabilities & Settings */}
        <div className="space-y-6">
          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle>Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection</span>
                <div className="flex items-center gap-2">
                  {getConnectionIcon()}
                  <span className="text-sm font-medium">
                    {networkInfo.isOnline ? networkInfo.connectionType.toUpperCase() : 'Offline'}
                  </span>
                </div>
              </div>

              {networkInfo.isOnline && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speed</span>
                    <span className="text-sm font-medium">{networkInfo.downlink} Mbps</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latency</span>
                    <span className="text-sm font-medium">{networkInfo.rtt}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Saver</span>
                    <Badge variant={networkInfo.saveData ? 'default' : 'outline'} size="sm">
                      {networkInfo.saveData ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </>
              )}

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="auto-sync"
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                  />
                  <Label htmlFor="auto-sync" className="text-sm">Auto-sync when online</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offline Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Features</CardTitle>
              <CardDescription>Available functionality when offline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offlineCapabilities.map((capability, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {capability.available ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className="font-medium text-sm">{capability.feature}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {capability.description}
                    </p>
                    {capability.limitations.length > 0 && (
                      <div className="ml-6">
                        <p className="text-xs font-medium text-muted-foreground">Limitations:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {capability.limitations.map((limitation, i) => (
                            <li key={i}>• {limitation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Storage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(storageMetrics.dataByType).map(([type, size]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDataTypeIcon(type)}
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                    <span className="text-sm font-medium">{formatBytes(size)}</span>
                  </div>
                ))}
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Available Space</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatBytes(storageMetrics.availableSpace)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};