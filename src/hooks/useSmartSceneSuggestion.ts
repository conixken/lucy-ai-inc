import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSmartSceneSuggestion = (conversationId: string | null) => {
  const [suggestedScene, setSuggestedScene] = useState<string | null>(null);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const suggestScene = async (chatContext: string, currentMood: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase.functions.invoke('suggest-scene', {
        body: {
          chatContext,
          currentMood,
          location: null,
          timeOfDay: getTimeOfDay()
        }
      });

      if (error) throw error;
      if (data?.suggestedScene) {
        setSuggestedScene(data.suggestedScene);
        
        // Log the activity
        await supabase.from('scene_activity_log').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          scene_type: data.suggestedScene,
          chat_context: { context: chatContext, mood: currentMood },
          interaction_quality: 'suggested'
        });
      }
    } catch (error) {
      console.error('Scene suggestion error:', error);
    }
  };

  // Auto-suggest based on time changes
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      // Trigger scene change at dawn (6am) and dusk (6pm)
      if (hour === 6 || hour === 18) {
        const timeOfDay = getTimeOfDay();
        suggestScene(`Time-based transition to ${timeOfDay}`, 'auto');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [conversationId]);

  return { suggestedScene, suggestScene, clearSuggestion: () => setSuggestedScene(null) };
};