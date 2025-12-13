import { NAVIGATION_CATEGORIES } from "./navigationModel";
import type { ExternalLinkId, MusicPlayerButtonId, NavigationItemId } from "./types";

export type NavigationHoverContext = {
  isMobileViewport: boolean;
  isMobileMenuOpen: boolean;
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
