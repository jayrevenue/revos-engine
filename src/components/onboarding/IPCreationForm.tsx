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
import { CalendarIcon, Plus, X } from 'lucide-react';

interface IPCreationFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function IPCreationForm({ onSubmit, onBack, loading }: IPCreationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: 'idea',
    filingDate: undefined as Date | undefined,
    inventors: [''],
    potentialValue: '',
    developmentStage: '',
    nextSteps: '',
  });

  const handleInventorChange = (index: number, value: string) => {
    const newInventors = [...formData.inventors];
    newInventors[index] = value;
    setFormData({ ...formData, inventors: newInventors });
  };

  const addInventor = () => {
    setFormData({ ...formData, inventors: [...formData.inventors, ''] });
  };

  const removeInventor = (index: number) => {
    if (formData.inventors.length > 1) {
      const newInventors = formData.inventors.filter((_, i) => i !== index);
      setFormData({ ...formData, inventors: newInventors });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      inventors: formData.inventors.filter(inv => inv.trim() !== ''),
      category: 'ip_creation',
      entity_type: 'intellectual_property'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>←</Button>
          Create IP Tracking Record
        </CardTitle>
        <CardDescription>
          Set up tracking for your intellectual property creation and development
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">IP Title/Name</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Revolutionary Data Processing Algorithm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the intellectual property..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IP type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patent">Patent</SelectItem>
                    <SelectItem value="trademark">Trademark</SelectItem>
                    <SelectItem value="copyright">Copyright</SelectItem>
                    <SelectItem value="trade_secret">Trade Secret</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="software">Software/Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Development Stage</Label>
                <Select value={formData.developmentStage} onValueChange={(value) => setFormData({ ...formData, developmentStage: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea/Concept</SelectItem>
                    <SelectItem value="research">Research Phase</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="filing">Filing/Application</SelectItem>
                    <SelectItem value="granted">Granted/Registered</SelectItem>
                    <SelectItem value="commercialized">Commercialized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Inventors/Creators */}
          <div className="space-y-4">
            <h3 className="font-medium">Inventors/Creators</h3>
            {formData.inventors.map((inventor, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={inventor}
                  onChange={(e) => handleInventorChange(index, e.target.value)}
                  placeholder="Inventor name"
                  required={index === 0}
                />
                {formData.inventors.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInventor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addInventor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Inventor
            </Button>
          </div>

          {/* Timeline and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filing/Creation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.filingDate ? format(formData.filingDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.filingDate}
                    onSelect={(date) => setFormData({ ...formData, filingDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="potentialValue">Estimated Potential Value</Label>
              <Input
                id="potentialValue"
                value={formData.potentialValue}
                onChange={(e) => setFormData({ ...formData, potentialValue: e.target.value })}
                placeholder="e.g., $50,000 - $500,000"
              />
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <Label htmlFor="nextSteps">Next Steps/Action Items</Label>
            <Textarea
              id="nextSteps"
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              placeholder="What needs to be done next for this IP?"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create IP Tracking Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}