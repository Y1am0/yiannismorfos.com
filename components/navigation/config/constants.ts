const GLASS_EFFECT_BASE = {
  background:
    "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.04) 80%, rgba(255,255,255,0.01) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  boxShadow: `
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1)
  `,
} as const;

export const GLASS_EFFECT_STYLES = {
  ...GLASS_EFFECT_BASE,
  backdropFilter: "brightness(110%) saturate(110%) contrast(115%)",
  WebkitBackdropFilter: "brightness(110%) saturate(110%) contrast(115%)",
} as const;

// Mobile overlay variant: avoid `backdrop-filter` entirely to prevent
// flickering/darkening while the pill re-parents during shared-layout moves.
export const GLASS_EFFECT_STYLES_OVERLAY = {
  ...GLASS_EFFECT_BASE,
} as const;

// -------------------------------------------------------------------------------------
// Global animation presets – keeps tuning variables in one place
// -------------------------------------------------------------------------------------

export const SPRING_PRESETS = {
  default: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  glass: {
    type: "spring" as const,
    stiffness: 120,
    damping: 15,
    bounce: 0.4,
  },
} as const;

export const ANIMATION_CONFIG = {
  glassPill: {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.6 },
    transition: {
      ...SPRING_PRESETS.glass,
      layout: {
        ...SPRING_PRESETS.glass,
        duration: 1.2,
      },
    },
  },
  navigationItem: {
    transition: SPRING_PRESETS.default,
  },
  externalLink: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: {
      ...SPRING_PRESETS.default,
      opacity: { duration: 0.2 },
    },
  },
  stretchingLine: {
    initial: { scaleY: 1 },
    animate: {
      scaleY: [1, 1.2, 1] as number[],
    },
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1] as number[], // Extend during first half, retract during second half
      ease: "easeInOut" as const,
    },
  },
  indicatorLine: {
    initial: {
      y: 0,
      scaleY: 1,
    },
    transition: {
      y: {
        duration: 0.4,
        ease: "easeInOut" as const,
        delay: 0.2, // Slight delay to sync with icon transitions
      },
      scaleY: {
        duration: 0.8,
        times: [0, 0.5, 1] as number[],
        ease: "easeInOut" as const,
      },
    },
  },
  externalLinksContainer: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
} as const;

export const LAYOUT_CONSTANTS = {
  circularPillSize: 80,
  externalLinkPillSize: 68,
  itemPadding: "px-6 py-2",
  absolutePositioning: "absolute top-1/2 -translate-y-1/2",
  responsiveDesktopPadding: "left-4 lg:left-12",
  responsiveMobilePadding: "right-4 lg:right-12",
  // External links specific constants
  externalLinksLineHeight: "h-24", // Main line height
  externalLinksIndicatorHeight: "h-12", // Indicator line height (50% of main)
  externalLinksContainerHeight: "h-[92px]", // Fixed container height
  externalLinksLineContainer: "h-26", // Line container height
} as const;

export const Z_INDEX = {
  mobileMenu: 30,
  navigationOverlay: 40,
  glassPill: 10,
} as const;

// Animation timing constants
export const TIMING = {
  glassPillExitDuration: 400, // Duration to wait for glass pill exit animation
} as const;

// External links constants
export const EXTERNAL_LINKS = {
  rotationInterval: 7500, // ms, rotation interval
  indicatorPositions: {
    top: 0, // Top half position (pixels)
    bottom: 48, // Bottom half position (pixels) - half of main line height
  },
  stretchScale: {
    main: 1.2, // Main line stretch scale
    indicator: 1.4, // Indicator line stretch scale (more pronounced for visibility)
  },
} as const;

export const EXTERNAL_LINK_ROTATION_INTERVAL = EXTERNAL_LINKS.rotationInterval;
