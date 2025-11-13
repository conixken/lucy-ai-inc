import { useEffect } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface PerformanceMonitorProps {
  onQualityChange: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
}

export const PerformanceMonitor = ({ onQualityChange }: PerformanceMonitorProps) => {
  const metrics = usePerformanceMetrics();

  // Auto-adjust quality based on performance
  useEffect(() => {
    onQualityChange(metrics.recommendedQuality);
  }, [metrics.recommendedQuality, onQualityChange]);

  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-lg border border-border/20 text-xs space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-3 w-3" />
        <span className="font-medium">Performance</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">FPS:</span>
          <span className="font-mono">{metrics.fps.toFixed(0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Memory:</span>
          <span className="font-mono">{(metrics.memoryUsage * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Quality:</span>
          <Badge variant="outline" className="text-xs">
            {metrics.recommendedQuality}
          </Badge>
        </div>
      </div>
    </div>
  );
};
