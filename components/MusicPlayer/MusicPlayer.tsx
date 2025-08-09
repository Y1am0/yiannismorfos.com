"use client";

import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimation,
} from "@/lib/usePageLoadAnimation";
import { motion } from "motion/react";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { MediaControls, SongInfo, VinylDisk } from "./components";
import { PLAYER_CONFIG } from "./config";
import { LAYOUT } from "./constants";
import { usePlayerState, useProgressTracking, useYouTubePlayer } from "./hooks";
import type { VinylDiskRef } from "./types";

/**
 * Main Music Player component
 * Features a spinning vinyl disk with YouTube video, media controls, and circular progress indicator
 */
const MusicPlayerComponent: React.FC = () => {
  const vinylDiskRef = useRef<VinylDiskRef>(null);

  // Page load animation state
  const { isMusicPlayerVisible, shouldAnimate } = usePageLoadAnimation();

  // Initialize player state
  const { state, updatePlayerState, handleProgressUpdate } = usePlayerState();

  // Hydrate UI state from window cache to avoid flicker on remounts
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pct = window.__ytProgressPercent;
    const dur = window.__ytDuration;
    const cur = window.__ytCurrentTime;
    const isPlaying = window.__ytIsPlaying;

    const updates: Partial<typeof state> = {};
    if (typeof pct === "number") updates.progressPercentage = pct;
    if (typeof dur === "number") updates.duration = dur;
    if (typeof cur === "number") updates.currentTime = cur;
    if (typeof isPlaying === "boolean") updates.isPlaying = isPlaying;

    if (Object.keys(updates).length) {
      updatePlayerState(updates);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize YouTube player
  const { playerRef } = useYouTubePlayer(
    PLAYER_CONFIG.playerId,
    (isPlaying) => updatePlayerState({ isPlaying }),
    () => {
      // On player ready, get initial duration
      if (playerRef.current) {
        try {
          const total = playerRef.current.getDuration();
          if (total > 0) {
            updatePlayerState({ duration: total });
          }
        } catch (error) {
          console.log("Duration not yet available", error);
        }
      }
    }
  );

  // Initialize progress tracking
  const { startProgressTracking, stopProgressTracking } = useProgressTracking(
    playerRef,
    handleProgressUpdate
  );

  // Progress tracking effect - start/stop based on playing state
  useEffect(() => {
    if (state.isPlaying) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }

    return () => {
      stopProgressTracking();
    };
  }, [state.isPlaying, startProgressTracking, stopProgressTracking]);

  // Media control handlers
  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current) return;

    try {
      if (state.isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error("Error controlling YouTube player:", error);
      // Fallback: just toggle the visual state
      updatePlayerState({ isPlaying: !state.isPlaying });
    }
  }, [state.isPlaying, updatePlayerState, playerRef]);

  /**
   * Restarts the song from the beginning
   * Resets progress, vinyl rotation, but maintains volume settings
   */
  const handleRestart = useCallback(() => {
    if (!playerRef.current) return;

    try {
      // Pause the video first
      playerRef.current.pauseVideo();

      // Reset progress tracking
      updatePlayerState({
        currentTime: 0,
        progressPercentage: 0,
      });
      stopProgressTracking();

      // Reset vinyl rotation
      if (vinylDiskRef.current) {
        vinylDiskRef.current.resetRotation();
      }

      // Seek to beginning and play
      playerRef.current.seekTo(0, true);

      // Small delay to ensure seek completes, then play
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.playVideo();
        }
      }, 100);
    } catch (error) {
      console.error("Error restarting YouTube player:", error);
      // Fallback: just reset visual states
      updatePlayerState({
        currentTime: 0,
        progressPercentage: 0,
      });
      if (vinylDiskRef.current) {
        vinylDiskRef.current.resetRotation();
      }
    }
  }, [stopProgressTracking, updatePlayerState, playerRef]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!playerRef.current) return;

      try {
        updatePlayerState({ volume: newVolume });

        if (newVolume === 0) {
          playerRef.current.mute();
          updatePlayerState({ isMuted: true });
        } else {
          if (state.isMuted) {
            playerRef.current.unMute();
            updatePlayerState({ isMuted: false });
          }
          playerRef.current.setVolume(newVolume);
        }
      } catch (error) {
        console.error("Error controlling YouTube player volume:", error);
        // Fallback: just update the visual state
        updatePlayerState({
          volume: newVolume,
          isMuted: newVolume === 0,
        });
      }
    },
    [state.isMuted, updatePlayerState, playerRef]
  );

  const handleToggleMute = useCallback(() => {
    if (!playerRef.current) return;

    try {
      if (state.isMuted) {
        playerRef.current.unMute();
        updatePlayerState({ isMuted: false });
        if (state.volume === 0) {
          updatePlayerState({ volume: 50 });
          playerRef.current.setVolume(50);
        }
      } else {
        playerRef.current.mute();
        updatePlayerState({ isMuted: true });
      }
    } catch (error) {
      console.error("Error controlling YouTube player mute:", error);
      // Fallback: just toggle the visual state
      updatePlayerState({ isMuted: !state.isMuted });
    }
  }, [state.isMuted, state.volume, updatePlayerState, playerRef]);

  return (
    <motion.div
      className={LAYOUT.containerClasses}
      initial={
        shouldAnimate
          ? PAGE_LOAD_ANIMATIONS.musicPlayer.initial
          : PAGE_LOAD_ANIMATIONS.musicPlayer.animate
      }
      animate={
        isMusicPlayerVisible
          ? PAGE_LOAD_ANIMATIONS.musicPlayer.animate
          : PAGE_LOAD_ANIMATIONS.musicPlayer.initial
      }
      transition={
        shouldAnimate
          ? PAGE_LOAD_ANIMATIONS.musicPlayer.transition
          : { duration: 0 }
      }
    >
      {/* Vinyl disk with progress indicator */}
      <VinylDisk
        ref={vinylDiskRef}
        isPlaying={state.isPlaying}
        progressPercentage={state.progressPercentage}
        animateOnMount={shouldAnimate}
      />

      {/* Song information and controls */}
      <div className="flex flex-col">
        {/* Song information */}
        <SongInfo />

        {/* Media controls */}
        <MediaControls
          isPlaying={state.isPlaying}
          onTogglePlay={handleTogglePlay}
          onRestart={handleRestart}
          volume={state.volume}
          isMuted={state.isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
        />
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MusicPlayer = memo(MusicPlayerComponent);

// Add display name for debugging
MusicPlayer.displayName = "MusicPlayer";
