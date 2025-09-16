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

interface EquityDealFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function EquityDealForm({ onSubmit, onBack, loading }: EquityDealFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    roleType: '',
    equityPercentage: '',
    dealStage: 'prospecting',
    industry: '',
    companyStage: '',
    contactPerson: '',
    contactEmail: '',
    estimatedRevenue: '',
    targetDate: undefined as Date | undefined,
    notes: '',
    keyTerms: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      category: 'equity_deal',
      entity_type: 'company',
      title: `${formData.roleType} - ${formData.companyName}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>←</Button>
          Track Equity Deal Opportunity
        </CardTitle>
        <CardDescription>
          Set up tracking for partnership and advisory opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Company Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., TechCorp Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company/Opportunity Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the company and opportunity..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company Stage</Label>
                <Select value={formData.companyStage} onValueChange={(value) => setFormData({ ...formData, companyStage: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea Stage</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="growth">Growth Stage</SelectItem>
                    <SelectItem value="established">Established</SelectItem>
                    <SelectItem value="public">Public Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deal Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Deal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select value={formData.roleType} onValueChange={(value) => setFormData({ ...formData, roleType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advisor">Advisor</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="board_member">Board Member</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="fractional_exec">Fractional Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Deal Stage</Label>
                <Select value={formData.dealStage} onValueChange={(value) => setFormData({ ...formData, dealStage: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">Prospecting</SelectItem>
                    <SelectItem value="initial_contact">Initial Contact</SelectItem>
                    <SelectItem value="discussions">In Discussions</SelectItem>
                    <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="finalizing">Finalizing</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equityPercentage">Equity/Compensation</Label>
                <Input
                  id="equityPercentage"
                  value={formData.equityPercentage}
                  onChange={(e) => setFormData({ ...formData, equityPercentage: e.target.value })}
                  placeholder="e.g., 2% equity, $5k/month"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedRevenue">Company Revenue (if known)</Label>
                <Input
                  id="estimatedRevenue"
                  value={formData.estimatedRevenue}
                  onChange={(e) => setFormData({ ...formData, estimatedRevenue: e.target.value })}
                  placeholder="e.g., $500k ARR"
                />
              </div>
            </div>
          </div>

          {/* Contact & Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact & Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Primary Contact</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.targetDate ? format(formData.targetDate, 'PPP') : 'Select target date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate}
                    onSelect={(date) => setFormData({ ...formData, targetDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyTerms">Key Terms</Label>
              <Textarea
                id="keyTerms"
                value={formData.keyTerms}
                onChange={(e) => setFormData({ ...formData, keyTerms: e.target.value })}
                placeholder="Important terms, conditions, or requirements..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this opportunity..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Equity Deal Tracking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}