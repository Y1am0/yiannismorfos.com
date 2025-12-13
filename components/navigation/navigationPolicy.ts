import { NAVIGATION_CATEGORIES } from "./navigationModel";
import type { ExternalLinkId, MusicPlayerButtonId, NavigationItemId } from "./types";

export type PillPositionMode = "absolute" | "fixed";

export type NavigationViewportContext = {
  isMobileViewport: boolean;
  isMobileMenuOpen: boolean;
  mobileMenuAnimationsComplete: boolean;
};

export type NavigationHoverContext = Pick<
  NavigationViewportContext,
  "isMobileViewport" | "isMobileMenuOpen"
>;

export type NavigationAnimationContext = {
  pageLoadComplete: boolean;
};

export const isExternalLinkId = (id: NavigationItemId): id is ExternalLinkId =>
  NAVIGATION_CATEGORIES.externalLinks.includes(id as ExternalLinkId);

export const isMusicPlayerButtonId = (
  id: NavigationItemId
): id is MusicPlayerButtonId =>
  NAVIGATION_CATEGORIES.musicPlayerButtons.includes(id as MusicPlayerButtonId);

export const isNavigationItemId = (id: NavigationItemId) =>
  NAVIGATION_CATEGORIES.navigationItems.includes(id);

export const isBlogItemId = (id: NavigationItemId) =>
  NAVIGATION_CATEGORIES.blogItem.includes(id);

export const isNavOrBlogId = (id: NavigationItemId) =>
  isNavigationItemId(id) || isBlogItemId(id);

export const isAlwaysVisibleHeaderId = (id: NavigationItemId) =>
  NAVIGATION_CATEGORIES.alwaysVisible.includes(id);

export const shouldAllowHover = (
  id: NavigationItemId,
  ctx: NavigationHoverContext
) => {
  if (!ctx.isMobileViewport) return true;
  return isNavOrBlogId(id) && ctx.isMobileMenuOpen;
};

export const getEffectiveDisplayedItem = (
  hoveredItem: NavigationItemId | null,
  activeItem: NavigationItemId | null,
  ctx: NavigationViewportContext
): NavigationItemId | null => {
  if (!ctx.isMobileViewport) return hoveredItem || activeItem;

  if (hoveredItem) {
    if (shouldAllowHover(hoveredItem, ctx)) return hoveredItem;
    // On mobile viewport, ignore hover unless it's for nav/blog inside an open menu.
    return activeItem;
  }
  return activeItem;
};

export type ElementRegistryLookup = {
  parentElement: Element | null;
  getHeaderElement: (id: NavigationItemId) => Element | null;
  getOverlayElement: (id: NavigationItemId) => Element | null;
  getFixedElement: (id: NavigationItemId) => Element | null;
};

export type PillTarget =
  | {
      element: Element;
      mode: PillPositionMode;
      parentElement: Element | null;
    }
  | { element: null; mode: null; parentElement: null };

export const resolvePillTarget = (
  id: NavigationItemId,
  ctx: NavigationViewportContext,
  registry: ElementRegistryLookup
): PillTarget => {
  // Footer items: always "fixed".
  if (isExternalLinkId(id) || isMusicPlayerButtonId(id)) {
    const element = registry.getFixedElement(id);
    if (!element) return { element: null, mode: null, parentElement: null };
    return { element, mode: "fixed", parentElement: null };
  }

  // Header always-visible items: always absolute.
  if (isAlwaysVisibleHeaderId(id)) {
    const element = registry.getHeaderElement(id);
    if (!element) return { element: null, mode: null, parentElement: null };
    return {
      element,
      mode: "absolute",
      parentElement: registry.parentElement,
    };
  }

  // Desktop viewport: everything else is in the header.
  if (!ctx.isMobileViewport) {
    const element = registry.getHeaderElement(id);
    if (!element) return { element: null, mode: null, parentElement: null };
    return {
      element,
      mode: "absolute",
      parentElement: registry.parentElement,
    };
  }

  // Mobile viewport: nav/blog only exist in the mobile menu overlay.
  if (isNavOrBlogId(id) && ctx.isMobileMenuOpen && ctx.mobileMenuAnimationsComplete) {
    const element = registry.getOverlayElement(id);
    if (!element) return { element: null, mode: null, parentElement: null };
    return { element, mode: "fixed", parentElement: null };
  }

  return { element: null, mode: null, parentElement: null };
};

export const shouldHidePillForPageLoad = (
  displayedItem: NavigationItemId | null,
  hoveredItem: NavigationItemId | null,
  animation: NavigationAnimationContext
) => {
  // During the first page-load animation we hide the pill unless the user is actively hovering.
  if (animation.pageLoadComplete) return false;
  return !!displayedItem && !hoveredItem;
};
