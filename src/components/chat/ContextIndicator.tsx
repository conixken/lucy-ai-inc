import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp } from "lucide-react";

interface ContextIndicatorProps {
  conversationId: string;
}

export const ContextIndicator = ({ conversationId }: ContextIndicatorProps) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const loadContext = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('conversation_context')
        .select('key_topics')
        .eq('conversation_id', conversationId)
        .single();

      if (data?.key_topics) {
        setTopics(data.key_topics);
      }
      setLoading(false);
    };

    loadContext();

    // Subscribe to context updates
    const channel = supabase
      .channel(`context-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_context',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).key_topics) {
            setTopics((payload.new as any).key_topics);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  if (!topics.length || loading) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg border border-border/50">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Brain className="h-3.5 w-3.5" />
        <span className="font-medium">Context:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {topics.slice(0, 5).map((topic, idx) => (
          <Badge 
            key={idx} 
            variant="secondary" 
            className="text-xs px-2 py-0.5"
          >
            {topic}
          </Badge>
        ))}
        {topics.length > 5 && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            +{topics.length - 5}
          </Badge>
        )}
      </div>
    </div>
  );
};