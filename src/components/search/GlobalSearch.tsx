import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Users,
  FileText,
  Target,
  Bot,
  Building,
  DollarSign,
  Calendar,
  MessageSquare,
  Hash,
  ArrowRight,
  Filter,
  Zap,
  Star,
  History,
  Bookmark
} from 'lucide-react';
import { format } from 'date-fns';

export interface SearchResult {
  id: string;
  type: 'engagement' | 'client' | 'outcome' | 'agent' | 'user' | 'document' | 'comment' | 'activity';
  title: string;
  description: string;
  subtitle?: string;
  url: string;
  relevance_score: number;
  highlights: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface SearchSuggestion {
  id: string;
  query: string;
  type: 'recent' | 'trending' | 'saved' | 'suggested';
  count?: number;
  category?: string;
  timestamp?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
}

export const GlobalSearch = ({
  isOpen,
  onClose,
  placeholder = "Search engagements, clients, outcomes...",
  maxResults = 20
}: GlobalSearchProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Search filters
  const searchFilters = [
    { value: 'all', label: 'All', icon: Search },
    { value: 'engagement', label: 'Engagements', icon: Target },
    { value: 'client', label: 'Clients', icon: Building },
    { value: 'outcome', label: 'Outcomes', icon: TrendingUp },
    { value: 'agent', label: 'AI Agents', icon: Bot },
    { value: 'user', label: 'Team', icon: Users },
    { value: 'document', label: 'Documents', icon: FileText },
  ];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadSuggestions();
      loadRecentSearches();
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 0) {
      const debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [query, selectedFilter]);

