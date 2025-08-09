/**
 * Type definitions for the Music Player component system
 */

// YouTube Player API types
export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayerState?: () => number; // optional: some typings omit this, but YT API provides it
  destroy?: () => void; // optional in our typing for safety
  getIframe?: () => HTMLIFrameElement; // optional helper to verify DOM attachment
}

export interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId: string;
  playerVars: Record<string, unknown>;
  events: {
    onReady?: () => void;
    onStateChange?: (event: unknown) => void;
  };
}

export interface YouTubeAPI {
  Player: new (elementId: string, config: YouTubePlayerConfig) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
  };
}

// Global window types
declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
    __ytMusicPlayer?: YouTubePlayer; // singleton instance cache
    __ytMusicPlayer_onStateChange?: (isPlaying: boolean) => void;
    __ytMusicPlayer_onReady?: () => void;
    __ytVinylRotationPaused?: number; // persists last rotation angle across remounts
    __ytProgressAnimatedOnce?: boolean; // track if initial progress animation ran
    __ytProgressPercent?: number; // last known progress percentage
    __ytDuration?: number; // last known duration
    __ytCurrentTime?: number; // last known current time
    __ytIsPlaying?: boolean; // last known playing state
  }
}

// Song configuration types
export interface SongConfig {
  title: string;
  artist: string;
  youtubeUrl: string;
  videoId: string;
}

// Component prop types
export interface MediaControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export interface VinylDiskProps {
  isPlaying: boolean;
  progressPercentage: number;
  animateOnMount?: boolean;
}

export interface VinylDiskRef {
  resetRotation: () => void;
}

export interface ProgressIndicatorProps {
  progressPercentage: number;
  radius: number;
  animateOnMount?: boolean;
}

// Player state types
export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  progressPercentage: number;
}

// Hook return types
export interface UseYouTubePlayerReturn {
  playerRef: React.RefObject<YouTubePlayer | null>;
  isPlayerReady: boolean;
  initializePlayer: () => void;
}

export interface UseProgressTrackingReturn {
  startProgressTracking: () => void;
  stopProgressTracking: () => void;
  updateProgress: () => void;
}
