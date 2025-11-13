import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RoomList = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRooms(data);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a room name.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        name: newRoomName,
        description: newRoomDescription,
        created_by: user.id,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (roomError) {
      toast({
        title: "Creation Failed",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Add creator as participant
    await supabase.from('room_participants').insert({
      room_id: room.id,
      user_id: user.id,
      role: 'owner',
    });

    toast({
      title: "Room Created",
      description: "Your chat room has been created successfully.",
    });

    setShowCreateDialog(false);
    setNewRoomName("");
    setNewRoomDescription("");
    setIsPrivate(false);
    loadRooms();
    navigate(`/room/${room.id}`);
  };

  const joinRoom = async (roomId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
      });

    if (error) {
      if (error.code === '23505') { // Already a participant
        navigate(`/room/${roomId}`);
      } else {
        toast({
          title: "Join Failed",
          description: "Failed to join room. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat Rooms</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="What's this room about?"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="private">Private Room</Label>
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
              <Button onClick={createRoom} className="w-full">
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search rooms..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{room.name}</span>
                {room.is_private ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>{room.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => joinRoom(room.id)}
                variant="outline"
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Room
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
