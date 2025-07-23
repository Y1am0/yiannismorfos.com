/**
 * Constants for the Music Player component system
 */

// UI Layout constants
export const LAYOUT = {
  containerClasses:
    "absolute left-4 bottom-8 p-4 lg:left-12 z-20 flex items-center space-x-4",
  vinylSize: {
    width: "w-20",
    height: "h-20",
  },
  progressIndicator: {
    radius: 46,
    containerSize: "w-24 h-24",
    svgSize: 96,
  },
  volumeSlider: {
    width: "80px",
    height: "w-20 h-6",
  },
  songInfo: {
    titleClasses: "text-white text-sm font-medium mb-1 max-w-48 truncate",
    artistClasses: "text-white/70 text-xs mb-2 italic",
    maxArtistWidth: "max-w-42",
  },
} as const;

// Button styling constants
export const BUTTON_STYLES = {
  base: "text-white/70 hover:text-white transition-colors p-2 rounded-full hover:cursor-pointer",
  controlSpacing: "space-x-2",
} as const;

// Animation constants
export const ANIMATIONS = {
  vinylRotation: {
    duration: 200, // seconds
    ease: "linear" as const,
    repeat: Infinity,
    repeatType: "loop" as const,
  },
  volumeSlider: {
    duration: 0.2,
    ease: "easeInOut" as const,
  },
  progressIndicator: {
    duration: 0.5,
    ease: "easeInOut" as const,
  },
} as const;

// Color constants
export const COLORS = {
  progressBackground: "rgba(255, 255, 255, 0.4)",
  progressForeground: "rgba(255, 255, 255, 0.7)",
  vinylGrooves: {
    primary: "border-white/20",
    secondary: "border-white/15",
    tertiary: "border-white/10",
    center: "border-white/25",
  },
  volumeSlider: {
    background: "bg-white/40",
    foreground: "bg-white/70",
    hoverHeight: "4px",
    defaultHeight: "1px",
  },
} as const;

// SVG Icon constants
export const ICONS = {
  play: "M8 5v14l11-7z",
  pause: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
  restart:
    "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
  volumeMuted:
    "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z",
  volumeOff: "M7 9v6h4l5 5V4l-5 5H7z",
  volumeLow:
    "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z",
  volumeHigh:
    "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
} as const;

// Vinyl styling constants
export const VINYL_STYLES = {
  backgroundMask: "radial-gradient(circle, transparent 6px, black 8px)",
  grooves: {
    inset1: "absolute inset-1 rounded-full border",
    inset2: "absolute inset-2 rounded-full border",
    inset3: "absolute inset-3 rounded-full border",
    inset4: "absolute inset-4 rounded-full border",
  },
  centerHole:
    "absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border",
  overlay: "absolute inset-0 rounded-full bg-black/30",
  highlight: {
    classes: "absolute inset-0 rounded-full",
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 100%)",
  },
} as const;
