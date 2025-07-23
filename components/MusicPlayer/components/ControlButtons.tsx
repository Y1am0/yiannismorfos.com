"use client";

import React from "react";
import { BUTTON_STYLES, ICONS } from "../constants";

interface IconButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * Reusable icon button component
 */
const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  ariaLabel,
  children,
}) => (
  <button
    className={BUTTON_STYLES.base}
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

interface SVGIconProps {
  path: string;
  size?: number;
}

/**
 * Reusable SVG icon component
 */
const SVGIcon: React.FC<SVGIconProps> = ({ path, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d={path} />
  </svg>
);

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

/**
 * Play/Pause button component
 */
export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
  isPlaying,
  onTogglePlay,
}) => (
  <IconButton onClick={onTogglePlay} ariaLabel={isPlaying ? "Pause" : "Play"}>
    <SVGIcon path={isPlaying ? ICONS.pause : ICONS.play} />
  </IconButton>
);

interface RestartButtonProps {
  onRestart: () => void;
}

/**
 * Restart button component
 */
export const RestartButton: React.FC<RestartButtonProps> = ({ onRestart }) => (
  <IconButton onClick={onRestart} ariaLabel="Restart song">
    <SVGIcon path={ICONS.restart} />
  </IconButton>
);

interface VolumeButtonProps {
  volume: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Volume button component that shows appropriate icon based on volume/mute state
 */
export const VolumeButton: React.FC<VolumeButtonProps> = ({
  volume,
  isMuted,
  onToggleMute,
}) => {
  const getVolumeIcon = () => {
    if (isMuted) return ICONS.volumeMuted;
    if (volume === 0) return ICONS.volumeOff;
    if (volume < 50) return ICONS.volumeLow;
    return ICONS.volumeHigh;
  };

  return (
    <IconButton onClick={onToggleMute} ariaLabel={isMuted ? "Unmute" : "Mute"}>
      <SVGIcon path={getVolumeIcon()} />
    </IconButton>
  );
};
