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
import { ArrowLeft, Save, Brain } from "lucide-react";

interface Project {
  id: string;
  name: string;
  clients: {
    name: string;
    company: string;
  };
}

interface AgentFormData {
  name: string;
  role: string;
  description: string;
  model: string;
  system_prompt: string;
  project_id: string;
  status: string;
}

const AgentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    role: "",
    description: "",
    model: "gpt-4o",
    system_prompt: "",
    project_id: "",
    status: "active",
  });

  const agentRoles = [
    "AI CFO",
    "AE Copilot", 
    "Compliance Agent",
    "Revenue Analyst",
    "Sales Coach",
    "Customer Success Agent",
    "Pricing Strategist",
    "Retention Specialist"
  ];

  const models = [
    { value: "gpt-4o", label: "GPT-4o (Recommended)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
    { value: "gpt-4", label: "GPT-4 (Legacy)" },
  ];

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

  const fetchAgent = async () => {
    if (!isEdit) return;

    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        role: data.role,
        description: data.description || "",
        model: data.model,
        system_prompt: data.system_prompt || "",
        project_id: data.project_id,
        status: data.status,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/agents");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const agentData = {
        name: formData.name,
        role: formData.role,
        description: formData.description || null,
        model: formData.model,
        system_prompt: formData.system_prompt || null,
        project_id: formData.project_id,
        status: formData.status,
        created_by: user.id,
        usage_stats: {
          total_conversations: 0,
          total_tokens: 0,
          last_used: null
        }
      };

      if (isEdit) {
        const { error } = await supabase
          .from("ai_agents")
          .update(agentData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_agents")
          .insert([agentData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Agent ${isEdit ? "updated" : "deployed"} successfully`,
      });

      navigate("/agents");
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

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchProjects();
    fetchAgent();
  }, [id]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/agents")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit AI Agent" : "Deploy New AI Agent"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., CFO Assistant Alpha"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Agent Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent role" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project Assignment *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model *</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => handleInputChange("model", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this agent does and its primary functions..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt">System Prompt</Label>
              <Textarea
                id="system_prompt"
                placeholder="Define the agent's behavior, personality, and capabilities..."
                value={formData.system_prompt}
                onChange={(e) => handleInputChange("system_prompt", e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                This prompt defines how the AI agent behaves and responds. Be specific about its role, capabilities, and limitations.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : isEdit ? "Update Agent" : "Deploy Agent"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agents")}
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

export default AgentForm;