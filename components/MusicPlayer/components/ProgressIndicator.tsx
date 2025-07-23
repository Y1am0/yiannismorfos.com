"use client";

import { motion } from "motion/react";
import React from "react";
import { COLORS, LAYOUT } from "../constants";
import type { ProgressIndicatorProps } from "../types";

/**
 * Circular progress indicator component that shows song playback progress
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progressPercentage,
  radius,
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

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
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};
