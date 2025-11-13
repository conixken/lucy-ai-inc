# Lucy AI Ultra-Realistic Background System

## Overview
Lucy AI features a cutting-edge, ultra-realistic 4K HDR background system with cinematic nature and weather scenes, advanced environmental effects, adaptive audio, and AI-powered enhancements.

## Key Features

### 1. Ultra-Realistic Video Backgrounds
- **Quality**: 4K HDR footage with cinematic color grading
- **Themes**: Nature, rain, ocean, forest, mountains, waterfalls, sunsets, auroras, storms, snow, beach, night
- **Enhancement**: Automatic brightness, contrast, saturation, and temperature adjustments
- **Transitions**: Smooth 1.5-second fade transitions between clips with color matching
- **Adaptive Quality**: Automatically adjusts between low/medium/high/ultra based on device performance

### 2. Environmental Effects
Dynamic particle and atmospheric effects that match the scene:
- **Rain**: Realistic raindrops with proper physics
- **Mist**: Soft, volumetric fog clouds
- **Leaves**: Drifting autumn leaves in forest scenes
- **Ripples**: Expanding water ripples for ocean/beach scenes
- **Snow**: Gentle snowfall with wind drift
- **Particles**: Generic particles for other effects

### 3. Parallax & Motion
- **Parallax Layers**: Mouse-based depth parallax for 3D-like movement
- **Camera Motion**: Subtle simulated camera drift and zoom
- **Activity Sync**: Background responds to chat activity with pulsing and movement
- **Configurable**: Adjustable intensity from 0-100%

### 4. Enhanced Audio System
- **High-Quality Soundscapes**: Natural ambient audio synced to video theme
- **Multi-Track**: Multiple audio files per theme that crossfade
- **Auto-Lowering**: Volume automatically reduces during typing/activity
- **Smooth Transitions**: Fade in/out between tracks
- **Volume Control**: Adjustable from 0-100%

### 5. Performance Optimization
- **Adaptive Resolution**: Automatically adjusts video quality based on FPS and memory
- **Preloading**: Next videos preloaded for instant transitions
- **Lazy Loading**: Effects only render when enabled
- **Performance Monitor**: Real-time FPS, memory usage, and quality recommendations
- **Metrics Logging**: Tracks performance data for optimization

### 6. AI-Powered Features
- **Scene Suggestions**: AI analyzes chat context to recommend appropriate scenes
- **AI Scene Generation**: Generate custom ultra-realistic scene descriptions
- **Video Scene Generation**: AI-powered scene creation with cinematic descriptions
- **Mood-Based Playlists**: Create custom playlists organized by mood

### 7. Interactive Sync
Background responds to chat activity:
- **Typing Glow**: Subtle purple glow from bottom during typing
- **Message Ripple**: Expanding ripple effect when new messages arrive
- **Parallax Boost**: Increased parallax movement during active chat
- **Activity Levels**: Idle → Low → Medium → High

## Usage

### Basic Setup
The background system is already integrated into the Chat page. All features are automatically active.

### User Controls
Users can control the background via:
1. **Video Controls** (top of sidebar):
   - Play/Pause video
   - Mute/Unmute video
   - Change theme (12 options)

2. **Background Settings Dialog** (gear icon):
   - Enable/disable ambient audio
   - Adjust audio volume
   - Toggle environmental effects
   - Adjust parallax intensity

3. **Scene Playlist Manager** (playlist icon):
   - Create custom mood-based playlists
   - Save favorite scenes
   - Quick-switch between playlists

### Developer Integration

#### Trigger Background Activity in Components
```typescript
import { useLucyActivityTrigger } from '@/hooks/useLucyActivityTrigger';

function MyComponent() {
  const { triggerTyping, triggerNewMessage } = useLucyActivityTrigger();

  // When user starts typing
  const handleKeyDown = () => {
    triggerTyping(true);
  };

  // When user stops typing
  const handleBlur = () => {
    triggerTyping(false);
  };

  // When a new message is sent/received
  const handleNewMessage = () => {
    triggerNewMessage();
  };

  return (
    <input
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
```

#### Auto-sync Typing Activity
```typescript
import { useTypingActivitySync } from '@/hooks/useLucyActivityTrigger';

function ChatInput() {
  const [isTyping, setIsTyping] = useState(false);
  
  // Automatically syncs typing state with background
  useTypingActivitySync(isTyping);

  return <textarea onChange={(e) => setIsTyping(e.target.value.length > 0)} />;
}
```

#### Auto-sync Message Activity
```typescript
import { useMessageActivitySync } from '@/hooks/useLucyActivityTrigger';

function ChatMessages({ messages }) {
  // Automatically triggers ripple effect when message count increases
  useMessageActivitySync(messages.length);

  return <div>{messages.map(msg => <Message key={msg.id} {...msg} />)}</div>;
}
```

## Components

