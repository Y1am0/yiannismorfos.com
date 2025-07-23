/**
 * Custom hooks for the Music Player system
 */

import { useNavigationActions } from "@/components/navigation/stores";
import { NavigationItemId } from "@/components/navigation/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { CURRENT_SONG, PLAYER_CONFIG, YOUTUBE_PLAYER_VARS } from "./config";
import type {
  PlayerState,
  UseProgressTrackingReturn,
  UseYouTubePlayerReturn,
  YouTubePlayer,
} from "./types";

/**
 * Hook for managing YouTube player instance and initialization
 */
export const useYouTubePlayer = (
  playerId: string,
  onStateChange?: (isPlaying: boolean) => void,
  onReady?: () => void
): UseYouTubePlayerReturn => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const initializePlayer = useCallback(() => {
    if (typeof window === "undefined" || !window.YT) return;
    if (playerRef.current) return; // Don't recreate if already exists

    playerRef.current = new window.YT.Player(playerId, {
      height: "0",
      width: "0",
      videoId: CURRENT_SONG.videoId,
      playerVars: {
        ...YOUTUBE_PLAYER_VARS,
        playlist: CURRENT_SONG.videoId,
      },
      events: {
        onReady: () => {
          console.log("YouTube player ready");
          setIsPlayerReady(true);

          // Set initial volume
          if (playerRef.current) {
            playerRef.current.setVolume(PLAYER_CONFIG.defaultVolume);
          }

          onReady?.();
        },
        onStateChange: (event: unknown) => {
          const YT = window.YT;
          const eventData = event as { data: number };

          if (eventData.data === YT.PlayerState.PLAYING) {
            onStateChange?.(true);
          } else if (
            eventData.data === YT.PlayerState.PAUSED ||
            eventData.data === YT.PlayerState.ENDED
          ) {
            onStateChange?.(false);
          }
        },
      },
    });
  }, [playerId, onStateChange, onReady]);

  // Load YouTube API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (typeof window !== "undefined" && window.YT) {
      initializePlayer();
      return;
    }

    // Load YouTube API script
    const script = document.createElement("script");
    script.src = PLAYER_CONFIG.youtubeApiUrl;
    script.async = true;
    document.body.appendChild(script);

    // Set up global callback for when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [initializePlayer]);

  return {
    playerRef,
    isPlayerReady,
    initializePlayer,
  };
};

/**
 * Hook for managing progress tracking
 */
export const useProgressTracking = (
  playerRef: React.RefObject<YouTubePlayer | null>,
  onProgressUpdate: (
    currentTime: number,
    duration: number,
    percentage: number
  ) => void
): UseProgressTrackingReturn => {
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateProgress = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const current = playerRef.current.getCurrentTime();
      const total = playerRef.current.getDuration();

      if (total > 0) {
        const percentage = (current / total) * 100;
        onProgressUpdate(
          current,
          total,
          Math.min(100, Math.max(0, percentage))
        );
      }
    } catch (error) {
      console.error("Error getting YouTube player progress:", error);
    }
  }, [playerRef, onProgressUpdate]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(
      updateProgress,
      PLAYER_CONFIG.progressUpdateInterval
    );
  }, [updateProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  return {
    startProgressTracking,
    stopProgressTracking,
    updateProgress,
  };
};

/**
 * Hook for managing overall player state
 */
export const usePlayerState = () => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    volume: PLAYER_CONFIG.defaultVolume,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    progressPercentage: 0,
  });

  const updatePlayerState = useCallback((updates: Partial<PlayerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleProgressUpdate = useCallback(
    (currentTime: number, duration: number, percentage: number) => {
      updatePlayerState({
        currentTime,
        duration,
        progressPercentage: percentage,
      });
    },
    [updatePlayerState]
  );

  return {
    state,
    updatePlayerState,
    handleProgressUpdate,
  };
};

/**
 * Hook for Music Player Button Integration
 *
 * Provides navigation system integration for individual music player buttons.
 * Use this hook in button components to register with the glass pill system.
 * Automatically handles both mobile and desktop registration.
 */
export const useMusicPlayerButton = (
  buttonId: NavigationItemId,
  buttonRef: React.RefObject<HTMLElement | null>
) => {
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    handleMobileElementMount,
  } = useNavigationActions();

  // Register element on mount for both desktop and mobile
  useEffect(() => {
    if (buttonRef.current) {
      // Register for desktop
      handleElementMount(buttonId, buttonRef.current);
      // Also register for mobile
      handleMobileElementMount(buttonId, buttonRef.current);
    }
  }, [buttonId, handleElementMount, handleMobileElementMount, buttonRef]);

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    if (buttonRef.current) {
      handleHoverStart(buttonId, buttonRef.current);
    }
  }, [handleHoverStart, buttonId, buttonRef]);

  // Memoized hover end handler
  const handleHoverEndCallback = useCallback(() => {
    handleHoverEnd();
  }, [handleHoverEnd]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown(buttonId);
  }, [handleMouseDown, buttonId]);

  return {
    onMouseEnter: handleHoverStartCallback,
    onMouseLeave: handleHoverEndCallback,
    onTouchStart: handleHoverStartCallback,
    onMouseDown: handleMouseDownCallback,
    onMouseUp: handleMouseUp,
  };
};
