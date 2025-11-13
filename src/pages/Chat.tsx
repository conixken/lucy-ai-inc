import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { BackgroundVideo } from "@/components/background/BackgroundVideo";
import { VideoControls } from "@/components/background/VideoControls";
import { ParticleOverlay } from "@/components/particles/ParticleOverlay";
import { SoundscapePlayer } from "@/components/soundscape/SoundscapePlayer";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Background video state
  const [videoTheme, setVideoTheme] = useState('nature');
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(false);
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.5);

  // Load preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('lucy-bg-theme');
    const savedMuted = localStorage.getItem('lucy-bg-muted');
    const savedParticles = localStorage.getItem('lucy-particles');
    const savedSoundscape = localStorage.getItem('lucy-soundscape');
    const savedVolume = localStorage.getItem('lucy-soundscape-volume');
    if (savedTheme) setVideoTheme(savedTheme);
    if (savedMuted) setIsVideoMuted(savedMuted === 'true');
    if (savedParticles) setParticlesEnabled(savedParticles === 'true');
    if (savedSoundscape) setSoundscapeEnabled(savedSoundscape === 'true');
    if (savedVolume) setSoundscapeVolume(parseFloat(savedVolume));
  }, []);

  const handleThemeChange = (theme: string) => {
    setVideoTheme(theme);
    localStorage.setItem('lucy-bg-theme', theme);
  };

  const toggleVideoPause = () => {
    setIsVideoPaused(!isVideoPaused);
  };

  const toggleVideoMute = () => {
    const newMuted = !isVideoMuted;
    setIsVideoMuted(newMuted);
    localStorage.setItem('lucy-bg-muted', String(newMuted));
  };

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full animate-neural-pulse mx-auto" />
          <p className="text-muted-foreground">Loading Lucy AI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackgroundVideo 
        theme={videoTheme}
        isPaused={isVideoPaused}
        isMuted={isVideoMuted}
      />
      <ParticleOverlay theme={videoTheme} enabled={particlesEnabled} />
      <SoundscapePlayer theme={videoTheme} enabled={soundscapeEnabled} volume={soundscapeVolume} />
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative">
          <ChatSidebar 
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
            videoControls={
              <VideoControls
                isPaused={isVideoPaused}
                isMuted={isVideoMuted}
                currentTheme={videoTheme}
                onTogglePause={toggleVideoPause}
                onToggleMute={toggleVideoMute}
                onChangeTheme={handleThemeChange}
              />
            }
          />
          <ChatInterface 
            userId={user?.id}
            conversationId={currentConversationId}
            onConversationCreated={setCurrentConversationId}
          />
        </div>
      </SidebarProvider>
    </>
  );
};

export default Chat;
