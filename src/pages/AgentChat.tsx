import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: string;
  projects: {
    name: string;
    clients: {
      name: string;
      company: string;
    };
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AgentChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchAgent = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select(`
          *,
          projects (
            name,
            clients (
              name,
              company
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/agents");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !agent || isLoading) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to chat
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: {
          agentId: agent.id,
          message: userMessage,
          conversationId: conversationId
        }
      });

      if (error) throw error;

      // Add assistant response to chat
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Set conversation ID if this is the first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get agent response",
        variant: "destructive",
      });
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [id]);

  if (!agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/agents")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <p className="text-muted-foreground">
                {agent.role} • {agent.projects.clients.company} - {agent.projects.name}
              </p>
            </div>
          </div>
          <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {agent.status}
          </Badge>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Chat with {agent.name}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with {agent.name}</p>
                  {agent.description && (
                    <p className="text-sm mt-2">{agent.description}</p>
                  )}
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || agent.status !== 'active'}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading || agent.status !== 'active'}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {agent.status !== 'active' && (
            <p className="text-sm text-muted-foreground mt-2">
              This agent is currently {agent.status} and cannot respond to messages.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentChat;