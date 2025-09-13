import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientForm from "./pages/ClientForm";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import Revenue from "./pages/Revenue";
import RevenueForm from "./pages/RevenueForm";
import AIAgents from "./pages/AIAgents";
import AgentForm from "./pages/AgentForm";
import AgentChat from "./pages/AgentChat";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import NotFound from "./pages/NotFound";
import Engagements from "./pages/Engagements";
import EngagementDetail from "./pages/EngagementDetail";
import EngagementForm from "./pages/EngagementForm";
import IPLibrary from "./pages/IPLibrary";
import RevOSModules from "./pages/RevOSModules";
import Analytics from "./pages/Analytics";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Scheduling from "./pages/Scheduling";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/engagements" element={<Engagements />} />
            <Route path="/engagements/new" element={<EngagementForm />} />
            <Route path="/engagements/:id" element={<EngagementDetail />} />
            <Route path="/engagements/:id/edit" element={<EngagementForm />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/executive" element={<ExecutiveDashboard />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/library" element={<IPLibrary />} />
            <Route path="/revos/:engagementId" element={<RevOSModules />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientForm />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectForm />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/revenue/new" element={<RevenueForm />} />
            <Route path="/revenue/:id" element={<RevenueForm />} />
            <Route path="/agents" element={<AIAgents />} />
            <Route path="/agents/new" element={<AgentForm />} />
            <Route path="/agents/:id" element={<AgentForm />} />
            <Route path="/agents/:id/chat" element={<AgentChat />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
