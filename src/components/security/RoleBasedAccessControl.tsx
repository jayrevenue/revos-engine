import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  User,
  Users,
  Key,
  Lock,
  Unlock,
  Edit,
  Trash,
  Plus,
  Search,
  Settings,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Clock,
  Activity,
  Building,
  Crown,
  UserCheck,
  UserX,
  FileText,
  Database,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'user' | 'system' | 'reporting' | 'security' | 'integrations';
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute' | 'admin')[];
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
    value: string | string[];
  }[];
  sensitive: boolean;
  requiresApproval: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  category: 'executive' | 'management' | 'analyst' | 'specialist' | 'admin' | 'external';
  permissions: string[];
  inherit?: string; // parent role ID
  restrictions?: {
    timeBasedAccess?: {
      allowedHours: string; // e.g., "09:00-17:00"
      allowedDays: string[]; // e.g., ["monday", "tuesday"]
      timezone: string;
    };
    locationBasedAccess?: {
      allowedCountries: string[];
      allowedIpRanges: string[];
    };
    dataAccess?: {
      maxRecords: number;
      allowedClients: string[];
      allowedProjects: string[];
    };
  };
  isActive: boolean;
  createdAt: Date;
  lastModified: Date;
  usersCount: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: Date;
  department?: string;
  manager?: string;
  location?: string;
  accessRequests: AccessRequest[];
  sessionInfo?: {
    ipAddress: string;
    location: string;
    device: string;
    lastActivity: Date;
  };
  mfaEnabled: boolean;
  temporaryAccess?: {
    expires: Date;
    grantedBy: string;
    reason: string;
  };
}

interface AccessRequest {
  id: string;
  userId: string;
  requestedRoles?: string[];
  requestedPermissions?: string[];
  reason: string;
  requestedAt: Date;
  expiresAt?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approver?: string;
  approvedAt?: Date;
  comments?: string;
  emergency: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'password' | 'session' | 'access' | 'data' | 'audit';
  rules: {
    [key: string]: any;
  };
  isActive: boolean;
  enforcementLevel: 'warning' | 'blocking' | 'audit_only';
  lastUpdated: Date;
  appliesTo: 'all' | 'roles' | 'users';
  scope: string[];
}

interface RoleBasedAccessControlProps {
  permissions: Permission[];
  roles: Role[];
  users: User[];
  accessRequests: AccessRequest[];
  securityPolicies: SecurityPolicy[];
  onUpdateRole?: (roleId: string, updates: Partial<Role>) => void;
  onAssignRole?: (userId: string, roleId: string) => void;
  onRevokeRole?: (userId: string, roleId: string) => void;
  onApproveRequest?: (requestId: string, approved: boolean, comments?: string) => void;
  onCreateRole?: (role: Omit<Role, 'id' | 'createdAt' | 'lastModified' | 'usersCount'>) => void;
}

