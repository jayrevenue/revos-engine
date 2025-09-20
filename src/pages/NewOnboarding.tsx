import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TrackingTypeSelector from '@/components/onboarding/TrackingTypeSelector';
import IPCreationForm from '@/components/onboarding/IPCreationForm';
import EquityDealForm from '@/components/onboarding/EquityDealForm';
import AcquisitionForm from '@/components/onboarding/AcquisitionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

type OnboardingStep = 'selector' | 'form' | 'success';
type TrackingType = 'ip' | 'equity' | 'acquisition';

export default function NewOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<OnboardingStep>('selector');
  const [trackingType, setTrackingType] = useState<TrackingType | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<any>(null);

  // Handle direct navigation with type parameter
  useEffect(() => {
    const typeParam = searchParams.get('type') as TrackingType;
    if (typeParam && ['ip', 'equity', 'acquisition'].includes(typeParam)) {
      setTrackingType(typeParam);
      setStep('form');
    }
  }, [searchParams]);

  const handleTypeSelect = (type: TrackingType) => {
    setTrackingType(type);
    setStep('form');
  };

  const handleFormSubmit = async (formData: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create activity record for tracking
      const { data, error } = await supabase
        .from('activities')
        .insert({
          title: formData.title,
          description: formData.description || '',
          type: formData.category,
          entity_type: formData.entity_type,
          user_id: user.id,
          metadata: {
            ...formData,
            tracking_type: trackingType,
            created_via: 'onboarding'
          },
          priority: 'high'
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedRecord(data);
      setStep('success');
      
      toast({
        title: 'Success!',
        description: 'Your tracking record has been created successfully.'
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tracking record',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('selector');
      setTrackingType(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'selector':
        return <TrackingTypeSelector onSelect={handleTypeSelect} />;
      
      case 'form':
        if (trackingType === 'ip') {
          return (
            <IPCreationForm 
              onSubmit={handleFormSubmit} 
              onBack={handleBack}
              loading={loading}
            />
          );
        }
        if (trackingType === 'equity') {
          return (
            <EquityDealForm 
              onSubmit={handleFormSubmit} 
              onBack={handleBack}
              loading={loading}
            />
          );
        }
        if (trackingType === 'acquisition') {
          return (
            <AcquisitionForm 
              onSubmit={handleFormSubmit} 
              onBack={handleBack}
              loading={loading}
            />
          );
        }
        break;
      
      case 'success':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Successfully Created!</CardTitle>
              <CardDescription>
                Your {trackingType === 'ip' ? 'IP' : trackingType === 'equity' ? 'equity deal' : 'acquisition'} tracking record is now active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Record Details:</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Title:</strong> {createdRecord?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Type:</strong> {createdRecord?.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Created:</strong> {new Date(createdRecord?.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">What's Next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Track progress and updates in the Dashboard</li>
                  <li>• Set up notifications for important milestones</li>
                  <li>• Add more {trackingType === 'ip' ? 'IP projects' : trackingType === 'equity' ? 'equity opportunities' : 'acquisition targets'} as needed</li>
                  <li>• Use AI agents to help manage your portfolio</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  View Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setStep('selector');
                    setTrackingType(null);
                    setCreatedRecord(null);
                  }}
                  className="w-full"
                >
                  Add Another
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Your Portfolio Tracker</h1>
            <p className="text-muted-foreground mt-2">
              Start building and tracking your intellectual property, equity deals, and asset acquisitions
            </p>
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
}