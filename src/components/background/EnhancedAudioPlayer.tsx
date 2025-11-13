import { useEffect, useRef, useState } from 'react';

interface EnhancedAudioPlayerProps {
  theme: string;
  enabled: boolean;
  volume: number;
  autoLowerOnActivity: boolean;
}

// High-quality ambient soundscapes
const audioScapes: Record<string, string[]> = {
  rain: [
    'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3f7b4d4f1.mp3',
    'https://cdn.pixabay.com/download/audio/2024/01/15/audio_d8e9f5a6b2.mp3',
  ],
  ocean: [
    'https://cdn.pixabay.com/download/audio/2022/06/07/audio_2f2c28d5e9.mp3',
    'https://cdn.pixabay.com/download/audio/2024/02/20/audio_e9f6a7b3c4.mp3',
  ],
  forest: [
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_b9bd5034af.mp3',
    'https://cdn.pixabay.com/download/audio/2024/03/12/audio_f1a8b9c5d6.mp3',
  ],
  storm: [
    'https://cdn.pixabay.com/download/audio/2022/04/15/audio_c4d5e6f7a8.mp3',
    'https://cdn.pixabay.com/download/audio/2024/01/25/audio_g2b9c6d7e8.mp3',
  ],
  wind: [
    'https://cdn.pixabay.com/download/audio/2022/08/20/audio_d5e6f7a8b9.mp3',
  ],
  waterfall: [
    'https://cdn.pixabay.com/download/audio/2022/07/10/audio_e6f7a8b9c1.mp3',
  ],
  night: [
    'https://cdn.pixabay.com/download/audio/2022/03/24/audio_f920224e7b.mp3',
  ],
};

export const EnhancedAudioPlayer = ({ theme, enabled, volume, autoLowerOnActivity }: EnhancedAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLowered, setIsLowered] = useState(false);
  const [targetVolume, setTargetVolume] = useState(volume);

  const tracks = audioScapes[theme] || audioScapes.forest;

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        fadeOut(() => {
          audioRef.current?.pause();
        });
      }
      return;
    }

    const audioUrl = tracks[currentTrackIndex];
    
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.loop = tracks.length === 1;
      audio.volume = 0;
      audioRef.current = audio;
      
      audio.play().then(() => {
        fadeIn();
      }).catch(err => {
        console.error('Audio playback error:', err);
      });

      // Handle track end
      audio.addEventListener('ended', () => {
        if (tracks.length > 1) {
          setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        }
      });
    } else if (audioRef.current.src !== audioUrl) {
      fadeOut(() => {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().then(() => {
            fadeIn();
          });
        }
      });
    }
  }, [theme, enabled, currentTrackIndex, tracks]);

  useEffect(() => {
    setTargetVolume(isLowered ? volume * 0.3 : volume);
  }, [volume, isLowered]);

  useEffect(() => {
    if (audioRef.current && !isTransitioning()) {
      smoothVolumeChange(targetVolume);
    }
  }, [targetVolume]);

  // Listen for typing activity
  useEffect(() => {
    if (!autoLowerOnActivity) return;

    let typingTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      setIsLowered(true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsLowered(false);
      }, 2000);
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(typingTimeout);
    };
  }, [autoLowerOnActivity]);

  const isTransitioning = () => {
    return audioRef.current?.volume !== targetVolume;
  };

  const smoothVolumeChange = (newVolume: number) => {
    if (!audioRef.current) return;

    const currentVolume = audioRef.current.volume;
    const volumeDiff = newVolume - currentVolume;
    const steps = 20;
    const stepSize = volumeDiff / steps;
    let step = 0;

    const volumeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(volumeInterval);
        return;
      }

      step++;
      const nextVolume = currentVolume + (stepSize * step);
      
      if (step >= steps) {
        audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
        clearInterval(volumeInterval);
      } else {
        audioRef.current.volume = Math.max(0, Math.min(1, nextVolume));
      }
    }, 50);
  };

  const fadeIn = () => {
    if (!audioRef.current) return;
    
    const targetVol = targetVolume;
    const fadeStep = targetVol / 30;
    let currentVol = 0;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      
      currentVol += fadeStep;
      if (currentVol >= targetVol) {
        audioRef.current.volume = targetVol;
        clearInterval(fadeInterval);
      } else {
        audioRef.current.volume = currentVol;
      }
    }, 100);
  };

  const fadeOut = (callback?: () => void) => {
    if (!audioRef.current) return;
    
    const currentVol = audioRef.current.volume;
    const fadeStep = currentVol / 30;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      
      const newVol = audioRef.current.volume - fadeStep;
      if (newVol <= 0) {
        audioRef.current.volume = 0;
        clearInterval(fadeInterval);
        if (callback) callback();
      } else {
        audioRef.current.volume = newVol;
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
