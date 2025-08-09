"use client";

import { motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";
import { ANIMATIONS, COLORS } from "../constants";

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  showSlider: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Animated volume slider component with drag support
 */
export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  showSlider,
  onDragStart,
  onDragEnd,
}) => {
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      onDragStart?.();

      const slider = e.currentTarget;
      const rect = slider.getBoundingClientRect();
      const newVolume = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      onVolumeChange(Math.round(newVolume));
    },
    [onVolumeChange, onDragStart]
  );

  const handleSliderMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const slider = document.querySelector(".volume-slider") as HTMLElement;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const newVolume = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      onVolumeChange(Math.round(newVolume));
    },
    [isDragging, onVolumeChange]
  );

  const handleSliderMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    onDragEnd?.();
  }, [isDragging, onDragEnd]);

  // Add global mouse move and mouse up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleSliderMouseMove);
      document.addEventListener("mouseup", handleSliderMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleSliderMouseMove);
        document.removeEventListener("mouseup", handleSliderMouseUp);
      };
    }
  }, [isDragging, handleSliderMouseMove, handleSliderMouseUp]);

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{
        opacity: showSlider ? 1 : 0,
        width: showSlider ? "80px" : "0px",
      }}
      transition={ANIMATIONS.volumeSlider}
      className="relative ml-2 overflow-hidden"
    >
      <div
        className="volume-slider relative w-20 h-6 flex items-center cursor-pointer"
        onMouseDown={handleSliderMouseDown}
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        {/* Background line */}
        <motion.div
          className={`w-full ${COLORS.volumeSlider.background}`}
          animate={{
            height: COLORS.volumeSlider.defaultHeight,
          }}
          transition={ANIMATIONS.volumeSlider}
        />

        {/* Filled portion */}
        <motion.div
          className={`absolute left-0 ${COLORS.volumeSlider.foreground}`}
          style={{
            width: `${isMuted ? 0 : volume}%`,
          }}
          animate={{
            height:
              isSliderHovered || isDragging
                ? COLORS.volumeSlider.hoverHeight
                : COLORS.volumeSlider.defaultHeight,
          }}
          transition={ANIMATIONS.volumeSlider}
        />
      </div>
    </motion.div>
  );
};
