import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Calendar, 
  Plus, 
  Settings, 
  Users, 
  Target, 
  Building, 
  Bot, 
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  MessageSquare,
  Clock,
  Zap,
  Command,
  ArrowRight,
  Hash,
  Star,
  Download,
  Share,
  Copy,
  Trash,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description?: string;
  keywords: string[];
  icon: React.ReactNode;
  category: 'navigation' | 'create' | 'actions' | 'search' | 'settings';
  shortcut?: string;
  action: () => void;
  priority?: number;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define all available commands
  const commands: Command[] = useMemo(() => [
    // Navigation Commands
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      description: 'View main dashboard with key metrics',
      keywords: ['dashboard', 'home', 'overview'],
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/dashboard'),
      priority: 10
    },
    {
      id: 'nav-engagements',
      title: 'Go to Engagements',
      description: 'Manage client engagements',
      keywords: ['engagements', 'clients', 'projects'],
      icon: <Target className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/engagements'),
      priority: 9
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics',
      description: 'View performance analytics',
      keywords: ['analytics', 'reports', 'insights'],
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/analytics'),
      priority: 8
    },
    {
      id: 'nav-clients',
      title: 'Go to Clients',
      description: 'Manage client organizations',
      keywords: ['clients', 'organizations', 'companies'],
      icon: <Building className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/clients'),
      priority: 7
    },
    {
      id: 'nav-agents',
      title: 'Go to AI Agents',
      description: 'Deploy and manage AI agents',
      keywords: ['agents', 'ai', 'automation'],
      icon: <Bot className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/agents'),
      priority: 6
    },
    {
      id: 'nav-library',
      title: 'Go to IP Library',
      description: 'Access intellectual property library',
      keywords: ['library', 'ip', 'knowledge', 'documents'],
      icon: <FileText className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/library'),
      priority: 5
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      description: 'Configure platform settings',
      keywords: ['settings', 'config', 'preferences'],
      icon: <Settings className="h-4 w-4" />,
      category: 'navigation',
      action: () => navigate('/settings'),
      priority: 4
    },

    // Create Commands
    {
      id: 'create-engagement',
      title: 'Create New Engagement',
      description: 'Start a new client engagement',
      keywords: ['create', 'new', 'engagement', 'project'],
      icon: <Plus className="h-4 w-4" />,
      category: 'create',
      shortcut: '⌘N',
      action: () => navigate('/engagements/new'),
      priority: 10
    },
    {
      id: 'create-client',
      title: 'Add New Client',
      description: 'Register a new client organization',
      keywords: ['create', 'add', 'client', 'organization'],
      icon: <Building className="h-4 w-4" />,
      category: 'create',
      action: () => navigate('/clients/new'),
      priority: 8
    },
    {
      id: 'create-agent',
      title: 'Deploy New AI Agent',
      description: 'Create and deploy a new AI agent',
      keywords: ['create', 'deploy', 'agent', 'ai'],
      icon: <Bot className="h-4 w-4" />,
      category: 'create',
      action: () => navigate('/agents/new'),
      priority: 7
    },
    {
      id: 'invite-user',
      title: 'Invite Team Member',
      description: 'Send invitation to new team member',
      keywords: ['invite', 'user', 'team', 'member'],
      icon: <Users className="h-4 w-4" />,
      category: 'create',
      action: () => navigate('/users/new'),
      priority: 6
    },

    // Action Commands
    {
      id: 'refresh-data',
      title: 'Refresh Data',
      description: 'Reload all dashboard data',
      keywords: ['refresh', 'reload', 'update'],
      icon: <RefreshCw className="h-4 w-4" />,
      category: 'actions',
      shortcut: '⌘R',
      action: () => {
        window.location.reload();
      },
      priority: 5
    },
    {
      id: 'export-data',
      title: 'Export Current View',
      description: 'Export data from current page',
      keywords: ['export', 'download', 'save'],
      icon: <Download className="h-4 w-4" />,
      category: 'actions',
      action: () => {
        toast({
          title: "Export Started",
          description: "Your data export is being prepared",
        });
      },
      priority: 4
    },
    {
      id: 'share-dashboard',
      title: 'Share Dashboard',
      description: 'Share current dashboard with team',
      keywords: ['share', 'collaborate', 'team'],
      icon: <Share className="h-4 w-4" />,
      category: 'actions',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Dashboard link copied to clipboard",
        });
      },
      priority: 3
    },

    // Quick Search Commands
    {
      id: 'search-active-engagements',
      title: 'Search: Active Engagements',
      description: 'Find all active engagements',
      keywords: ['search', 'active', 'engagements'],
      icon: <Search className="h-4 w-4" />,
      category: 'search',
      action: () => {
        // This would trigger a search with predefined filters
        navigate('/engagements?status=active');
      },
      priority: 8
    },
    {
      id: 'search-my-tasks',
      title: 'Search: My Tasks',
      description: 'Find items assigned to me',
      keywords: ['search', 'my', 'tasks', 'assigned'],
      icon: <Hash className="h-4 w-4" />,
      category: 'search',
      action: () => {
        navigate('/dashboard?filter=my-tasks');
      },
      priority: 7
    },
    {
      id: 'search-overdue',
      title: 'Search: Overdue Items',
      description: 'Find all overdue deliverables',
      keywords: ['search', 'overdue', 'late', 'behind'],
      icon: <Clock className="h-4 w-4" />,
      category: 'search',
      action: () => {
        navigate('/dashboard?filter=overdue');
      },
      priority: 6
    },

    // Settings Commands
    {
      id: 'toggle-theme',
      title: 'Toggle Dark Mode',
      description: 'Switch between light and dark themes',
      keywords: ['theme', 'dark', 'light', 'mode'],
      icon: <Eye className="h-4 w-4" />,
      category: 'settings',
      shortcut: '⌘D',
      action: () => {
        // This would toggle theme - simplified implementation
        document.documentElement.classList.toggle('dark');
        toast({
          title: "Theme Toggled",
          description: "Display theme has been changed",
        });
      },
      priority: 3
    },
    {
      id: 'keyboard-shortcuts',
      title: 'View Keyboard Shortcuts',
      description: 'Show all available keyboard shortcuts',
      keywords: ['shortcuts', 'hotkeys', 'help'],
      icon: <Command className="h-4 w-4" />,
      category: 'settings',
      shortcut: '⌘?',
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "⌘K: Command Palette, ⌘N: New Engagement, ⌘D: Toggle Theme",
        });
      },
      priority: 2
    }
  ], [navigate, toast]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const lowerQuery = query.toLowerCase();
    return commands
      .filter(cmd => 
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => {
        // Prioritize exact matches in title
        const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
        const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (bTitleMatch && !aTitleMatch) return 1;
        
        return (b.priority || 0) - (a.priority || 0);
      });
  }, [query, commands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigate';
      case 'create': return 'Create';
      case 'actions': return 'Actions';
      case 'search': return 'Search';
      case 'settings': return 'Settings';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <ArrowRight className="h-3 w-3" />;
      case 'create': return <Plus className="h-3 w-3" />;
      case 'actions': return <Zap className="h-3 w-3" />;
      case 'search': return <Search className="h-3 w-3" />;
      case 'settings': return <Settings className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2 border-b">
          <Command className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="border-none shadow-none text-lg p-0 focus-visible:ring-0"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getCategoryIcon(category)}
                  {getCategoryLabel(category)}
                </div>
                <div className="space-y-1 mt-1">
                  {categoryCommands.map((command, categoryIndex) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <div
                        key={command.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                      >
                        <div className="flex-shrink-0">
                          {command.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{command.title}</span>
                            {command.shortcut && (
                              <Badge variant="outline" className="text-xs">
                                {command.shortcut}
                              </Badge>
                            )}
                          </div>
                          {command.description && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {command.description}
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
                {Object.keys(groupedCommands).indexOf(category) < Object.keys(groupedCommands).length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No commands found</h3>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Close</span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};