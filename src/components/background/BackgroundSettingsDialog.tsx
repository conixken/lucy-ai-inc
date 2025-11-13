import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface BackgroundSettingsDialogProps {
  audioEnabled: boolean;
  audioVolume: number;
  effectsEnabled: boolean;
  parallaxIntensity: number;
  onAudioEnabledChange: (enabled: boolean) => void;
  onAudioVolumeChange: (volume: number) => void;
  onEffectsEnabledChange: (enabled: boolean) => void;
  onParallaxIntensityChange: (intensity: number) => void;
}

export const BackgroundSettingsDialog = ({
  audioEnabled,
  audioVolume,
  effectsEnabled,
  parallaxIntensity,
  onAudioEnabledChange,
  onAudioVolumeChange,
  onEffectsEnabledChange,
  onParallaxIntensityChange,
}: BackgroundSettingsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/10 backdrop-blur-md border-border/20 hover:bg-background/20"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Background Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ambient Audio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-enabled">Ambient Audio</Label>
              <Switch
                id="audio-enabled"
                checked={audioEnabled}
                onCheckedChange={onAudioEnabledChange}
              />
            </div>
            {audioEnabled && (
              <div className="space-y-2">
                <Label>Volume: {Math.round(audioVolume * 100)}%</Label>
                <Slider
                  value={[audioVolume]}
                  onValueChange={([value]) => onAudioVolumeChange(value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Audio automatically lowers during typing
                </p>
              </div>
            )}
          </div>

          {/* Environmental Effects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="effects-enabled">Environmental Effects</Label>
              <Switch
                id="effects-enabled"
                checked={effectsEnabled}
                onCheckedChange={onEffectsEnabledChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Adds rain, mist, leaves, and other atmospheric effects
            </p>
          </div>

          {/* Parallax Intensity */}
          <div className="space-y-3">
            <Label>Parallax Intensity: {Math.round(parallaxIntensity * 100)}%</Label>
            <Slider
              value={[parallaxIntensity]}
              onValueChange={([value]) => onParallaxIntensityChange(value)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls depth and motion effects
            </p>
          </div>

          {/* Quality Info */}
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-sm font-medium">Performance</p>
            <p className="text-xs text-muted-foreground">
              Video quality automatically adjusts based on device performance
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
