/**
 * MusicPlayer - A comprehensive music player component system
 *
 * Features:
 * - Spinning vinyl disk with progress indicator
 * - YouTube video integration with audio playback
 * - Full media controls (play/pause, restart, volume)
 * - Real-time progress tracking
 * - Animated volume slider
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * import { MusicPlayer } from '@/components/MusicPlayer';
 *
 * export default function Layout() {
 *   return (
 *     <div>
 *       <MusicPlayer />
 *     </div>
 *   );
 * }
 * ```
 */

export { MusicPlayer } from "./MusicPlayer";

// Re-export types for external usage
export type {
  MediaControlsProps,
  PlayerState,
  SongConfig,
  VinylDiskProps,
  VinylDiskRef,
} from "./types";

// Re-export configuration for external customization
export { CURRENT_SONG, PLAYER_CONFIG } from "./config";
export { ANIMATIONS, COLORS, ICONS, LAYOUT } from "./constants";
