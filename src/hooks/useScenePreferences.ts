import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScenePreferences {
  id?: string;
  user_id?: string;
  auto_theme_enabled: boolean;
  geolocation_enabled: boolean;
  time_based_themes: Record<string, string[]>;
  favorite_scenes: string[];
  active_playlist_id?: string;
  parallax_intensity: number;
  transition_duration: number;
  location_data: any;
}

export const useScenePreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<ScenePreferences>({
    auto_theme_enabled: true,
    geolocation_enabled: false,
    time_based_themes: {
      morning: ['sunrise', 'forest'],
      afternoon: ['ocean', 'beach'],
      evening: ['sunset', 'rain'],
      night: ['stars', 'aurora']
    },
    favorite_scenes: [],
    parallax_intensity: 0.5,
    transition_duration: 75,
    location_data: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('scene_preferences' as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading preferences:', error);
    }

    if (data) {
      setPreferences(data as any);
    } else {
      // Create default preferences
      const { data: newPrefs } = await supabase
        .from('scene_preferences' as any)
        .insert({
          user_id: userId,
          ...preferences
        })
        .select()
        .single();

      if (newPrefs) setPreferences(newPrefs as any);
    }

    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<ScenePreferences>) => {
    if (!userId) return;

    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    await supabase
      .from('scene_preferences' as any)
      .upsert({
        user_id: userId,
        ...newPrefs
      });
  };

  return { preferences, updatePreferences, loading };
};
