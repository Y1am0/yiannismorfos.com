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
// filter stacking/darkening against the mobile menu backdrop blur.
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
  externalLinksContainerHeight: "h-[92px]",
} as const;

export const BUTTON_STYLES = {
  base: "text-white/70 transition-colors duration-300 hover:text-white",
} as const;

export const Z_INDEX = {
  mobileMenu: 30,
  navigationOverlay: 40,
} as const;

// Animation timing constants
export const TIMING = {
  glassPillExitDuration: 400, // Duration to wait for glass pill exit animation
} as const;

export const EXTERNAL_LINK_ROTATION_INTERVAL = 7500;
