import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Search,
  Filter,
  Eye,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Briefcase
} from "lucide-react";

interface PortfolioCompany {
  id: string;
  name: string;
  type: 'ip-license' | 'equity-deal' | 'acquisition';
  status: 'active' | 'pending' | 'completed' | 'at-risk';
  phase: string;
  monthlyRevenue: number;
  equity?: number;
  lastUpdate: Date;
  nextMilestone: string;
  progress: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  kpis: {
    marginImprovement: number;
    forecastAccuracy: number;
    paybackPeriod: number;
  };
}

const portfolioCompanies: PortfolioCompany[] = [
  {
    id: '1',
    name: 'TechStack SaaS',
    type: 'equity-deal',
    status: 'active',
    phase: 'Implementation Phase 3',
    monthlyRevenue: 85000,
    equity: 2.5,
    lastUpdate: new Date('2024-01-12'),
    nextMilestone: 'Margin optimization complete',
    progress: 75,
    urgencyLevel: 'low',
    kpis: {
      marginImprovement: 18,
      forecastAccuracy: 92,
      paybackPeriod: 8.5
    }
  },
  {
    id: '2',
    name: 'MedBilling Solutions',
    type: 'acquisition',
    status: 'active',
    phase: 'TRS Integration',
    monthlyRevenue: 45000,
    lastUpdate: new Date('2024-01-10'),
    nextMilestone: 'Revenue system deployment',
    progress: 60,
    urgencyLevel: 'high',
    kpis: {
      marginImprovement: 12,
      forecastAccuracy: 88,
      paybackPeriod: 6.2
    }
  },
  {
    id: '3',
    name: 'RevOps Agency Pro',
    type: 'ip-license',
    status: 'active',
    phase: 'Performance Monitoring',
    monthlyRevenue: 28000,
    lastUpdate: new Date('2024-01-15'),
    nextMilestone: 'Q2 performance review',
    progress: 95,
    urgencyLevel: 'low',
    kpis: {
      marginImprovement: 25,
      forecastAccuracy: 95,
      paybackPeriod: 4.8
    }
  },
  {
    id: '4',
    name: 'CloudCRM Solutions',
    type: 'equity-deal',
    status: 'pending',
    phase: 'Due Diligence',
    monthlyRevenue: 0,
    equity: 2.0,
    lastUpdate: new Date('2024-01-14'),
    nextMilestone: 'Financial audit completion',
    progress: 45,
    urgencyLevel: 'medium',
    kpis: {
      marginImprovement: 0,
      forecastAccuracy: 0,
      paybackPeriod: 0
    }
  },
  {
    id: '5',
    name: 'DataOps Consulting',
    type: 'ip-license',
    status: 'pending',
    phase: 'Contract Negotiation',
    monthlyRevenue: 0,
    lastUpdate: new Date('2024-01-13'),
    nextMilestone: 'License agreement signing',
    progress: 80,
    urgencyLevel: 'medium',
    kpis: {
      marginImprovement: 0,
      forecastAccuracy: 0,
      paybackPeriod: 0
    }
  }
];

interface ContextSwitcherProps {
  selectedCompanyId?: string;
  onCompanySelect: (companyId: string) => void;
  showMetrics?: boolean;
}

export function ContextSwitcher({ selectedCompanyId, onCompanySelect, showMetrics = true }: ContextSwitcherProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCompanies = portfolioCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.phase.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || company.type === filterType;
    const matchesStatus = filterStatus === "all" || company.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip-license': return Briefcase;
      case 'equity-deal': return TrendingUp;
      case 'acquisition': return Building2;
      default: return Building2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip-license': return 'text-accent';
      case 'equity-deal': return 'text-secondary';
      case 'acquisition': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'at-risk': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const selectedCompany = portfolioCompanies.find(c => c.id === selectedCompanyId);

  return (
    <div className="space-y-4">
      {/* Currently Selected Company */}
      {selectedCompany && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getTypeIcon(selectedCompany.type);
                  return <Icon className={`h-6 w-6 ${getTypeColor(selectedCompany.type)}`} />;
                })()}
                <div>
                  <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCompany.phase}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getUrgencyIcon(selectedCompany.urgencyLevel)}
                <Badge className={getStatusColor(selectedCompany.status)}>
                  {selectedCompany.status}
                </Badge>
              </div>
            </div>
            
            {showMetrics && selectedCompany.status === 'active' && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  <p className="text-lg font-bold">${(selectedCompany.monthlyRevenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground">Margin Boost</p>
                  <p className="text-lg font-bold text-emerald-600">+{selectedCompany.kpis.marginImprovement}%</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-lg font-bold">{selectedCompany.progress}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ip-license">IP License</SelectItem>
                    <SelectItem value="equity-deal">Equity Deal</SelectItem>
                    <SelectItem value="acquisition">Acquisition</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => {
          const Icon = getTypeIcon(company.type);
          const isSelected = company.id === selectedCompanyId;
          
          return (
            <Card 
              key={company.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => onCompanySelect(company.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${getTypeColor(company.type)}`} />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{company.name}</h4>
                        <p className="text-xs text-muted-foreground">{company.phase}</p>
                      </div>
                    </div>
                    {getUrgencyIcon(company.urgencyLevel)}
                  </div>

                  {/* Status and Revenue */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(company.status)}>
                      {company.status}
                    </Badge>
                    {company.monthlyRevenue > 0 && (
                      <span className="text-sm font-medium">
                        ${(company.monthlyRevenue / 1000).toFixed(0)}K/mo
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{company.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${company.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="text-xs">
                    <p className="text-muted-foreground">Next:</p>
                    <p className="font-medium truncate">{company.nextMilestone}</p>
                  </div>

                  {/* Quick Stats for Active Companies */}
                  {company.status === 'active' && showMetrics && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Margin</p>
                        <p className="font-medium text-emerald-600">+{company.kpis.marginImprovement}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className="font-medium">{company.kpis.forecastAccuracy}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Payback</p>
                        <p className="font-medium">{company.kpis.paybackPeriod}mo</p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompanySelect(company.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isSelected ? "Currently Selected" : "Switch Context"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for managing selected company context
export function usePortfolioContext() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    localStorage.getItem('selected-portfolio-company') || null
  );

  const selectedCompany = portfolioCompanies.find(c => c.id === selectedCompanyId) || null;

  const selectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('selected-portfolio-company', companyId);
  };

  const clearSelection = () => {
    setSelectedCompanyId(null);
    localStorage.removeItem('selected-portfolio-company');
  };

  return {
    selectedCompanyId,
    selectedCompany,
    selectCompany,
    clearSelection,
    allCompanies: portfolioCompanies
  };
}