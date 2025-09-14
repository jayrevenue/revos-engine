import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Sparkles,
  Info
} from "lucide-react";

const suggestions: Array<{ id: number; title: string; description: string; category: string; icon: any; prompt: string; }> = [];

const insights: Array<{ type: 'opportunity'|'warning'|'success'; title: string; description: string; action: string; urgency: 'low'|'medium'|'high'; }> = [];

export function AIAssistant() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user'|'assistant'; content: string }[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    const newMessage = { role: "user", content: message };
    setConversation(prev => [...prev, newMessage]);
    setMessage("");

    // No dummy responses. Integrate your AI provider to enable replies.
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.prompt);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>AI-Powered Insights</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} aria-label="Help: AI-Powered Insights" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                  <Info className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-sm">
                Recommendations synthesized from your roadmap and portfolio context. Connect your data and AI provider to enable insights.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No insights yet. Connect your data to see AI suggestions here.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" />
            )}
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Empire Strategy Assistant</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} aria-label="Help: Empire Strategy Assistant" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Ask natural questions about legal structures, licensing, deals, and acquisitions. Press Enter to send or Shift+Enter for a new line. Connect your AI provider to enable responses.
                </TooltipContent>
              </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end">Send (Enter). Use Shift+Enter for new line.</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} aria-label="Help: Quick Actions" className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-sm">
                  Click a suggestion to prefill the chat with a structured prompt.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quick actions yet.</p>
            ) : null}

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-sm">Document Generator</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} aria-label="Help: Document Generator" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Create common legal documents using your empire templates.</TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      IP License Template
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Open a pre-filled licensing template for customization.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Equity Agreement
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Draft a milestone-based equity agreement.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Management Services
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Generate a management services agreement for portfolio ops.</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-sm">Analysis Tools</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} aria-label="Help: Analysis Tools" className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-help">
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Open calculators and evaluators for deals, risks, and timing.</TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Deal Analyzer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Model outcomes and returns for potential deals.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Risk Assessment
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Identify and score risks by likelihood and impact.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline Optimizer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">Align milestones to budget and capacity constraints.</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </TooltipProvider>
  );
}
