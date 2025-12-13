"use client";

import { useNavigationPill } from "@/components/navigation/hooks/useNavigationPill";
import { NavigationItemId } from "@/components/navigation/model/types";
import { useNavigationState } from "@/components/navigation/stores/navigationState";
import { GlassPill } from "@/components/navigation/ui/GlassPill";
import React, { useRef } from "react";
import { BUTTON_STYLES, ICONS } from "../constants";
import { useMusicPlayerButton } from "../hooks";

interface IconButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  buttonId?: NavigationItemId;
}

/**
 * Reusable icon button component with optional glass pill integration
 */
const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  ariaLabel,
  children,
  buttonId,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const clearExitingItem = useNavigationState((s) => s.clearExitingItem);

  // Always call the hook, but only use the result if buttonId is provided
  const glassPillProps = useMusicPlayerButton(
    buttonId || "music-play-pause" // fallback to prevent undefined
  );

  const pill = useNavigationPill(buttonId || "music-play-pause", "fixed");

  return (
    <button
      ref={buttonRef}
      className={`${BUTTON_STYLES.base} relative`}
      onClick={onClick}
      aria-label={ariaLabel}
      {...(buttonId ? glassPillProps : {})}
    >
      {buttonId && pill.shouldRender && (
        <GlassPill
          variant={pill.variant}
          circleSizePx={pill.circleSizePx}
          isPressed={pill.isPressed}
          isExiting={pill.isExiting}
          onExitComplete={clearExitingItem}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
};

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
  <IconButton
    onClick={onTogglePlay}
    ariaLabel={isPlaying ? "Pause" : "Play"}
    buttonId="music-play-pause"
  >
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
  <IconButton
    onClick={onRestart}
    ariaLabel="Restart song"
    buttonId="music-restart"
  >
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
    <IconButton
      onClick={onToggleMute}
      ariaLabel={isMuted ? "Unmute" : "Mute"}
      buttonId="music-volume"
    >
      <SVGIcon path={getVolumeIcon()} />
    </IconButton>
  );
};
