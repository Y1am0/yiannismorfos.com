"use client";

import React, { useEffect, useState } from "react";
import { BUTTON_STYLES } from "../constants";
import type { MediaControlsProps } from "../types";
import { PlayPauseButton, RestartButton, VolumeButton } from "./ControlButtons";
import { VolumeSlider } from "./VolumeSlider";

/**
 * Main media controls component containing all playback controls
 */
export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);

  // Only enable hover-to-open slider on md and up
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hideIfNotInteracting = () => {
    if (!isMdUp) return;
    if (!isDragging) setShowVolumeSlider(false);
  };

  return (
    <div className={`flex items-center ${BUTTON_STYLES.controlSpacing}`}>
      {/* Play/Pause Button */}
      <PlayPauseButton isPlaying={isPlaying} onTogglePlay={onTogglePlay} />

      {/* Restart Button */}
      <RestartButton onRestart={onRestart} />

      {/* Volume Control */}
      <div
        className="relative flex items-center"
        onMouseEnter={() => {
          if (isMdUp) setShowVolumeSlider(true);
        }}
        onMouseLeave={hideIfNotInteracting}
      >
        <VolumeButton
          volume={volume}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />

        <VolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={(newVolume) => {
            onVolumeChange(newVolume);
          }}
          showSlider={isMdUp && (showVolumeSlider || isDragging)}
          onDragStart={() => {
            setIsDragging(true);
            setShowVolumeSlider(true);
          }}
          onDragEnd={() => {
            setIsDragging(false);
            // Do not force-hide here; let hover keep it visible if still hovered
          }}
        />
      </div>
    </div>
  );
};
