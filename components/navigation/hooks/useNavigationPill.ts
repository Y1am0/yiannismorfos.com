"use client";

import { usePageLoadAnimationContext } from "@/components/PageLoadAnimationProvider";
import { LAYOUT_CONSTANTS } from "../config/constants";
import { NAVIGATION_CATEGORIES } from "../model/navigationModel";
import {
  isExternalLinkId,
  isMusicPlayerButtonId,
  isNavOrBlogId,
} from "../model/navigationPolicy";
import type { NavigationItemId } from "../model/types";
import { useMobileMenuState } from "../stores/mobileMenuState";
import { useNavigationState } from "../stores/navigationState";

export type PillHostContext = "header" | "overlay" | "fixed";

export const useNavigationPill = (
  id: NavigationItemId,
  host: PillHostContext
) => {
  const hoveredItem = useNavigationState((s) => s.hoveredItem);
  const activeItem = useNavigationState((s) => s.activeItem);
  const pressedItem = useNavigationState((s) => s.pressedItem);
  const exitingItem = useNavigationState((s) => s.exitingItem);

  const isMobileViewport = useMobileMenuState((s) => s.isMobile);
  const isMobileMenuOpen = useMobileMenuState((s) => s.isOpen);
  const mobileMenuAnimationsComplete = useMobileMenuState(
    (s) => s.animationsComplete
  );

  const { animationsComplete: pageLoadComplete } =
    usePageLoadAnimationContext();

  const displayedItem = hoveredItem || activeItem;
  const isDisplayed = displayedItem === id;
  const isPressed = pressedItem === id;
  const isExiting = !displayedItem && exitingItem === id;

  // Hide pill during initial page-load animation unless actively hovering.
  const pageLoadGated = !pageLoadComplete && !hoveredItem;

  // Mobile menu: avoid showing pill until menu stagger finishes.
  const overlayAnimationGated =
    host === "overlay" && !mobileMenuAnimationsComplete;

  const shouldRender =
    (isDisplayed || isExiting) && !pageLoadGated && !overlayAnimationGated;

  const isExternal = isExternalLinkId(id);
  const isMusic = isMusicPlayerButtonId(id);

  // Determine shape/size:
  // - External links + music buttons: small circle
  // - Logo + menu: large circle
  // - Blog: circle in header, pill in overlay
  // - Navigation items: pill
  const isAlwaysCircle =
    NAVIGATION_CATEGORIES.alwaysVisible.includes(id) ||
    (NAVIGATION_CATEGORIES.blogItem.includes(id) && host !== "overlay") ||
    isExternal ||
    isMusic;

  const circleSizePx =
    isExternal || isMusic
      ? LAYOUT_CONSTANTS.externalLinkPillSize
      : LAYOUT_CONSTANTS.circularPillSize;

  // Sanity: nav/blog items should never render in fixed footer host.
  // We don't throw; we just avoid showing the pill.
  const hostMismatch =
    host === "fixed" && (isNavOrBlogId(id) || id === "logo" || id === "menu");

  return {
    shouldRender: shouldRender && !hostMismatch,
    variant: isAlwaysCircle ? ("circle" as const) : ("pill" as const),
    circleSizePx: isAlwaysCircle ? circleSizePx : undefined,
    isPressed,
    isExiting,
    isMobileViewport,
    isMobileMenuOpen,
  };
};
