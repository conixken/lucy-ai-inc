-- Custom video backgrounds table
CREATE TABLE public.custom_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_name TEXT NOT NULL,
  video_path TEXT NOT NULL,
  thumbnail_url TEXT,
  theme_category TEXT NOT NULL DEFAULT 'custom',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom backgrounds"
  ON public.custom_backgrounds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom backgrounds"
  ON public.custom_backgrounds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom backgrounds"
  ON public.custom_backgrounds FOR DELETE
  USING (auth.uid() = user_id);

-- Shared conversations table
CREATE TABLE public.shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  share_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create shares for their conversations"
  ON public.shared_conversations FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own shares"
  ON public.shared_conversations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view public shares"
  ON public.shared_conversations FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can delete their own shares"
  ON public.shared_conversations FOR DELETE
  USING (auth.uid() = created_by);

-- Chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  max_participants INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Room participants table (create BEFORE policies that reference it)
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Now enable RLS and create policies for chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_private = false OR EXISTS (
    SELECT 1 FROM room_participants 
    WHERE room_id = chat_rooms.id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON public.chat_rooms FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms"
  ON public.chat_rooms FOR DELETE
  USING (auth.uid() = created_by);

-- Enable RLS for room_participants
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in rooms they're in"
  ON public.room_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM room_participants rp
    WHERE rp.room_id = room_participants.room_id AND rp.user_id = auth.uid()
  ));

CREATE POLICY "Users can join public rooms"
  ON public.room_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM chat_rooms WHERE id = room_id AND is_private = false)
  );

CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Room messages table
CREATE TABLE public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view messages"
  ON public.room_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM room_participants 
    WHERE room_id = room_messages.room_id AND user_id = auth.uid()
  ));

CREATE POLICY "Room participants can send messages"
  ON public.room_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_participants 
      WHERE room_id = room_messages.room_id AND user_id = auth.uid()
    )
  );

-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Enable realtime for room messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;

-- Create indexes for performance
CREATE INDEX idx_custom_backgrounds_user_id ON public.custom_backgrounds(user_id);
CREATE INDEX idx_shared_conversations_token ON public.shared_conversations(share_token);
CREATE INDEX idx_shared_conversations_conversation_id ON public.shared_conversations(conversation_id);
CREATE INDEX idx_chat_rooms_is_private ON public.chat_rooms(is_private);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX idx_room_messages_room_id ON public.room_messages(room_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Add storage bucket for custom videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom-videos', 'custom-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for custom videos
CREATE POLICY "Users can upload their own videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'custom-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'custom-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'custom-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );