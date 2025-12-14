"use client";

import { usePageLoadAnimationContext } from "@/components/PageLoadAnimationProvider";
import { LAYOUT_CONSTANTS } from "../config/constants";
import {
  EXTERNAL_LINKS,
  MUSIC_PLAYER_BUTTON_IDS,
  type NavigationItemId,
} from "../config/navigationConfig";
import { useNavigationViewport } from "../providers/NavigationProvider";
import { useNavigationState } from "../stores/navigationState";

export type PillHostContext = "header" | "fixed";

const EXTERNAL_LINK_ID_SET = new Set<NavigationItemId>(
  EXTERNAL_LINKS.map((l) => l.id)
);
const MUSIC_BUTTON_ID_SET = new Set<NavigationItemId>(MUSIC_PLAYER_BUTTON_IDS);

export const useNavigationPill = (
  id: NavigationItemId,
  host: PillHostContext
) => {
  const { isDesktopViewport } = useNavigationViewport();
  const hoveredItem = useNavigationState((s) => s.hoveredItem);
  const activeItem = useNavigationState((s) => s.activeItem);
  const pressedItem = useNavigationState((s) => s.pressedItem);
  const exitingItem = useNavigationState((s) => s.exitingItem);

  const { animationsComplete: pageLoadComplete } =
    usePageLoadAnimationContext();

  const displayedItem = hoveredItem || activeItem;
  const isDisplayed = displayedItem === id;
  const isPressed = pressedItem === id;
  const isExiting = !displayedItem && exitingItem === id;

  // Hide pill during initial page-load animation unless actively hovering.
  const pageLoadGated = !pageLoadComplete && !hoveredItem;

  const shouldRender =
    (isDisplayed || isExiting) && !pageLoadGated && isDesktopViewport;

  const isExternal = EXTERNAL_LINK_ID_SET.has(id);
  const isMusic = MUSIC_BUTTON_ID_SET.has(id);

  // Determine shape/size:
  // - External links + music buttons: small circle
  // - Logo + menu: large circle
  // - Blog: circle in header
  // - Navigation items: pill
  const isAlwaysCircle =
    id === "logo" ||
    id === "menu" ||
    id === "blog" ||
    isExternal ||
    isMusic;

  const circleSizePx =
    isExternal || isMusic
      ? LAYOUT_CONSTANTS.externalLinkPillSize
      : LAYOUT_CONSTANTS.circularPillSize;

  // Sanity: nav/blog items should never render in fixed footer host.
  // We don't throw; we just avoid showing the pill.
  const hostMismatch = host === "fixed" && !isExternal && !isMusic;

  return {
    shouldRender: shouldRender && !hostMismatch,
    variant: isAlwaysCircle ? ("circle" as const) : ("pill" as const),
    circleSizePx: isAlwaysCircle ? circleSizePx : undefined,
    isPressed,
    isExiting,
  };
};
