import { NAVIGATION_CATEGORIES } from "./navigationModel";
import type {
  ExternalLinkId,
  MusicPlayerButtonId,
  NavigationItemId,
} from "./types";

export type NavigationHoverContext = {
  isMobileViewport: boolean;
  isMobileMenuOpen: boolean;
};

const externalLinkIdSet = new Set<ExternalLinkId>(
  NAVIGATION_CATEGORIES.externalLinks
);
const musicButtonIdSet = new Set<MusicPlayerButtonId>(
  NAVIGATION_CATEGORIES.musicPlayerButtons
);
const navigationItemIdSet = new Set<NavigationItemId>(
  NAVIGATION_CATEGORIES.navigationItems
);
const blogItemIdSet = new Set<NavigationItemId>(NAVIGATION_CATEGORIES.blogItem);
const alwaysVisibleHeaderIdSet = new Set<NavigationItemId>(
  NAVIGATION_CATEGORIES.alwaysVisible
);

export const isExternalLinkId = (id: NavigationItemId): id is ExternalLinkId =>
  externalLinkIdSet.has(id as ExternalLinkId);

export const isMusicPlayerButtonId = (
  id: NavigationItemId
): id is MusicPlayerButtonId => musicButtonIdSet.has(id as MusicPlayerButtonId);

export const isNavigationItemId = (id: NavigationItemId) =>
  navigationItemIdSet.has(id);

export const isBlogItemId = (id: NavigationItemId) => blogItemIdSet.has(id);

export const isNavOrBlogId = (id: NavigationItemId) =>
  isNavigationItemId(id) || isBlogItemId(id);

export const isAlwaysVisibleHeaderId = (id: NavigationItemId) =>
  alwaysVisibleHeaderIdSet.has(id);

export const shouldAllowHover = (
  id: NavigationItemId,
  ctx: NavigationHoverContext
) => {
  if (!ctx.isMobileViewport) return true;
  return isNavOrBlogId(id) && ctx.isMobileMenuOpen;
};
