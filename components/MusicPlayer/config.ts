/**
 * Configuration for the music player
 */

import type { SongConfig } from "./types";

// Current song configuration - easily replaceable
export const CURRENT_SONG: SongConfig = {
  title: "Ma Meilleure Ennemie",
  artist: "Stromae, Pomme",
  youtubeUrl: "https://www.youtube.com/watch?v=j-RpvIuazmc",
  get videoId() {
    const match = this.youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : "";
  },
};

// Player configuration
export const PLAYER_CONFIG = {
  defaultVolume: 50,
  progressUpdateInterval: 16, // ms
  vinylRotationDuration: 200, // seconds for full rotation cycle
  vinylRotationDegrees: 3600, // degrees (10 full rotations)
  playerId: "youtube-player-music-player",
  youtubeApiUrl: "https://www.youtube.com/iframe_api",
} as const;

// YouTube player parameters
export const YOUTUBE_PLAYER_VARS = {
  autoplay: 0,
  controls: 0,
  showinfo: 0,
  rel: 0,
  loop: 1,
} as const;
