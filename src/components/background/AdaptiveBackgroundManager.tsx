import { useState, useEffect } from 'react';
import { BackgroundVideo } from './BackgroundVideo';
import { ParallaxLayer } from './ParallaxLayer';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useScenePreferences } from '@/hooks/useScenePreferences';
import { useChatActivitySync } from '@/hooks/useChatActivitySync';

interface AdaptiveBackgroundManagerProps {
  userId: string | undefined;
  isPaused: boolean;
  isMuted: boolean;
  currentTheme: string;
  performanceQuality: string;
}

export const AdaptiveBackgroundManager = ({
  userId,
  isPaused,
  isMuted,
  currentTheme,
  performanceQuality
}: AdaptiveBackgroundManagerProps) => {
  const { preferences, loading } = useScenePreferences(userId);
  const { location } = useGeolocation(preferences.geolocation_enabled);
  const { activity } = useChatActivitySync();
  const [adaptiveTheme, setAdaptiveTheme] = useState(currentTheme);

  useEffect(() => {
    if (!preferences.auto_theme_enabled) {
      setAdaptiveTheme(currentTheme);
      return;
    }

    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const themesForTime = preferences.time_based_themes[timeOfDay] || [];
    if (themesForTime.length > 0) {
      const randomTheme = themesForTime[Math.floor(Math.random() * themesForTime.length)];
      setAdaptiveTheme(randomTheme);
    }
  }, [preferences.auto_theme_enabled, preferences.time_based_themes, currentTheme]);

  if (loading) return null;

  return (
    <ParallaxLayer
      intensity={preferences.parallax_intensity}
      activityLevel={activity.activityLevel}
    >
      <BackgroundVideo
        theme={adaptiveTheme}
        isPaused={isPaused}
        isMuted={isMuted}
      />
    </ParallaxLayer>
  );
};
