import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomVideoManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoSelect: (videoPath: string) => void;
}

export const CustomVideoManager = ({ open, onOpenChange, onVideoSelect }: CustomVideoManagerProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadVideos();
    }
  }, [open]);

  const loadVideos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('custom_backgrounds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVideos(data);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video must be under 50MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('custom-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('custom-videos')
        .getPublicUrl(filePath);

      await supabase.from('custom_backgrounds').insert({
        user_id: user.id,
        video_name: file.name,
        video_path: publicUrl,
        theme_category: 'custom',
      });

      toast({
        title: "Upload Complete",
        description: "Video has been uploaded successfully.",
      });

      loadVideos();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (video: any) => {
    try {
      await supabase.from('custom_backgrounds').delete().eq('id', video.id);
      
      const filePath = video.video_path.split('/').slice(-2).join('/');
      await supabase.storage.from('custom-videos').remove([filePath]);

      toast({
        title: "Video Deleted",
        description: "Video has been removed.",
      });

      loadVideos();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete video.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Custom Background Videos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-upload">Upload New Video</Label>
            <div className="flex gap-2">
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Max 50MB, MP4 format recommended</p>
          </div>

          <div className="grid gap-3 max-h-[400px] overflow-y-auto">
            {videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No custom videos yet. Upload one to get started!
              </div>
            ) : (
              videos.map((video) => (
                <Card key={video.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.video_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onVideoSelect(video.video_path);
                        onOpenChange(false);
                      }}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteVideo(video)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