### Core Components
- `UltraRealisticBackgroundManager`: Main coordinator
- `EnhancedBackgroundVideo`: 4K HDR video player with transitions
- `EnvironmentalEffects`: Particle and atmospheric effects
- `EnhancedAudioPlayer`: Multi-track ambient audio system
- `ChatActivityOverlay`: Interactive sync effects
- `ParallaxLayer`: Parallax and motion wrapper

### UI Components
- `VideoControls`: Play, mute, theme selection
- `BackgroundSettingsDialog`: Audio, effects, parallax settings
- `ScenePlaylistManager`: Playlist creation and management
- `PerformanceMonitor`: Real-time performance display

## Database Tables

### scene_preferences
Stores user scene preferences:
- `auto_theme_enabled`: Enable time-based themes
- `geolocation_enabled`: Use location for theme suggestions
- `favorite_scenes`: User's saved favorite scenes
- `parallax_intensity`: Parallax strength (0-1)
- `transition_duration`: Video transition time in ms

### scene_playlists
Custom user-created playlists:
- `name`: Playlist name
- `mood`: relaxing, energizing, focused, creative
- `scenes`: Array of scene configurations

### ai_generated_scenes
AI-generated scene recommendations:
- `prompt`: User's generation prompt
- `mood_tags`: Associated mood keywords
- `scene_data`: Full scene configuration and description

### performance_metrics
Performance tracking data:
- `fps_average`: Measured frames per second
- `memory_usage`: Memory consumption percentage
- `recommended_quality`: Suggested quality level
- `device_info`: Device and browser information

## Edge Functions

### generate-ai-scene
Generate AI-powered scene descriptions and recommendations.
```typescript
const { data } = await supabase.functions.invoke('generate-ai-scene', {
  body: { 
    prompt: 'peaceful mountain sunset',
    moodTags: ['relaxing', 'sunset'],
    userId: user.id
  }
});
```

### suggest-scene
AI analyzes chat context to suggest appropriate scene.
```typescript
const { data } = await supabase.functions.invoke('suggest-scene', {
  body: { 
    chatContext: 'User discussing work stress',
    currentMood: 'tense'
  }
});
// Returns: { suggestedScene: 'ocean' }
```

### generate-video-scene
Generate ultra-realistic cinematic scene descriptions.
```typescript
const { data } = await supabase.functions.invoke('generate-video-scene', {
  body: { 
    sceneType: 'waterfall',
    mood: 'peaceful',
    timeOfDay: 'golden hour',
    weatherCondition: 'clear',
    userId: user.id
  }
});
```

## Performance Guidelines

### Recommended Settings by Device
- **High-End Desktop**: Ultra quality, all effects enabled, parallax 100%
- **Mid-Range Desktop**: High quality, all effects enabled, parallax 75%
- **Low-End Desktop**: Medium quality, reduced effects, parallax 50%
- **High-End Mobile**: Medium quality, essential effects only, parallax 25%
- **Low-End Mobile**: Low quality, minimal effects, parallax 0%

### Optimization Tips
1. Disable environmental effects on low-performance devices
2. Reduce parallax intensity if FPS drops below 30
3. Lower audio quality/disable if experiencing lag
4. Use lower video quality if memory usage exceeds 80%
5. The system automatically handles most optimizations

## Browser Support
- **Recommended**: Chrome 90+, Edge 90+, Safari 15+, Firefox 88+
- **Video**: All modern browsers with HTML5 video support
- **Audio**: Web Audio API required
- **Canvas**: 2D context required for effects
- **Performance**: RequestAnimationFrame API required

## Accessibility
- All video controls are keyboard accessible
- ARIA labels on all interactive elements
- Audio auto-lowers to not interfere with screen readers
- Visual effects can be fully disabled
- Respects prefers-reduced-motion when available

## Future Enhancements
- [ ] Weather API integration for real-time weather-matching scenes
- [ ] Time zone detection for automatic day/night themes
- [ ] WebGL shader effects for more advanced visuals
- [ ] VR/360° video support
- [ ] User-uploaded custom video backgrounds
- [ ] AI video generation (text-to-video)
- [ ] Binaural beats and ASMR audio options
- [ ] Scene scheduling (different scenes at different times)
- [ ] Community scene sharing

## Troubleshooting

### Videos Not Loading
- Check network connection
- Verify video URLs are accessible
- Clear browser cache
- Try different browser

### Poor Performance
- Open Performance Monitor (bottom-right)
- Check FPS and memory usage
- Lower quality settings
- Disable environmental effects
- Reduce parallax intensity

### Audio Not Playing
- Check browser audio permissions
- Unmute the video player
- Enable audio in Background Settings
- Check system volume

### Effects Not Showing
- Ensure effects are enabled in settings
- Check browser console for errors
- Verify canvas support in browser
- Try disabling browser extensions

## License
Part of Lucy AI - MIT License
