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

  // Keep window-scoped callbacks up-to-date so singleton events reach the current UI
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__ytMusicPlayer_onStateChange = (isPlaying: boolean) => {
      onStateChange?.(isPlaying);
    };
    window.__ytMusicPlayer_onReady = () => {
      onReady?.();
    };
    return () => {
      // Do not clear on unmount; next mount will overwrite
    };
  }, [onStateChange, onReady]);

  const ensureContainer = useCallback(() => {
    if (typeof document === "undefined") return false;
    let el = document.getElementById(playerId);
    if (!el) {
      el = document.createElement("div");
      el.id = playerId;
      Object.assign(el.style, {
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "0px",
        height: "0px",
      });
      document.body.appendChild(el);
      return true; // created
    }
    return false; // already existed
  }, [playerId]);

  const syncFromExistingPlayer = useCallback(() => {
    const p = window.__ytMusicPlayer;
    if (!p) return;

    // Verify the underlying iframe is still attached to the document
    try {
      const iframe = p.getIframe?.();
      if (!iframe || !document.contains(iframe)) {
        // Stale instance referencing a detached iframe: dispose and bail out
        try {
          p.destroy?.();
        } catch {}
        window.__ytMusicPlayer = undefined;
        playerRef.current = null;
        return;
      }
    } catch {}

    playerRef.current = p;
    if (!isPlayerReady) setIsPlayerReady(true);

    // Notify readiness
    window.__ytMusicPlayer_onReady?.();

    // Sync playing state
    try {
      const stateCode = p.getPlayerState?.();
      if (typeof stateCode === "number") {
        const isPlayingNow = stateCode === window.YT.PlayerState.PLAYING;
        window.__ytMusicPlayer_onStateChange?.(isPlayingNow);
      }
    } catch {}

    // Also sync current time and duration once to avoid UI flicker
    try {
      const total = p.getDuration?.();
      const current = p.getCurrentTime?.();
      if (
        typeof total === "number" &&
        total > 0 &&
        typeof current === "number"
      ) {
        // no-op; ensures timing aligns so progress tracking picks up immediately
      }
    } catch {}
  }, [isPlayerReady]);

  const initializePlayer = useCallback(() => {
    if (typeof window === "undefined" || !window.YT) return;

    // Make sure a container exists in the document
    const createdContainer = ensureContainer();

    // Reuse singleton instance across remounts/route changes
    if (window.__ytMusicPlayer) {
      // If we just created a new container, the previous player's DOM was likely removed.
      // Destroy the stale instance and recreate it targeting the current container.
      if (createdContainer) {
        try {
          window.__ytMusicPlayer.destroy?.();
        } catch {}
        window.__ytMusicPlayer = undefined;
        playerRef.current = null;
      } else {
        syncFromExistingPlayer();
        return;
      }
    }

    if (playerRef.current) return; // Don't recreate if already exists

    const player = new window.YT.Player(playerId, {
      height: "0",
      width: "0",
      videoId: CURRENT_SONG.videoId,
      playerVars: {
        ...YOUTUBE_PLAYER_VARS,
        playlist: CURRENT_SONG.videoId,
      },
      events: {
        onReady: () => {
          // Cache singleton on window so it survives remounts
          window.__ytMusicPlayer = player as unknown as YouTubePlayer;
          playerRef.current = window.__ytMusicPlayer;

          // Set initial volume
          try {
            playerRef.current?.setVolume(PLAYER_CONFIG.defaultVolume);
            if (typeof window !== "undefined") {
              window.__ytIsPlaying = false;
            }
          } catch {}

          setIsPlayerReady(true);
          // Notify most recent subscriber
          window.__ytMusicPlayer_onReady?.();

          // Also emit current playing state after ready
          try {
            const stateCode = playerRef.current?.getPlayerState?.();
            if (typeof stateCode === "number") {
              const isPlayingNow = stateCode === window.YT.PlayerState.PLAYING;
              window.__ytIsPlaying = isPlayingNow;
              window.__ytMusicPlayer_onStateChange?.(isPlayingNow);
            }
          } catch {}
        },
        onStateChange: (event: unknown) => {
          const YT = window.YT;
          const eventData = event as { data: number };
          const isPlaying =
            eventData.data === YT.PlayerState.PLAYING ? true : false;
          if (
            eventData.data === YT.PlayerState.PAUSED ||
            eventData.data === YT.PlayerState.ENDED
          ) {
            window.__ytIsPlaying = false;
            window.__ytMusicPlayer_onStateChange?.(false);
          } else if (isPlaying) {
            window.__ytIsPlaying = true;
            window.__ytMusicPlayer_onStateChange?.(true);
          }
        },
      },
    });

    // Keep a local ref immediately to avoid duplicate creations
    playerRef.current = player as unknown as YouTubePlayer;
  }, [playerId, ensureContainer, syncFromExistingPlayer]);

  // Load YouTube API (only once) and never remove it
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If API is already loaded, initialize immediately
    if (window.YT?.Player) {
      initializePlayer();
      return;
    }

    // Ensure we don't append multiple scripts
    let script = document.querySelector(
      `script[src="${PLAYER_CONFIG.youtubeApiUrl}"]`
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = PLAYER_CONFIG.youtubeApiUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    // Set up global callback for when API is ready (idempotent)
    const prevCb = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        initializePlayer();
      } finally {
        // Call through if something else also listens
        try {
          prevCb?.();
        } catch {}
      }
    };

    return () => {
      // Do not remove the script to keep API and player alive across routes
      // Avoid clearing the singleton or tearing down the player here
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
        // Cache globally to hydrate UI instantly on remount
        if (typeof window !== "undefined") {
          window.__ytCurrentTime = current;
          window.__ytDuration = total;
          window.__ytProgressPercent = Math.min(100, Math.max(0, percentage));
        }
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
