"use client";

import { motion } from "motion/react";
import React, { useMemo } from "react";
import { COLORS, LAYOUT } from "../constants";
import type { ProgressIndicatorProps } from "../types";

/**
 * Circular progress indicator component that shows song playback progress
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progressPercentage,
  radius,
  animateOnMount = false,
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  // Prevent initial flicker: after first mount in the session, render at correct offset with no animation
  const shouldAnimate = useMemo(() => {
    if (typeof window === "undefined") return animateOnMount;
    if (!window.__ytProgressAnimatedOnce && animateOnMount) {
      window.__ytProgressAnimatedOnce = true;
      return true;
    }
    return false; // no animation on subsequent mounts (route changes)
  }, [animateOnMount]);

  return (
    <div
      className={`absolute -inset-2 ${LAYOUT.progressIndicator.containerSize}`}
    >
      <svg
        width={LAYOUT.progressIndicator.svgSize}
        height={LAYOUT.progressIndicator.svgSize}
        viewBox={`0 0 ${LAYOUT.progressIndicator.svgSize} ${LAYOUT.progressIndicator.svgSize}`}
        className="absolute inset-0 transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={LAYOUT.progressIndicator.svgSize / 2}
          cy={LAYOUT.progressIndicator.svgSize / 2}
          r={radius}
          fill="none"
          stroke={COLORS.progressBackground}
          strokeWidth="1"
        />

        {/* Progress circle */}
        <motion.circle
          cx={LAYOUT.progressIndicator.svgSize / 2}
          cy={LAYOUT.progressIndicator.svgSize / 2}
          r={radius}
          fill="none"
          stroke={COLORS.progressForeground}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: shouldAnimate ? circumference : strokeDashoffset,
          }}
          animate={{ strokeDashoffset }}
          transition={
            shouldAnimate
              ? { duration: 0.5, ease: "easeInOut" }
              : { duration: 0 }
          }
        />
      </svg>
    </div>
  );
};