  const loadSuggestions = async () => {
    try {
      // Load trending searches and smart suggestions
      const trendingSuggestions: SearchSuggestion[] = [
        { id: '1', query: 'active engagements', type: 'trending', count: 45, category: 'engagements' },
        { id: '2', query: 'revenue this month', type: 'trending', count: 38, category: 'analytics' },
        { id: '3', query: 'overdue outcomes', type: 'trending', count: 22, category: 'outcomes' },
        { id: '4', query: 'ai agent performance', type: 'trending', count: 19, category: 'agents' },
      ];

      // Smart contextual suggestions based on user activity
      const smartSuggestions: SearchSuggestion[] = [
        { id: '5', query: 'my assigned engagements', type: 'suggested', category: 'personal' },
        { id: '6', query: 'clients in technology sector', type: 'suggested', category: 'clients' },
        { id: '7', query: 'outcomes due this week', type: 'suggested', category: 'outcomes' },
      ];

      setSuggestions([...trendingSuggestions, ...smartSuggestions]);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      // In production, this would come from user preferences or local storage
      const recent: SearchSuggestion[] = [
        { id: 'r1', query: 'TechCorp engagement', type: 'recent', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: 'r2', query: 'Sarah Johnson', type: 'recent', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: 'r3', query: 'Q4 revenue targets', type: 'recent', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      ];

      setRecentSearches(recent);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Build search across multiple tables
      const searchPromises = [];

      // Search engagements
      if (selectedFilter === 'all' || selectedFilter === 'engagement') {
        searchPromises.push(
          supabase
            .from('engagements')
            .select(`
              id, name, description, status, created_at,
              orgs:org_id (name)
            `)
            .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .limit(5)
        );
      }

      // Search outcomes
      if (selectedFilter === 'all' || selectedFilter === 'outcome') {
        searchPromises.push(
          supabase
            .from('outcomes')
            .select('id, name, description, current_value, target_value, created_at')
            .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .limit(5)
        );
      }

      // Search AI agents
      if (selectedFilter === 'all' || selectedFilter === 'agent') {
        searchPromises.push(
          supabase
            .from('ai_agents')
            .select('id, name, description, role, status, created_at')
            .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`)
            .limit(5)
        );
      }

      // Search profiles (users)
      if (selectedFilter === 'all' || selectedFilter === 'user') {
        searchPromises.push(
          supabase
            .from('profiles')
            .select('id, full_name, email, created_at, user_id')
            .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
            .limit(5)
        );
      }

      const searchResults = await Promise.allSettled(searchPromises);
      
      // Process and combine results
      const combinedResults: SearchResult[] = [];
      
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          const data = result.value.data;
          
          // Determine result type based on promise index
          let type: SearchResult['type'];
          if (selectedFilter !== 'all') {
            type = selectedFilter as SearchResult['type'];
          } else {
            const types: SearchResult['type'][] = ['engagement', 'outcome', 'agent', 'user'];
            type = types[index] || 'engagement';
          }

          data.forEach((item: any) => {
            combinedResults.push(formatSearchResult(item, type, searchQuery));
          });
        }
      });

      // Sort by relevance score
      combinedResults.sort((a, b) => b.relevance_score - a.relevance_score);
      
      setResults(combinedResults.slice(0, maxResults));

      // Save search to recent searches
      saveRecentSearch(searchQuery);

    } catch (error: any) {
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSearchResult = (item: any, type: SearchResult['type'], searchQuery: string): SearchResult => {
    let title: string;
    let description: string;
    let subtitle: string | undefined;
    let url: string;
    let highlights: string[] = [];

    switch (type) {
      case 'engagement':
        title = item.name;
        description = item.description || 'No description available';
        subtitle = `${item.orgs?.name || 'Unknown Client'} • ${item.status}`;
        url = `/engagements/${item.id}`;
        break;
      case 'outcome':
        title = item.name;
        description = item.description || 'No description available';
        subtitle = `${item.current_value}/${item.target_value}`;
        url = `/outcomes/${item.id}`;
        break;
      case 'agent':
        title = item.name;
        description = item.description || 'AI Agent';
        subtitle = `${item.role} • ${item.status}`;
        url = `/agents/${item.id}`;
        break;
      case 'user':
        title = item.full_name || item.email;
        description = item.email;
        subtitle = item.role;
        url = `/users/${item.id}`;
        break;
      default:
        title = 'Unknown';
        description = 'No description';
        url = '#';
    }

    // Generate highlights (simple implementation)
    const queryWords = searchQuery.toLowerCase().split(' ');
    queryWords.forEach(word => {
      if (title.toLowerCase().includes(word)) {
        highlights.push(title);
      }
      if (description.toLowerCase().includes(word)) {
        highlights.push(description);
      }
    });

    // Calculate relevance score (simple implementation)
    let relevance_score = 0;
    queryWords.forEach(word => {
      if (title.toLowerCase().includes(word)) relevance_score += 10;
      if (description.toLowerCase().includes(word)) relevance_score += 5;
      if (subtitle?.toLowerCase().includes(word)) relevance_score += 3;
    });

    return {
      id: item.id,
      type,
      title,
      description,
      subtitle,
      url,
      relevance_score,
      highlights,
      metadata: item,
      created_at: item.created_at,
      updated_at: item.updated_at || item.created_at
    };
  };

  const saveRecentSearch = (searchQuery: string) => {
    const newSearch: SearchSuggestion = {
      id: `recent-${Date.now()}`,
      query: searchQuery,
      type: 'recent',
      timestamp: new Date().toISOString()
    };

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.query !== searchQuery);
      return [newSearch, ...filtered].slice(0, 5);
    });
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'engagement': return <Target className="h-4 w-4 text-blue-500" />;
      case 'client': return <Building className="h-4 w-4 text-green-500" />;
      case 'outcome': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'agent': return <Bot className="h-4 w-4 text-orange-500" />;
      case 'user': return <Users className="h-4 w-4 text-pink-500" />;
      case 'document': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent': return <Clock className="h-3 w-3 text-gray-400" />;
      case 'trending': return <TrendingUp className="h-3 w-3 text-orange-400" />;
      case 'saved': return <Bookmark className="h-3 w-3 text-blue-400" />;
      case 'suggested': return <Zap className="h-3 w-3 text-purple-400" />;
      default: return <Search className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0" onKeyDown={handleKeyDown}>
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-none shadow-none text-lg p-0 focus-visible:ring-0"
            />
            {query && (
              <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Search Filters */}
        <div className="px-4 pb-2">
          <div className="flex gap-1 overflow-x-auto">
            {searchFilters.map(filter => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Icon className="h-3 w-3" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        <ScrollArea className="max-h-96">
          <div className="p-4">
            {query.length === 0 ? (
              /* Show suggestions when no query */
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Recent Searches
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map(search => (
                        <Button
                          key={search.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <div className="flex items-center gap-2">
                            {getSuggestionIcon(search.type)}
                            <span>{search.query}</span>
                            {search.timestamp && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(new Date(search.timestamp), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Trending & Suggestions
                  </h3>
                  <div className="space-y-1">
                    {suggestions.map(suggestion => (
                      <Button
                        key={suggestion.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="flex-1 text-left">{suggestion.query}</span>
                          {suggestion.count && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.count}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Show search results */
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-4">
                      Found {results.length} results for "{query}"
                    </div>
                    {results.map((result, index) => (
                      <div
                        key={result.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIndex === index 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50 border-transparent'
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                          
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground">No results found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <Zap className="h-3 w-3" />
              <span>Smart Search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};