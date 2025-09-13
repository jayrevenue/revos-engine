import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  clients: {
    name: string;
    company: string;
  };
}

interface RevenueData {
  amount: string;
  description: string;
  invoice_number: string;
  invoice_date: string;
  payment_date: string;
  payment_status: string;
  project_id: string;
}

export default function RevenueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<RevenueData>({
    amount: "",
    description: "",
    invoice_number: "",
    invoice_date: "",
    payment_date: "",
    payment_status: "pending",
    project_id: "",
  });

  const isEdit = !!id;

  useEffect(() => {
    fetchProjects();
    if (isEdit) {
      fetchRevenue();
    }
  }, [id]);

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
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    }
  };

  const fetchRevenue = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        amount: data.amount.toString(),
        description: data.description || "",
        invoice_number: data.invoice_number || "",
        invoice_date: data.invoice_date || "",
        payment_date: data.payment_date || "",
        payment_status: data.payment_status,
        project_id: data.project_id,
      });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast({
        title: "Error",
        description: "Failed to fetch revenue data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const revenueData = {
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        invoice_number: formData.invoice_number || null,
        invoice_date: formData.invoice_date || null,
        payment_date: formData.payment_date || null,
        payment_status: formData.payment_status,
        project_id: formData.project_id,
        created_by: user.id,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("revenue")
          .update(revenueData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Revenue updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("revenue")
          .insert([revenueData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Revenue created successfully",
        });
      }

      navigate("/revenue");
    } catch (error) {
      console.error("Error saving revenue:", error);
      toast({
        title: "Error",
        description: "Failed to save revenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RevenueData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/revenue")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Revenue
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Revenue" : "Add Revenue"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update revenue information" : "Add a new revenue record"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Revenue description or notes"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Revenue" : "Create Revenue"}
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
}