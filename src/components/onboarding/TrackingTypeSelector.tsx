import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  HandCoins, 
  Building, 
  ArrowRight 
} from 'lucide-react';

interface TrackingTypeSelectorProps {
  onSelect: (type: 'ip' | 'equity' | 'acquisition') => void;
}

export default function TrackingTypeSelector({ onSelect }: TrackingTypeSelectorProps) {
  const trackingTypes = [
    {
      id: 'ip' as const,
      title: 'Intellectual Property',
      description: 'Track and manage your IP creation, patents, trademarks, and licensing opportunities',
      icon: Lightbulb,
      examples: ['Patents', 'Trademarks', 'Copyrights', 'Trade Secrets', 'Licensing Deals']
    },
    {
      id: 'equity' as const,
      title: 'Equity Deals',
      description: 'Monitor partnership and advisory opportunities in promising companies',
      icon: HandCoins,
      examples: ['Partner Roles', 'Advisory Positions', 'Equity Stakes', 'Board Seats', 'Revenue Shares']
    },
    {
      id: 'acquisition' as const,
      title: 'Asset Acquisitions',
      description: 'Track potential asset purchases, business acquisitions, and investment opportunities',
      icon: Building,
      examples: ['Business Acquisitions', 'Real Estate', 'Domain Names', 'Equipment', 'Investment Opportunities']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What would you like to track?</h2>
        <p className="text-muted-foreground">Choose your primary focus to get started with the right tracking tools</p>
      </div>
      
      <div className="grid gap-4">
        {trackingTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onSelect(type.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                      <CardDescription className="text-sm">{type.description}</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {type.examples.map((example) => (
                    <span key={example} className="text-xs px-2 py-1 bg-muted rounded-full">
                      {example}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't worry - you can track all types later. Start with your main focus.
        </p>
      </div>
    </div>
  );
}