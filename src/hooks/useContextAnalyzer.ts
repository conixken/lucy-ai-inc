import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: string;
  content: string;
}

export const useContextAnalyzer = (conversationId: string | null) => {
  const analyzeContext = useCallback(async (messages: Message[]) => {
    if (!conversationId || messages.length < 3) return;

    try {
      const { data, error } = await supabase.functions.invoke('context-analyzer', {
        body: {
          conversationId,
          messages: messages.slice(-10) // Last 10 messages
        }
      });

      if (error) throw error;

      if (data?.context) {
        // Store context in database
        const { error: insertError } = await supabase
          .from('conversation_context')
          .upsert({
            conversation_id: conversationId,
            context_summary: data.context.summary,
            key_topics: data.context.topics,
            user_preferences: data.context.preferences,
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        // Generate proactive suggestions
        if (data.context.suggestions) {
          const suggestions = data.context.suggestions.map((s: string) => ({
            conversation_id: conversationId,
            suggestion_text: s,
            suggestion_type: 'follow_up',
            relevance_score: 0.7,
            shown: false
          }));

          await supabase
            .from('proactive_suggestions')
            .insert(suggestions);
        }
      }
    } catch (error) {
      console.error('Context analysis error:', error);
    }
  }, [conversationId]);

  // Analyze context every few messages
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchMessages = async () => {
        if (!conversationId) return;

        const { data } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (data && data.length >= 3) {
          analyzeContext(data);
        }
      };

      fetchMessages();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [conversationId, analyzeContext]);

  return { analyzeContext };
};