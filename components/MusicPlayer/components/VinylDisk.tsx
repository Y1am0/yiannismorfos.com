"use client";

import { motion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { CURRENT_SONG, PLAYER_CONFIG } from "../config";
import { ANIMATIONS, COLORS, LAYOUT, VINYL_STYLES } from "../constants";
import type { VinylDiskProps, VinylDiskRef } from "../types";
import { ProgressIndicator } from "./ProgressIndicator";

/**
 * Spinning vinyl disk component with YouTube video background and circular progress indicator
 */
export const VinylDisk = forwardRef<VinylDiskRef, VinylDiskProps>(
  ({ isPlaying, playerId, progressPercentage }, ref) => {
    const [pausedRotation, setPausedRotation] = useState(0);

    /**
     * Resets the vinyl rotation to 0 degrees
     */
    const resetRotation = useCallback(() => {
      setPausedRotation(0);
    }, []);

    // Expose reset function to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        resetRotation,
      }),
      [resetRotation]
    );

    return (
      <div className="relative">
        {/* YouTube video player - positioned off-screen but still functional */}
        <div className="absolute -left-[9999px] -top-[9999px]">
          <div id={playerId} />
        </div>

        {/* Circular Progress Indicator */}
        <ProgressIndicator
          progressPercentage={progressPercentage}
          radius={LAYOUT.progressIndicator.radius}
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
