export const GLASS_EFFECT_STYLES = {
  backdropFilter: "brightness(110%) saturate(110%) contrast(115%)",
  WebkitBackdropFilter: "brightness(110%) saturate(110%) contrast(115%)",
  background:
    "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.04) 80%, rgba(255,255,255,0.01) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  boxShadow: `
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1)
  `,
} as const;

export const ANIMATION_CONFIG = {
  glassPill: {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.6 },
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
      bounce: 0.4,
      layout: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
        bounce: 0.5,
        duration: 1.2,
      },
    },
  },
  navigationItem: {
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
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
} as const;

export const Z_INDEX = {
  mobileMenu: 30,
  navigationOverlay: 40,
  glassPill: 10,
} as const;

// Navigation item categories for glass pill logic
export const NAVIGATION_CATEGORIES = {
  alwaysVisible: ["logo", "menu"],
  externalLinks: ["github", "linkedin"],
  navigationItems: ["hello", "who", "what", "connect"],
  blogItem: ["blog"],
} as const;

// Animation timing constants
export const TIMING = {
  glassPillExitDuration: 400, // Duration to wait for glass pill exit animation
} as const;
