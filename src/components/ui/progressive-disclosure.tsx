import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Eye,
  EyeOff,
  Settings,
  Zap,
  Info,
  Lock,
  Star,
  TrendingUp
} from "lucide-react";

interface ProgressiveDisclosureProps {
  title: string;
  subtitle?: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  locked?: boolean;
  prerequisite?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const levelConfig = {
  basic: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: Eye,
    description: 'Essential features for getting started'
  },
  intermediate: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: TrendingUp,
    description: 'Features for growing your empire'
  },
  advanced: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Zap,
    description: 'Power user features and automation'
  },
  expert: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    icon: Star,
    description: 'Expert-level tools and analytics'
  }
};

export function ProgressiveDisclosure({
  title,
  subtitle,
  level,
  locked = false,
  prerequisite,
  children,
  defaultOpen = false,
  onToggle,
  badge,
  icon: CustomIcon
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen && !locked);
  const config = levelConfig[level];
  const IconComponent = CustomIcon || config.icon;

  const handleToggle = () => {
    if (locked) return;
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <Card className={`transition-all duration-200 ${
      locked ? 'opacity-60' : ''
    } ${
      isOpen ? 'ring-1 ring-primary/20 shadow-sm' : ''
    }`}>
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              locked ? 'cursor-not-allowed hover:bg-transparent' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {locked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <IconComponent className="h-5 w-5 text-primary" />
                )}
                <div className="text-left">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {title}
                    {badge && (
                      <Badge variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    )}
                  </CardTitle>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={config.color}>
                  {level}
                </Badge>
                {locked ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {locked && prerequisite ? (
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Feature Locked</p>
                  <p className="text-sm text-muted-foreground">{prerequisite}</p>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="pt-0 space-y-4">
              {!defaultOpen && (
                <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Info className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {config.description}
                    </p>
                  </div>
                </div>
              )}
              {children}
            </CardContent>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Progressive Disclosure Container for organizing multiple sections
interface ProgressiveDisclosureContainerProps {
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProgressiveDisclosureContainer({
  userLevel = 'beginner',
  children,
  title = "Features",
  description
}: ProgressiveDisclosureContainerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Auto-expand sections based on user level
  useEffect(() => {
    const autoExpand: string[] = [];
    
    // Always show basic features
    autoExpand.push('basic');
    
    if (userLevel === 'intermediate' || userLevel === 'advanced' || userLevel === 'expert') {
      autoExpand.push('intermediate');
    }
    
    if (userLevel === 'advanced' || userLevel === 'expert') {
      autoExpand.push('advanced');
    }
    
    if (userLevel === 'expert') {
      autoExpand.push('expert');
    }
    
    setExpandedSections(autoExpand);
  }, [userLevel]);

  const handleToggleAll = () => {
    if (expandedSections.length > 0) {
      setExpandedSections([]);
    } else {
      setExpandedSections(['basic', 'intermediate', 'advanced', 'expert']);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {userLevel} user
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleAll}
          >
            {expandedSections.length > 0 ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Collapse All
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Expand All
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Hook for managing progressive disclosure state
export function useProgressiveDisclosure(initialLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner') {
  const [userLevel, setUserLevel] = useState(initialLevel);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  const completeTask = (taskId: string) => {
    if (!completedMilestones.includes(taskId)) {
      setCompletedMilestones(prev => [...prev, taskId]);
    }
  };

  const promoteUser = () => {
    const levels: ('beginner' | 'intermediate' | 'advanced' | 'expert')[] = 
      ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(userLevel);
    
    if (currentIndex < levels.length - 1) {
      setUserLevel(levels[currentIndex + 1]);
    }
  };

  const canAccess = (requiredLevel: string): boolean => {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    
    return userLevelIndex >= requiredLevelIndex;
  };

  return {
    userLevel,
    setUserLevel,
    completedMilestones,
    completeTask,
    promoteUser,
    canAccess
  };
}