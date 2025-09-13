import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  MessageSquare, 
  Lightbulb, 
  Target,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Send,
  Sparkles
} from "lucide-react";

const suggestions = [
  {
    id: 1,
    title: "Draft IP License Agreement",
    description: "Generate a custom licensing agreement for a RevOps agency",
    category: "Legal",
    icon: FileText,
    prompt: "Help me draft an IP licensing agreement for a RevOps agency that wants to license our RevenueOS for their clients."
  },
  {
    id: 2,
    title: "Analyze Acquisition Target",
    description: "Evaluate potential business acquisition opportunities",
    category: "M&A",
    icon: TrendingUp,
    prompt: "I found a potential RCM vendor acquisition. Help me analyze if it fits our empire strategy."
  },
  {
    id: 3,
    title: "Structure Equity Deal",
    description: "Design milestone-based equity partnership terms",
    category: "Equity",
    icon: Target,
    prompt: "How should I structure an equity deal for implementing RevenueOS at a $5M ARR SaaS company?"
  },
  {
    id: 4,
    title: "Risk Assessment",
    description: "Identify potential risks in current empire phase",
    category: "Risk",
    icon: AlertCircle,
    prompt: "What are the key risks I should watch for in Phase 2 of empire building?"
  }
];

const insights = [
  {
    type: "opportunity",
    title: "IP License Opportunity",
    description: "3 RevOps agencies in your network match your ideal licensee profile",
    action: "Review prospects",
    urgency: "high"
  },
  {
    type: "warning",
    title: "Cash Flow Alert",
    description: "Empire construction costs may exceed budget in Q2",
    action: "Adjust timeline",
    urgency: "medium"
  },
  {
    type: "success",
    title: "Milestone Achievement",
    description: "Legal structure phase is 75% complete - ahead of schedule",
    action: "Plan next phase",
    urgency: "low"
  }
];

export function AIAssistant() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content: "Welcome to your Empire AI Assistant! I'm here to help you build your Revenue Expert Empire. I can help with legal structures, deal analysis, risk assessment, and strategic planning. How can I assist you today?"
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    const newMessage = { role: "user", content: message };
    setConversation(prev => [...prev, newMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const response = {
        role: "assistant",
        content: "I understand you want help with that. Let me analyze your empire structure and provide specific recommendations based on your current phase and goals. This is a simulated response - in the full implementation, I would connect to OpenAI's API for real AI assistance."
      };
      setConversation(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.prompt);
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.urgency === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                insight.urgency === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                'border-l-green-500 bg-green-50 dark:bg-green-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'opportunity' && <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Empire Strategy Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Conversation History */}
              <div className="h-80 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
                {conversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background border p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-pulse text-primary" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about empire strategy, legal structures, deal analysis..."
                  className="min-h-[50px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}>
                <div className="flex items-start gap-3">
                  <suggestion.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Document Generator</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  IP License Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Equity Agreement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Management Services
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Analysis Tools</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Deal Analyzer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Risk Assessment
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline Optimizer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}