export const RoleBasedAccessControl = ({
  permissions,
  roles,
  users,
  accessRequests,
  securityPolicies,
  onUpdateRole,
  onAssignRole,
  onRevokeRole,
  onApproveRequest,
  onCreateRole
}: RoleBasedAccessControlProps) => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const activeUsers = users.filter(u => u.isActive);
    const pendingRequests = accessRequests.filter(r => r.status === 'pending');
    const emergencyRequests = pendingRequests.filter(r => r.emergency);
    const expiredAccess = users.filter(u => 
      u.temporaryAccess && u.temporaryAccess.expires < new Date()
    );
    
    const roleDistribution = roles.reduce((acc, role) => {
      acc[role.category] = (acc[role.category] || 0) + role.usersCount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalRoles: roles.length,
      customRoles: roles.filter(r => r.type === 'custom').length,
      pendingRequests: pendingRequests.length,
      emergencyRequests: emergencyRequests.length,
      expiredAccess: expiredAccess.length,
      roleDistribution,
      usersWithoutMfa: activeUsers.filter(u => !u.mfaEnabled).length
    };
  }, [users, roles, accessRequests]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (!showInactiveUsers) {
      filtered = filtered.filter(u => u.isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(u =>
        u.roles.some(roleId => {
          const role = roles.find(r => r.id === roleId);
          return role?.category === filterCategory;
        })
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, showInactiveUsers, searchQuery, filterCategory, roles]);

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'data': return <Database className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'reporting': return <BarChart3 className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'integrations': return <Globe className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Crown className="h-4 w-4" />;
      case 'management': return <Users className="h-4 w-4" />;
      case 'analyst': return <BarChart3 className="h-4 w-4" />;
      case 'specialist': return <User className="h-4 w-4" />;
      case 'admin': return <Settings className="h-4 w-4" />;
      case 'external': return <Globe className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': case 'inactive': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevel = (user: User) => {
    let risk = 0;
    
    // High privilege roles
    const hasAdminRole = user.roles.some(roleId => {
      const role = roles.find(r => r.id === roleId);
      return role?.category === 'admin' || role?.category === 'executive';
    });
    if (hasAdminRole) risk += 3;

    // No MFA
    if (!user.mfaEnabled) risk += 2;

    // Stale access
    if (user.lastLogin && (Date.now() - user.lastLogin.getTime()) > (90 * 24 * 60 * 60 * 1000)) {
      risk += 2;
    }

    // External access
    const hasExternalRole = user.roles.some(roleId => {
      const role = roles.find(r => r.id === roleId);
      return role?.category === 'external';
    });
    if (hasExternalRole) risk += 1;

    if (risk >= 5) return 'high';
    if (risk >= 3) return 'medium';
    return 'low';
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const selectedUserData = users.find(u => u.id === selectedUser);
  const pendingRequests = accessRequests.filter(r => r.status === 'pending');
  const emergencyRequests = pendingRequests.filter(r => r.emergency);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role-Based Access Control</h2>
          <p className="text-muted-foreground">
            Granular permissions management with advanced security controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a custom role with specific permissions and restrictions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Role creation form would be implemented here</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Emergency Access Requests Alert */}
      {emergencyRequests.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Emergency Access Requests</AlertTitle>
          <AlertDescription className="text-red-700">
            {emergencyRequests.length} emergency access request{emergencyRequests.length > 1 ? 's' : ''} requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers - stats.activeUsers} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.customRoles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRoles - stats.customRoles} system roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.emergencyRequests} emergency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.usersWithoutMfa + stats.expiredAccess}
            </div>
            <p className="text-xs text-muted-foreground">
              MFA & access issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="requests">Access Requests</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Filters */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-inactive"
                    checked={showInactiveUsers}
                    onCheckedChange={setShowInactiveUsers}
                  />
                  <Label htmlFor="show-inactive">Show Inactive</Label>
                </div>

                <div className="text-sm text-muted-foreground">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredUsers.map(user => {
                    const riskLevel = getRiskLevel(user);
                    const userRoles = user.roles.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean);
                    
                    return (
                      <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {user.mfaEnabled ? 
                            <Shield className="h-4 w-4 text-green-600" /> : 
                            <Shield className="h-4 w-4 text-red-600" />
                          }
                          <div className={`w-2 h-2 rounded-full ${
                            riskLevel === 'high' ? 'bg-red-500' :
                            riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} title={`${riskLevel} risk`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-muted-foreground text-sm">{user.email}</span>
                            {user.temporaryAccess && (
                              <Badge variant="outline" size="sm">
                                <Clock className="h-3 w-3 mr-1" />
                                Temporary
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {userRoles.map(role => (
                              <Badge key={role?.id} variant="outline" size="sm" className="flex items-center gap-1">
                                {getRoleIcon(role?.category || '')}
                                {role?.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {user.department && `${user.department} • `}
                            {user.lastLogin ? 
                              `Last login: ${user.lastLogin.toLocaleDateString()}` : 
                              'Never logged in'
                            }
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details: {user.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Email</Label>
                                    <div className="text-sm">{user.email}</div>
                                  </div>
                                  <div>
                                    <Label>Department</Label>
                                    <div className="text-sm">{user.department || 'Not specified'}</div>
                                  </div>
                                  <div>
                                    <Label>Manager</Label>
                                    <div className="text-sm">{user.manager || 'Not specified'}</div>
                                  </div>
                                  <div>
                                    <Label>Location</Label>
                                    <div className="text-sm">{user.location || 'Not specified'}</div>
                                  </div>
                                </div>

                                {user.sessionInfo && (
                                  <div>
                                    <Label>Current Session</Label>
                                    <div className="text-sm space-y-1">
                                      <div>IP: {user.sessionInfo.ipAddress}</div>
                                      <div>Location: {user.sessionInfo.location}</div>
                                      <div>Device: {user.sessionInfo.device}</div>
                                      <div>Last Activity: {user.sessionInfo.lastActivity.toLocaleString()}</div>
                                    </div>
                                  </div>
                                )}

                                {user.temporaryAccess && (
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <Label>Temporary Access</Label>
                                    <div className="text-sm space-y-1">
                                      <div>Expires: {user.temporaryAccess.expires.toLocaleString()}</div>
                                      <div>Granted by: {user.temporaryAccess.grantedBy}</div>
                                      <div>Reason: {user.temporaryAccess.reason}</div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label>Assigned Roles</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {userRoles.map(role => (
                                      <Badge key={role?.id} variant="outline" className="flex items-center gap-1">
                                        {getRoleIcon(role?.category || '')}
                                        {role?.name}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-auto p-0 ml-1"
                                          onClick={() => onRevokeRole?.(user.id, role?.id || '')}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Select onValueChange={(roleId) => onAssignRole?.(user.id, roleId)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Add Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.filter(role => !user.roles.includes(role.id)).map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role.category)}
                                    {role.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
              const rolePermissions = role.permissions.map(permId => 
                permissions.find(p => p.id === permId)
              ).filter(Boolean);

              return (
                <Card key={role.id} className={!role.isActive ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.category)}
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={role.type === 'system' ? 'default' : 'secondary'}>
                          {role.type}
                        </Badge>
                        <Badge variant="outline">
                          {role.usersCount} user{role.usersCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium capitalize">{role.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Permissions:</span>
                        <div className="font-medium">{role.permissions.length}</div>
                      </div>
                    </div>

                    {role.inherit && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Inherits from:</span>
                        <Badge variant="outline" className="ml-2">
                          {roles.find(r => r.id === role.inherit)?.name}
                        </Badge>
                      </div>
                    )}

                    {rolePermissions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Key Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {rolePermissions.slice(0, 4).map(permission => (
                            <Badge key={permission?.id} variant="outline" size="sm">
                              {permission?.name}
                            </Badge>
                          ))}
                          {rolePermissions.length > 4 && (
                            <Badge variant="outline" size="sm">
                              +{rolePermissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {role.restrictions && (
                      <div className="p-2 bg-muted/30 rounded text-sm">
                        <div className="font-medium">Restrictions:</div>
                        {role.restrictions.timeBasedAccess && (
                          <div>Time: {role.restrictions.timeBasedAccess.allowedHours}</div>
                        )}
                        {role.restrictions.locationBasedAccess && (
                          <div>Location: {role.restrictions.locationBasedAccess.allowedCountries.join(', ')}</div>
                        )}
                        {role.restrictions.dataAccess && (
                          <div>Max Records: {role.restrictions.dataAccess.maxRecords}</div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedRole(role.id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {role.type === 'custom' && (
                        <Button size="sm" variant="outline">
                          <Trash className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {/* Permissions by Category */}
          <div className="space-y-6">
            {Object.entries(
              permissions.reduce((acc, permission) => {
                if (!acc[permission.category]) acc[permission.category] = [];
                acc[permission.category].push(permission);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([category, categoryPermissions]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(category)}
                    <CardTitle className="capitalize">{category} Permissions</CardTitle>
                    <Badge variant="outline">{categoryPermissions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{permission.name}</span>
                            {permission.sensitive && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            {permission.requiresApproval && <Lock className="h-4 w-4 text-yellow-600" />}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {permission.description}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">Resource:</span>
                          <Badge variant="outline" size="sm">{permission.resource}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {permission.actions.map(action => (
                            <Badge key={action} variant="secondary" size="sm">
                              {action}
                            </Badge>
                          ))}
                        </div>

                        {permission.conditions && permission.conditions.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Conditions:</span>
                            <div className="text-muted-foreground">
                              {permission.conditions.map(condition => 
                                `${condition.field} ${condition.operator} ${condition.value}`
                              ).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="space-y-4">
            {accessRequests.map(request => {
              const requestUser = users.find(u => u.id === request.userId);
              
              return (
                <Card key={request.id} className={request.emergency ? 'border-red-300 bg-red-50' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Access Request - {requestUser?.name}
                        </CardTitle>
                        <CardDescription>
                          {requestUser?.email} • {request.requestedAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.emergency && <Badge variant="destructive">Emergency</Badge>}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <strong>Reason:</strong> {request.reason}
                    </div>

                    {request.requestedRoles && request.requestedRoles.length > 0 && (
                      <div>
                        <div className="font-medium text-sm mb-2">Requested Roles:</div>
                        <div className="flex flex-wrap gap-1">
                          {request.requestedRoles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return (
                              <Badge key={roleId} variant="outline">
                                {role?.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {request.expiresAt && (
                      <div className="text-sm">
                        <strong>Expires:</strong> {request.expiresAt.toLocaleDateString()}
                      </div>
                    )}

                    {request.comments && (
                      <div className="text-sm">
                        <strong>Comments:</strong> {request.comments}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApproveRequest?.(request.id, false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApproveRequest?.(request.id, true)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}

                    {request.approver && request.approvedAt && (
                      <div className="text-xs text-muted-foreground">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approver} on {request.approvedAt.toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {accessRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Access Requests</h3>
                <p className="text-sm">All access requests have been processed</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPolicies.map(policy => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{policy.type}</Badge>
                    </div>
                  </div>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Enforcement:</span>
                      <div className="font-medium capitalize">{policy.enforcementLevel.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Applies To:</span>
                      <div className="font-medium capitalize">{policy.appliesTo}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm mb-2">Policy Rules:</div>
                    <div className="text-sm space-y-1">
                      {Object.entries(policy.rules).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {policy.lastUpdated.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};