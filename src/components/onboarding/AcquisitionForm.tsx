import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface AcquisitionFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function AcquisitionForm({ onSubmit, onBack, loading }: AcquisitionFormProps) {
  const [formData, setFormData] = useState({
    assetName: '',
    description: '',
    assetType: '',
    acquisitionStage: 'researching',
    estimatedValue: '',
    targetPrice: '',
    location: '',
    seller: '',
    sellerContact: '',
    dueDate: undefined as Date | undefined,
    keyFeatures: '',
    risks: '',
    financials: '',
    nextSteps: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      category: 'acquisition',
      entity_type: 'asset',
      title: `${formData.assetType} - ${formData.assetName}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>←</Button>
          Track Asset Acquisition
        </CardTitle>
        <CardDescription>
          Set up tracking for potential asset purchases and business acquisitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Asset Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset/Business Name</Label>
              <Input
                id="assetName"
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                placeholder="e.g., Downtown Office Building, SaaS Company"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the asset or business..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business/Company</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="domain">Domain Name</SelectItem>
                    <SelectItem value="equipment">Equipment/Machinery</SelectItem>
                    <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
                    <SelectItem value="investment">Investment Opportunity</SelectItem>
                    <SelectItem value="digital_asset">Digital Asset</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Acquisition Stage</Label>
                <Select value={formData.acquisitionStage} onValueChange={(value) => setFormData({ ...formData, acquisitionStage: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Researching</SelectItem>
                    <SelectItem value="identified">Identified Target</SelectItem>
                    <SelectItem value="initial_contact">Initial Contact</SelectItem>
                    <SelectItem value="evaluating">Evaluating</SelectItem>
                    <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="pending">Pending Close</SelectItem>
                    <SelectItem value="acquired">Acquired</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (if applicable)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State or specific address"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Financial Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Market Value</Label>
                <Input
                  id="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder="e.g., $500,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPrice">Target Purchase Price</Label>
                <Input
                  id="targetPrice"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                  placeholder="e.g., $450,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financials">Financial Details</Label>
              <Textarea
                id="financials"
                value={formData.financials}
                onChange={(e) => setFormData({ ...formData, financials: e.target.value })}
                placeholder="Revenue, profit margins, expenses, ROI projections..."
              />
            </div>
          </div>

          {/* Seller & Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium">Seller & Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller">Seller/Owner</Label>
                <Input
                  id="seller"
                  value={formData.seller}
                  onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                  placeholder="Seller name or company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellerContact">Seller Contact</Label>
                <Input
                  id="sellerContact"
                  value={formData.sellerContact}
                  onChange={(e) => setFormData({ ...formData, sellerContact: e.target.value })}
                  placeholder="Email or phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Acquisition Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Select target date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Analysis */}
          <div className="space-y-4">
            <h3 className="font-medium">Analysis</h3>
            
            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Key Features/Benefits</Label>
              <Textarea
                id="keyFeatures"
                value={formData.keyFeatures}
                onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                placeholder="What makes this asset attractive? Key selling points..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risks">Risks & Concerns</Label>
              <Textarea
                id="risks"
                value={formData.risks}
                onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                placeholder="Potential risks, red flags, or concerns..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextSteps">Next Steps</Label>
              <Textarea
                id="nextSteps"
                value={formData.nextSteps}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                placeholder="What needs to be done next for this acquisition?"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Acquisition Tracking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}