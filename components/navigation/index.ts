// Main components
export { AbsoluteItem } from "./AbsoluteItem";
export { ExternalLinks } from "./ExternalLinks";
export { GlassPill } from "./GlassPill";
export { Logo } from "./Logo";
export { MenuToggle } from "./MenuToggle";
export { MobileMenu } from "./MobileMenu";

export { Navigation } from "./Navigation";
export { MobileNavigationItem, NavigationItem } from "./NavigationItem";
export { useNavigationPill } from "./useNavigationPill";

// Zustand stores and hooks
export {
  useMobileMenuState,
  useNavigationActions,
  useNavigationSelectors,
  useNavigationState,
} from "./stores";

// Motion provider (enables shared layout for the glass pill)
export { NavigationMotionProvider } from "./NavigationMotionProvider";

// Pointer utilities
export { isCoarsePointerDevice } from "./pointer";
export { useIsCoarsePointer } from "./useIsCoarsePointer";

// Menu items and helpers
export {
  getBlogItem,
  getExternalLinks,
  getLogoItem,
  getNavigationItems,
  MENU_ITEMS,
} from "./menu-items";

// Types
export type { MenuItem } from "./types";

// Constants
export {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES,
  LAYOUT_CONSTANTS,
  TIMING,
  Z_INDEX,
} from "./constants";

// Interaction model
export { NAVIGATION_CATEGORIES } from "./navigationModel";
