import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, message, conversationId } = await req.json();

    if (!agentId || !message) {
      throw new Error('Agent ID and message are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    if (agent.status !== 'active') {
      throw new Error('Agent is not active');
    }

    // Get conversation history if conversationId is provided
    let conversationHistory = [];
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('agent_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();
      
      if (conversation?.messages) {
        conversationHistory = conversation.messages as any[];
      }
    }

    // Prepare messages for OpenAI
    const messages = [];
    
    // Add system prompt if available
    if (agent.system_prompt) {
      messages.push({
        role: 'system',
        content: agent.system_prompt
      });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('Sending request to OpenAI with messages:', messages);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: agent.model || 'gpt-4o',
        messages: messages,
        max_completion_tokens: 1000,
        stream: false,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const assistantMessage = openAIData.choices[0].message.content;
    const tokensUsed = openAIData.usage?.total_tokens || 0;

    console.log('OpenAI response received:', { assistantMessage, tokensUsed });

    // Update conversation history
    const updatedMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }
    ];

    // Get user ID from auth
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Create or update conversation
    let finalConversationId = conversationId;
    if (!conversationId && userId) {
      const { data: newConversation } = await supabase
        .from('agent_conversations')
        .insert({
          agent_id: agentId,
          user_id: userId,
          title: message.substring(0, 50) + '...',
          messages: updatedMessages,
          token_count: tokensUsed
        })
        .select()
        .single();
      
      finalConversationId = newConversation?.id;
    } else if (conversationId) {
      await supabase
        .from('agent_conversations')
        .update({
          messages: updatedMessages,
          token_count: tokensUsed
        })
        .eq('id', conversationId);
    }

    // Update agent usage stats
    const currentStats = agent.usage_stats as any || {};
    const updatedStats = {
      total_conversations: (currentStats.total_conversations || 0) + (conversationId ? 0 : 1),
      total_tokens: (currentStats.total_tokens || 0) + tokensUsed,
      last_used: new Date().toISOString()
    };

    await supabase
      .from('ai_agents')
      .update({ usage_stats: updatedStats })
      .eq('id', agentId);

    return new Response(JSON.stringify({
      response: assistantMessage,
      conversationId: finalConversationId,
      tokensUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agent-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});