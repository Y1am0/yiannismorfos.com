// Main components
export { AbsoluteItem } from "@/components/navigation/ui/AbsoluteItem";
export { ExternalLinks } from "@/components/navigation/ui/ExternalLinks";
export { GlassPill } from "@/components/navigation/ui/GlassPill";
export { Logo } from "@/components/navigation/ui/Logo";
export { MenuToggle } from "@/components/navigation/ui/MenuToggle";
export { MobileMenu } from "@/components/navigation/ui/MobileMenu";

export { useNavigationPill } from "@/components/navigation/hooks/useNavigationPill";
export { Navigation } from "@/components/navigation/ui/Navigation";
export {
  MobileNavigationItem,
  NavigationItem,
} from "@/components/navigation/ui/NavigationItem";

// Zustand stores and hooks
export {
  useMobileMenuState,
  useNavigationActions,
  useNavigationSelectors,
  useNavigationState,
} from "@/components/navigation/stores";

// Motion provider (enables shared layout for the glass pill)
export { NavigationMotionProvider } from "@/components/navigation/providers/NavigationMotionProvider";

// Pointer utilities
export { useIsCoarsePointer } from "@/components/navigation/hooks/useIsCoarsePointer";
export { isCoarsePointerDevice } from "@/components/navigation/utils/pointer";

// Menu items and helpers
export {
  getBlogItem,
  getExternalLinks,
  getLogoItem,
  getNavigationItems,
  MENU_ITEMS,
} from "@/components/navigation/utils/menu-items";

// Types
export type { MenuItem } from "@/components/navigation/model/types";

// Constants
export {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES,
  LAYOUT_CONSTANTS,
  TIMING,
  Z_INDEX,
} from "@/components/navigation/config/constants";

// Interaction model
export { NAVIGATION_CATEGORIES } from "@/components/navigation/model/navigationModel";
