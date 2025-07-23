# MusicPlayer Component System

A modular, production-ready music player component system built with React, TypeScript, and Framer Motion. Features YouTube video integration, vinyl-style UI, and comprehensive media controls.

## 🎵 Features

- **Spinning Vinyl Disk**: Animated vinyl record with real album artwork
- **Circular Progress Indicator**: Shows song playback progress around the vinyl
- **Full Media Controls**: Play/pause, restart, and volume controls
- **YouTube Integration**: Seamless audio playback from YouTube videos
- **Animated Volume Slider**: Elegant line-based volume control
- **Real-time Progress Tracking**: Updates every second during playback
- **TypeScript Support**: Fully typed with comprehensive type definitions
- **Responsive Design**: Works on all screen sizes

## 📁 Project Structure

```
MusicPlayer/
├── index.ts                    # Main export file
├── MusicPlayer.tsx            # Main component orchestrator
├── types.ts                   # TypeScript type definitions
├── config.ts                  # Song and player configuration
├── constants.ts               # UI constants and styling
├── hooks.ts                   # Custom React hooks
└── components/                # Individual UI components
    ├── index.ts               # Component exports
    ├── ProgressIndicator.tsx  # Circular progress ring
    ├── VinylDisk.tsx         # Spinning vinyl with grooves
    ├── ControlButtons.tsx     # Play/pause/restart/volume buttons
    ├── VolumeSlider.tsx      # Animated volume control
    ├── MediaControls.tsx     # Main controls container
    └── SongInfo.tsx          # Song title and artist display
```

## 🚀 Usage

### Basic Usage

```tsx
import { MusicPlayer } from "@/components/MusicPlayer";

export default function Layout() {
  return (
    <div>
      <MusicPlayer />
    </div>
  );
}
```

### Customizing the Song

Update the song configuration in `config.ts`:

```tsx
export const CURRENT_SONG: SongConfig = {
  title: "Your Song Title",
  artist: "Artist Name",
  youtubeUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
  get videoId() {
    // Auto-extracts video ID from URL
    const match = this.youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : "";
  },
};
```

### Customizing Styling

Modify constants in `constants.ts`:

```tsx
export const COLORS = {
  progressBackground: "rgba(255, 255, 255, 0.4)",
  progressForeground: "rgba(255, 255, 255, 0.7)",
  // ... other color settings
};

export const ANIMATIONS = {
  vinylRotation: {
    duration: 200, // seconds for full rotation
    ease: "linear",
  },
  // ... other animation settings
};
```

## 🔧 Technical Details

### Component Architecture

- **Separation of Concerns**: Each component has a single responsibility
- **Custom Hooks**: Logic separated into reusable hooks
- **Type Safety**: Comprehensive TypeScript definitions
- **Performance**: Memoized components to prevent unnecessary re-renders
- **Error Handling**: Graceful fallbacks for API failures

### State Management

The player uses a centralized state management pattern with custom hooks:

- `useYouTubePlayer`: Manages YouTube API integration
- `useProgressTracking`: Handles real-time progress updates
- `usePlayerState`: Centralizes all player state

### Key Features

1. **Vinyl Animation**: Uses Framer Motion for smooth rotation with pause/resume
2. **Progress Tracking**: SVG-based circular progress with stroke animation
3. **Volume Control**: Drag-based slider with visual feedback
4. **YouTube Integration**: Hidden player with full API access
5. **Responsive Design**: Adapts to different screen sizes

## 🎨 Styling System

The component uses a systematic approach to styling:

- **Constants**: All colors, sizes, and animations centralized
- **Responsive**: Tailwind classes for different screen sizes
- **Animations**: Framer Motion for smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard support

## 🔄 Migration from SongOfTheMonth

The new MusicPlayer is a drop-in replacement for the original SongOfTheMonth component:

- Same external API and positioning
- Enhanced modularity and maintainability
- Better type safety and error handling
- More customizable and extensible

## 🛠️ Development

### Adding New Features

1. Create new component in `components/` directory
2. Export from `components/index.ts`
3. Add types to `types.ts`
4. Update constants if needed
5. Integrate into main `MusicPlayer.tsx`

### Customization Points

- **Song Configuration**: `config.ts`
- **Visual Styling**: `constants.ts`
- **Component Behavior**: Individual component files
- **API Integration**: `hooks.ts`

## 📱 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires user interaction for autoplay)
- Mobile: Responsive design, touch-friendly controls

## 🔒 Type Safety

All components are fully typed with:

- Props interfaces
- State type definitions
- Hook return types
- YouTube API types
- Configuration types

This ensures compile-time safety and excellent IDE support.
