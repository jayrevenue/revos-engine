import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <Card className={`border-dashed border-2 ${className}`}>
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {icon && (
            <div className="text-muted-foreground/50">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          </div>
          {action && (
            <Button onClick={action.onClick} className="mt-4">
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}