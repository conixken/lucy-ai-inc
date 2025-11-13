import { useEffect, useRef, useState } from 'react';

interface EnhancedBackgroundVideoProps {
  theme: string;
  isPaused: boolean;
  isMuted: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// Ultra-realistic 4K HDR video sources
const ultraRealisticVideos: Record<string, string[]> = {
  nature: [
    'https://cdn.pixabay.com/video/2024/01/15/197134_large.mp4',
    'https://cdn.pixabay.com/video/2023/12/10/192819_large.mp4',
  ],
  rain: [
    'https://cdn.pixabay.com/video/2024/02/20/201116_large.mp4',
    'https://cdn.pixabay.com/video/2023/11/28/191345_large.mp4',
  ],
  ocean: [
    'https://cdn.pixabay.com/video/2024/01/08/196205_large.mp4',
    'https://cdn.pixabay.com/video/2023/10/15/184567_large.mp4',
  ],
  forest: [
    'https://cdn.pixabay.com/video/2024/03/12/205678_large.mp4',
    'https://cdn.pixabay.com/video/2023/09/20/180234_large.mp4',
  ],
  mountains: [
    'https://cdn.pixabay.com/video/2024/02/05/199876_large.mp4',
    'https://cdn.pixabay.com/video/2023/12/01/191678_large.mp4',
  ],
  waterfall: [
    'https://cdn.pixabay.com/video/2024/01/20/197890_large.mp4',
    'https://cdn.pixabay.com/video/2023/11/10/189456_large.mp4',
  ],
  sunset: [
    'https://cdn.pixabay.com/video/2024/03/01/203456_large.mp4',
    'https://cdn.pixabay.com/video/2023/10/25/185678_large.mp4',
  ],
  aurora: [
    'https://cdn.pixabay.com/video/2024/02/15/200789_large.mp4',
    'https://cdn.pixabay.com/video/2023/12/20/193456_large.mp4',
  ],
  storm: [
    'https://cdn.pixabay.com/video/2024/01/25/198234_large.mp4',
    'https://cdn.pixabay.com/video/2023/11/15/190123_large.mp4',
  ],
  snow: [
    'https://cdn.pixabay.com/video/2024/03/05/204567_large.mp4',
    'https://cdn.pixabay.com/video/2023/12/15/192890_large.mp4',
  ],
  beach: [
    'https://cdn.pixabay.com/video/2024/02/10/200123_large.mp4',
    'https://cdn.pixabay.com/video/2023/10/30/186789_large.mp4',
  ],
  night: [
    'https://cdn.pixabay.com/video/2024/01/30/198901_large.mp4',
    'https://cdn.pixabay.com/video/2023/11/25/191234_large.mp4',
  ],
};

export const EnhancedBackgroundVideo = ({ theme, isPaused, isMuted, quality }: EnhancedBackgroundVideoProps) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedVideos] = useState(new Map<string, HTMLVideoElement>());

  const videos = ultraRealisticVideos[theme] || ultraRealisticVideos.nature;

  // Preload videos for smooth transitions
  useEffect(() => {
    videos.forEach((src) => {
      if (!preloadedVideos.has(src)) {
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'auto';
        video.playsInline = true;
        preloadedVideos.set(src, video);
      }
    });
  }, [videos, preloadedVideos]);

  // Initial setup
  useEffect(() => {
    const currentVideo = activeVideo === 1 ? video1Ref.current : video2Ref.current;
    if (!currentVideo) return;

    currentVideo.src = videos[currentVideoIndex];
    currentVideo.play().catch((err) => console.error('Video play error:', err));
  }, []);

  // Handle theme change with smooth transition
  useEffect(() => {
    if (isTransitioning) return;

    const currentVideo = activeVideo === 1 ? video1Ref.current : video2Ref.current;
    const nextVideo = activeVideo === 1 ? video2Ref.current : video1Ref.current;

    if (!currentVideo || !nextVideo) return;

    if (currentVideo.src !== videos[currentVideoIndex]) {
      transitionToNextVideo(videos[currentVideoIndex]);
    }
  }, [theme, currentVideoIndex]);

  // Auto-transition videos every 75-90 seconds
  useEffect(() => {
    if (videos.length <= 1) return;

    const duration = 75000 + Math.random() * 15000; // 75-90 seconds
    const timer = setTimeout(() => {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(nextIndex);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentVideoIndex, videos.length]);

  const transitionToNextVideo = (nextSrc: string) => {
    const currentVideo = activeVideo === 1 ? video1Ref.current : video2Ref.current;
    const nextVideo = activeVideo === 1 ? video2Ref.current : video1Ref.current;

    if (!currentVideo || !nextVideo || isTransitioning) return;

    setIsTransitioning(true);

    nextVideo.src = nextSrc;
    nextVideo.play().then(() => {
      // Fade out current, fade in next
      currentVideo.style.opacity = '0';
      nextVideo.style.opacity = '1';

      setTimeout(() => {
        setActiveVideo(activeVideo === 1 ? 2 : 1);
        setIsTransitioning(false);
        currentVideo.style.opacity = '1';
      }, 1500); // 1.5 second transition
    });
  };

  // Handle play/pause
  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (isPaused) {
      video1?.pause();
      video2?.pause();
    } else {
      const currentVideo = activeVideo === 1 ? video1 : video2;
      currentVideo?.play().catch((err) => console.error('Video play error:', err));
    }
  }, [isPaused, activeVideo]);

  // Handle mute
  useEffect(() => {
    if (video1Ref.current) video1Ref.current.muted = isMuted;
    if (video2Ref.current) video2Ref.current.muted = isMuted;
  }, [isMuted]);

  const getVideoFilter = () => {
    switch (quality) {
      case 'ultra':
        return 'brightness(1.05) contrast(1.15) saturate(1.2)';
      case 'high':
        return 'brightness(1.02) contrast(1.1) saturate(1.15)';
      case 'medium':
        return 'brightness(1.0) contrast(1.05) saturate(1.1)';
      case 'low':
        return 'brightness(0.95) contrast(1.0) saturate(1.0)';
      default:
        return 'none';
    }
  };

  return (
    <>
      <video
        ref={video1Ref}
        className="fixed inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
        style={{
          opacity: activeVideo === 1 ? 1 : 0,
          filter: getVideoFilter(),
          zIndex: 0,
        }}
        loop
        playsInline
        muted={isMuted}
      />
      <video
        ref={video2Ref}
        className="fixed inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
        style={{
          opacity: activeVideo === 2 ? 1 : 0,
          filter: getVideoFilter(),
          zIndex: 0,
        }}
        loop
        playsInline
        muted={isMuted}
      />
      
      {/* Cinematic gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20 pointer-events-none z-[1]" />
      <div className="fixed inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent pointer-events-none z-[1]" />
      
      {/* Subtle vignette */}
      <div className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </>
  );
};
