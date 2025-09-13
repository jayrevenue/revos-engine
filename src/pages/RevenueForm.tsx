import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save } from "lucide-react";

interface Project {
  id: string;
  name: string;
  clients: {
    name: string;
    company: string;
  };
}

interface RevenueFormData {
  project_id: string;
  amount: string;
  description: string;
  invoice_number: string;
  invoice_date: string;
  payment_date: string;
  payment_status: string;
}

const RevenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RevenueFormData>({
    project_id: "",
    amount: "",
    description: "",
    invoice_number: "",
    invoice_date: "",
    payment_date: "",
    payment_status: "pending",
  });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          clients (
            name,
            company
          )
        `)
        .order("name");

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRevenue = async () => {
    if (!isEdit) return;

    try {
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        project_id: data.project_id,
        amount: data.amount.toString(),
        description: data.description || "",
        invoice_number: data.invoice_number || "",
        invoice_date: data.invoice_date || "",
        payment_date: data.payment_date || "",
        payment_status: data.payment_status,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/revenue");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const revenueData = {
        project_id: formData.project_id,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        invoice_number: formData.invoice_number || null,
        invoice_date: formData.invoice_date || null,
        payment_date: formData.payment_date || null,
        payment_status: formData.payment_status,
        created_by: user.id,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("revenue")
          .update(revenueData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("revenue")
          .insert([revenueData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Revenue ${isEdit ? "updated" : "created"} successfully`,
      });

      navigate("/revenue");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RevenueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchProjects();
    fetchRevenue();
  }, [id]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/revenue")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Revenue
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Revenue" : "Add New Revenue"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleInputChange("project_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.clients.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status *</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleInputChange("payment_status", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                placeholder="INV-001"
                value={formData.invoice_number}
                onChange={(e) => handleInputChange("invoice_number", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => handleInputChange("invoice_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange("payment_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional notes about this revenue..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : isEdit ? "Update Revenue" : "Add Revenue"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/revenue")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueForm;