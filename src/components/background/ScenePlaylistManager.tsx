import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ListVideo, Plus, Trash2 } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string;
  mood: string;
  scenes: any[];
}

interface ScenePlaylistManagerProps {
  userId: string;
  onSelectPlaylist: (playlistId: string) => void;
}

export const ScenePlaylistManager = ({ userId, onSelectPlaylist }: ScenePlaylistManagerProps) => {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', mood: 'relaxing' });
  const { toast } = useToast();

  useEffect(() => {
    loadPlaylists();
  }, [userId]);

  const loadPlaylists = async () => {
    const { data, error } = await supabase
      .from('scene_playlists' as any)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading playlists:', error);
      return;
    }

    setPlaylists((data as any) || []);
  };

  const createPlaylist = async () => {
    if (!newPlaylist.name) {
      toast({ title: 'Please enter a playlist name', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('scene_playlists' as any)
      .insert({
        user_id: userId,
        ...newPlaylist,
        scenes: []
      });

    if (error) {
      toast({ title: 'Error creating playlist', variant: 'destructive' });
      return;
    }

    toast({ title: 'Playlist created successfully' });
    setNewPlaylist({ name: '', description: '', mood: 'relaxing' });
    loadPlaylists();
  };

  const deletePlaylist = async (playlistId: string) => {
    const { error } = await supabase
      .from('scene_playlists' as any)
      .delete()
      .eq('id', playlistId);

    if (error) {
      toast({ title: 'Error deleting playlist', variant: 'destructive' });
      return;
    }

    toast({ title: 'Playlist deleted' });
    loadPlaylists();
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="bg-background/10 backdrop-blur-md border-border/20 hover:bg-background/20"
      >
        <ListVideo className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scene Playlists</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Create New Playlist</Label>
              <Input
                placeholder="Playlist name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
              />
              <Select
                value={newPlaylist.mood}
                onValueChange={(value) => setNewPlaylist({ ...newPlaylist, mood: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxing">Relaxing</SelectItem>
                  <SelectItem value="energizing">Energizing</SelectItem>
                  <SelectItem value="focused">Focused</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createPlaylist} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Your Playlists</Label>
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">{playlist.description}</p>
                    <p className="text-xs text-muted-foreground">Mood: {playlist.mood}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onSelectPlaylist(playlist.id);
                        setOpen(false);
                      }}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
