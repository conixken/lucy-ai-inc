import { useEffect, useRef, useState } from 'react';

interface SoundscapePlayerProps {
  theme: string;
  enabled: boolean;
  volume: number;
}

// Map themes to ambient soundscape URLs
const soundscapeUrls: Record<string, string> = {
  rain: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3f7b4d4f1.mp3',
  ocean: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_2f2c28d5e9.mp3',
  forest: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_b9bd5034af.mp3',
  night: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_f920224e7b.mp3',
  nature: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
};

export const SoundscapePlayer = ({ theme, enabled, volume }: SoundscapePlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        fadeOut();
      }
      return;
    }

    const soundUrl = soundscapeUrls[theme] || soundscapeUrls.nature;
    
    if (!audioRef.current) {
      const audio = new Audio(soundUrl);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
      
      audio.play().then(() => {
        fadeIn();
      }).catch(err => {
        console.error('Soundscape playback error:', err);
      });
    } else if (audioRef.current.src !== soundUrl) {
      // Fade out, change source, fade in
      setIsTransitioning(true);
      fadeOut(() => {
        if (audioRef.current) {
          audioRef.current.src = soundUrl;
          audioRef.current.play().then(() => {
            fadeIn();
            setIsTransitioning(false);
          });
        }
      });
    }
  }, [theme, enabled]);

  useEffect(() => {
    if (audioRef.current && !isTransitioning) {
      audioRef.current.volume = Math.min(volume, 1);
    }
  }, [volume, isTransitioning]);

  const fadeIn = () => {
    if (!audioRef.current) return;
    
    const targetVolume = volume;
    const fadeStep = targetVolume / 30; // 3 seconds fade
    let currentVolume = 0;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      
      currentVolume += fadeStep;
      if (currentVolume >= targetVolume) {
        audioRef.current.volume = targetVolume;
        clearInterval(fadeInterval);
      } else {
        audioRef.current.volume = currentVolume;
      }
    }, 100);
  };

  const fadeOut = (callback?: () => void) => {
    if (!audioRef.current) return;
    
    const currentVolume = audioRef.current.volume;
    const fadeStep = currentVolume / 30;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      
      const newVolume = audioRef.current.volume - fadeStep;
      if (newVolume <= 0) {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        clearInterval(fadeInterval);
        if (callback) callback();
      } else {
        audioRef.current.volume = newVolume;
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return null;
};
