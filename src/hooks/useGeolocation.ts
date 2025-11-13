import { useState, useEffect } from 'react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  city: string;
}

export const useGeolocation = (enabled: boolean) => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get timezone and location info
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          setLocation({
            latitude,
            longitude,
            timezone,
            country: 'Unknown',
            city: 'Unknown'
          });
          setError(null);
        } catch (err) {
          console.error('Geolocation error:', err);
          setError('Failed to get location details');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [enabled]);

  return { location, loading, error };
};
