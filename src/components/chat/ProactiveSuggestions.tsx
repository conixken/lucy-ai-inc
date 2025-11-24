import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, X } from "lucide-react";

interface Suggestion {
  id: string;
  suggestion_text: string;
  suggestion_type: string;
  relevance_score: number;
}

interface ProactiveSuggestionsProps {
  conversationId: string;
  onSelectSuggestion: (text: string) => void;
}

export const ProactiveSuggestions = ({ 
  conversationId, 
  onSelectSuggestion 
}: ProactiveSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) return;

    const loadSuggestions = async () => {
      const { data } = await supabase
        .from('proactive_suggestions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('shown', false)
        .order('relevance_score', { ascending: false })
        .limit(3);

      if (data) {
        setSuggestions(data);
        
        // Mark as shown
        const ids = data.map(s => s.id);
        if (ids.length > 0) {
          await supabase
            .from('proactive_suggestions')
            .update({ shown: true })
            .in('id', ids);
        }
      }
    };

    loadSuggestions();

    // Subscribe to new suggestions
    const channel = supabase
      .channel(`suggestions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proactive_suggestions',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newSuggestion = payload.new as Suggestion;
          setSuggestions(prev => [newSuggestion, ...prev].slice(0, 3));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id));

  if (visibleSuggestions.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-start gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground mb-1">
            Suggestions
          </h4>
          <p className="text-xs text-muted-foreground">
            Based on our conversation, you might want to explore:
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {visibleSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start text-left h-auto py-2 px-3"
              onClick={() => {
                onSelectSuggestion(suggestion.suggestion_text);
                setDismissed(prev => new Set(prev).add(suggestion.id));
              }}
            >
              <span className="text-xs">{suggestion.suggestion_text}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setDismissed(prev => new Set(prev).add(suggestion.id))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};