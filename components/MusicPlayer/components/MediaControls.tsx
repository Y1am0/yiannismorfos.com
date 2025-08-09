"use client";

import React, { useState } from "react";
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

  const hideIfNotInteracting = () => {
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
        onMouseEnter={() => setShowVolumeSlider(true)}
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
          showSlider={showVolumeSlider || isDragging}
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
