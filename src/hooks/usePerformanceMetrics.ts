import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  recommendedQuality: 'low' | 'medium' | 'high' | 'ultra';
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    recommendedQuality: 'high'
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationFrame: number;

    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;

      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Get memory usage if available
        const memory = (performance as any).memory;
        const memoryUsage = memory ? memory.usedJSHeapSize / memory.jsHeapSizeLimit : 0;

        // Determine recommended quality based on performance
        let recommendedQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high';
        if (fps < 30 || memoryUsage > 0.8) recommendedQuality = 'low';
        else if (fps < 45 || memoryUsage > 0.6) recommendedQuality = 'medium';
        else if (fps >= 55 && memoryUsage < 0.4) recommendedQuality = 'ultra';

        setMetrics({ fps, memoryUsage, recommendedQuality });

        // Log metrics periodically
        logMetrics(fps, memoryUsage, recommendedQuality);
      }

      animationFrame = requestAnimationFrame(measurePerformance);
    };

    animationFrame = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  const logMetrics = async (fps: number, memoryUsage: number, quality: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('performance_metrics' as any).insert({
      user_id: user.id,
      fps_average: fps,
      memory_usage: memoryUsage,
      recommended_quality: quality,
      device_info: {
        userAgent: navigator.userAgent,
        screen: { width: window.screen.width, height: window.screen.height },
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  };

  return metrics;
};
