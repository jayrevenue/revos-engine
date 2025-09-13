import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import AppearanceInitializer from "@/components/layout/AppearanceInitializer";
import DashboardLayout from "./components/layout/DashboardLayout";
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
import PromptForm from "./pages/PromptForm";
import PlaybookForm from "./pages/PlaybookForm";
import FrameworkForm from "./pages/FrameworkForm";
import NotFound from "./pages/NotFound";
import Engagements from "./pages/Engagements";
import EngagementDetail from "./pages/EngagementDetail";
import EngagementForm from "./pages/EngagementForm";
import IPLibrary from "./pages/IPLibrary";
import Empire from "./pages/Empire";
import RevOSModules from "./pages/RevOSModules";
import Analytics from "./pages/Analytics";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Scheduling from "./pages/Scheduling";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppearanceInitializer />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes with dashboard layout */}
              <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
              <Route path="/engagements" element={<DashboardLayout><Engagements /></DashboardLayout>} />
              <Route path="/engagements/new" element={<DashboardLayout><EngagementForm /></DashboardLayout>} />
              <Route path="/engagements/:id" element={<DashboardLayout><EngagementDetail /></DashboardLayout>} />
              <Route path="/engagements/:id/edit" element={<DashboardLayout><EngagementForm /></DashboardLayout>} />
              <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
              <Route path="/executive" element={<DashboardLayout><ExecutiveDashboard /></DashboardLayout>} />
              <Route path="/scheduling" element={<DashboardLayout><Scheduling /></DashboardLayout>} />
              <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
              <Route path="/library" element={<DashboardLayout><IPLibrary /></DashboardLayout>} />
              <Route path="/empire" element={<DashboardLayout><Empire /></DashboardLayout>} />
              <Route path="/revos/:engagementId" element={<DashboardLayout><RevOSModules /></DashboardLayout>} />
              <Route path="/clients" element={<DashboardLayout><Clients /></DashboardLayout>} />
              <Route path="/clients/new" element={<DashboardLayout><ClientForm /></DashboardLayout>} />
              <Route path="/clients/:id" element={<DashboardLayout><ClientForm /></DashboardLayout>} />
              <Route path="/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
              <Route path="/projects/new" element={<DashboardLayout><ProjectForm /></DashboardLayout>} />
              <Route path="/projects/:id" element={<DashboardLayout><ProjectForm /></DashboardLayout>} />
              <Route path="/revenue" element={<DashboardLayout><Revenue /></DashboardLayout>} />
              <Route path="/revenue/new" element={<DashboardLayout><RevenueForm /></DashboardLayout>} />
              <Route path="/revenue/:id" element={<DashboardLayout><RevenueForm /></DashboardLayout>} />
              <Route path="/agents" element={<DashboardLayout><AIAgents /></DashboardLayout>} />
              <Route path="/agents/new" element={<DashboardLayout><AgentForm /></DashboardLayout>} />
              <Route path="/agents/:id" element={<DashboardLayout><AgentForm /></DashboardLayout>} />
              <Route path="/agents/:id/chat" element={<DashboardLayout><AgentChat /></DashboardLayout>} />
              <Route path="/users" element={<DashboardLayout><Users /></DashboardLayout>} />
              <Route path="/users/new" element={<DashboardLayout><UserForm /></DashboardLayout>} />
              <Route path="/users/:id" element={<DashboardLayout><UserForm /></DashboardLayout>} />
              <Route path="/library/prompts/new" element={<DashboardLayout><PromptForm /></DashboardLayout>} />
              <Route path="/library/prompts/:id" element={<DashboardLayout><PromptForm /></DashboardLayout>} />
              <Route path="/library/playbooks/new" element={<DashboardLayout><PlaybookForm /></DashboardLayout>} />
              <Route path="/library/playbooks/:id" element={<DashboardLayout><PlaybookForm /></DashboardLayout>} />
              <Route path="/library/frameworks/new" element={<DashboardLayout><FrameworkForm /></DashboardLayout>} />
              <Route path="/library/frameworks/:id" element={<DashboardLayout><FrameworkForm /></DashboardLayout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
