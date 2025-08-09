"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { CURRENT_SONG, PLAYER_CONFIG } from "../config";
import { ANIMATIONS, COLORS, LAYOUT, VINYL_STYLES } from "../constants";
import type { VinylDiskProps, VinylDiskRef } from "../types";
import { ProgressIndicator } from "./ProgressIndicator";

/**
 * Spinning vinyl disk component with YouTube video background and circular progress indicator
 */
export const VinylDisk = forwardRef<VinylDiskRef, VinylDiskProps>(
  ({ isPlaying, progressPercentage }, ref) => {
    const [pausedRotation, setPausedRotation] = useState(() => {
      if (
        typeof window !== "undefined" &&
        typeof window.__ytVinylRotationPaused === "number"
      ) {
        return window.__ytVinylRotationPaused;
      }
      return 0;
    });

    /**
     * Resets the vinyl rotation to 0 degrees
     */
    const resetRotation = useCallback(() => {
      setPausedRotation(0);
      if (typeof window !== "undefined") {
        window.__ytVinylRotationPaused = 0;
      }
    }, []);

    // Expose reset function to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        resetRotation,
      }),
      [resetRotation]
    );

    // Keep window-scoped cache in sync to avoid flicker on remount
    useEffect(() => {
      if (typeof window !== "undefined") {
        window.__ytVinylRotationPaused = pausedRotation;
      }
    }, [pausedRotation]);

    return (
      <div className="relative">
        {/* The hidden YouTube container is now rendered once in the root layout via PLAYER_CONFIG.playerId */}

        {/* Circular Progress Indicator */}
        <ProgressIndicator
          progressPercentage={progressPercentage}
          radius={LAYOUT.progressIndicator.radius}
          animateOnMount={false}
        />

        {/* Outer spinning disk with video thumbnail as background */}
        <motion.div
          className={`${LAYOUT.vinylSize.width} ${LAYOUT.vinylSize.height} rounded-full relative overflow-hidden`}
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/${CURRENT_SONG.videoId}/maxresdefault.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mask: VINYL_STYLES.backgroundMask,
            WebkitMask: VINYL_STYLES.backgroundMask,
          }}
          animate={{
            rotate: isPlaying
              ? [
                  pausedRotation,
                  pausedRotation + PLAYER_CONFIG.vinylRotationDegrees,
                ]
              : pausedRotation,
          }}
          transition={{
            duration: isPlaying ? PLAYER_CONFIG.vinylRotationDuration : 0,
            repeat: isPlaying ? Infinity : 0,
            ease: ANIMATIONS.vinylRotation.ease,
            repeatType: ANIMATIONS.vinylRotation.repeatType,
          }}
          onUpdate={(latest) => {
            if (isPlaying && typeof latest.rotate === "number") {
              setPausedRotation(latest.rotate);
            }
          }}
        >
          {/* Vinyl grooves effect */}
          <div
            className={`${VINYL_STYLES.grooves.inset1} ${COLORS.vinylGrooves.primary}`}
          />
          <div
            className={`${VINYL_STYLES.grooves.inset2} ${COLORS.vinylGrooves.secondary}`}
          />
          <div
            className={`${VINYL_STYLES.grooves.inset3} ${COLORS.vinylGrooves.tertiary}`}
          />
          <div
            className={`${VINYL_STYLES.grooves.inset4} ${COLORS.vinylGrooves.tertiary}`}
          />

          {/* Center hole boundary groove */}
          <div
            className={`${VINYL_STYLES.centerHole} ${COLORS.vinylGrooves.center}`}
          />

          {/* Dark overlay to make grooves more visible */}
          <div className={VINYL_STYLES.overlay} />

          {/* Highlight for 3D effect */}
          <div
            className={VINYL_STYLES.highlight.classes}
            style={{
              background: VINYL_STYLES.highlight.gradient,
            }}
          />
        </motion.div>
      </div>
    );
  }
);

// Add display name for the forwardRef component
VinylDisk.displayName = "VinylDisk";
