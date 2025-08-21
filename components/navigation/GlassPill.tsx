"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES,
  LAYOUT_CONSTANTS,
  NAVIGATION_CATEGORIES,
  Z_INDEX,
} from "./constants";
import { useNavigationSelectors } from "./stores";
import { useMobileMenuState } from "./stores/mobileMenuState";

import { ExternalLinkId, NavigationItemId } from "./types";

interface GlassPillProps {
  displayedItem?: NavigationItemId | null;
}

const GlassPillComponent = ({ displayedItem }: GlassPillProps) => {
  const { glassPillStyle, glassPillVisible, pressedItem, activeItem } =
    useNavigationSelectors();

  // Detect touch / coarse pointer devices (post-mount to avoid hydration mismatch)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav: Navigator & { maxTouchPoints?: number } =
      navigator as Navigator & {
        maxTouchPoints?: number;
      };
    const isTouch =
      "ontouchstart" in window ||
      (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  // Respect OS-level Reduce Motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  // Viewport gating: use global store isMobile to mirror Navigation.tsx logic
  const isSmallViewport = useMobileMenuState((s) => s.isMobile);

  // Define which items should have circular glass pills
  const circularItems = useMemo(
    () =>
      new Set<NavigationItemId>([
        ...NAVIGATION_CATEGORIES.alwaysVisible,
        ...NAVIGATION_CATEGORIES.blogItem,
        ...NAVIGATION_CATEGORIES.externalLinks,
        ...NAVIGATION_CATEGORIES.musicPlayerButtons,
      ]),
    []
  );

  // Memoized calculations for pill styling
  const pillConfiguration = useMemo(() => {
    // Only check glassPillVisible for rendering - displayedItem can be null during exit animation
    if (!glassPillVisible) return null;

    const isCircular = displayedItem ? circularItems.has(displayedItem) : false;
    const isMobileMenuItem = glassPillStyle.top > 100;
    const isBlogInMobileMenu = displayedItem === "blog" && isMobileMenuItem;
    const shouldBeCircular = isCircular && !isBlogInMobileMenu;
    const isPressed = pressedItem === displayedItem;

    // Use smaller size for external links, regular size for other circular items
    const isExternalLink = displayedItem
      ? NAVIGATION_CATEGORIES.externalLinks.includes(
          displayedItem as ExternalLinkId
        )
      : false;
    const isMusicPlayerButton = displayedItem
      ? NAVIGATION_CATEGORIES.musicPlayerButtons.includes(displayedItem)
      : false;
    const circularSize = shouldBeCircular
      ? isExternalLink || isMusicPlayerButton
        ? LAYOUT_CONSTANTS.externalLinkPillSize
        : LAYOUT_CONSTANTS.circularPillSize
      : Math.max(glassPillStyle.width, glassPillStyle.height);

    const adjustedLeft = shouldBeCircular
      ? glassPillStyle.left + (glassPillStyle.width - circularSize) / 2
      : glassPillStyle.left;

    const adjustedTop = shouldBeCircular
      ? glassPillStyle.top + (glassPillStyle.height - circularSize) / 2
      : glassPillStyle.top;

    const positionStyle = isMobileMenuItem
      ? {
          position: "fixed" as const,
          width: shouldBeCircular ? circularSize : glassPillStyle.width,
          height: shouldBeCircular ? circularSize : glassPillStyle.height,
          left: adjustedLeft,
          top: adjustedTop,
          zIndex: Z_INDEX.mobileMenu + 1,
          ...GLASS_EFFECT_STYLES,
        }
      : {
          width: shouldBeCircular ? circularSize : glassPillStyle.width,
          height: shouldBeCircular ? circularSize : glassPillStyle.height,
          left: adjustedLeft,
          top: adjustedTop,
          zIndex: Z_INDEX.glassPill,
          ...GLASS_EFFECT_STYLES,
        };

    return {
      isMobileMenuItem,
      isPressed,
      positionStyle,
    };
  }, [
    glassPillVisible, // Primary dependency for rendering
    displayedItem, // Secondary dependency for configuration
    glassPillStyle,
    pressedItem,
    circularItems,
  ]);

  // Determine if pill should render (touch devices: only show for active item)
  const cfg = pillConfiguration;
  const shouldRender = (() => {
    if (!glassPillVisible || !cfg) return false;
    // On touch: only for active item
    if (isTouchDevice) return !!displayedItem && displayedItem === activeItem;
    // On small viewport (desktop < md): behave like touch, but allow hover for mobile menu items
    if (isSmallViewport) {
      const isExternalLink = displayedItem
        ? NAVIGATION_CATEGORIES.externalLinks.includes(
            displayedItem as ExternalLinkId
          )
        : false;
      const isMusicPlayerButton = displayedItem
        ? NAVIGATION_CATEGORIES.musicPlayerButtons.includes(displayedItem)
        : false;
      const isNavigationItem = displayedItem
        ? NAVIGATION_CATEGORIES.navigationItems.includes(
            displayedItem as NavigationItemId
          )
        : false;
      // Allow hover only for mobile menu navigation items
      if (cfg.isMobileMenuItem && isNavigationItem) return !!displayedItem;
      // Disallow hover for external links and music controls; active only
      if (isExternalLink || isMusicPlayerButton)
        return !!displayedItem && displayedItem === activeItem;
      // Default: active only
      return !!displayedItem && displayedItem === activeItem;
    }
    // Regular desktop: follow global visibility (hover/active) determined up the stack
    return true;
  })();

  // Always render AnimatePresence, let glassPillVisible control the animation
  return (
    <AnimatePresence>
      {shouldRender && cfg && (
        <motion.div
          className={`${
            cfg.isMobileMenuItem ? "fixed" : "absolute"
          } rounded-full pointer-events-none py-2`}
          style={cfg.positionStyle}
          animate={{
            opacity: 1,
            ...(prefersReducedMotion ? {} : { scale: cfg.isPressed ? 1.1 : 1 }),
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : ANIMATION_CONFIG.glassPill.initial
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : ANIMATION_CONFIG.glassPill.exit
          }
          transition={{
            opacity: ANIMATION_CONFIG.glassPill.transition,
            ...(prefersReducedMotion
              ? {}
              : {
                  scale: {
                    type: "spring",
                    stiffness: cfg.isPressed ? 400 : 300,
                    damping: cfg.isPressed ? 25 : 20,
                    bounce: cfg.isPressed ? 0.3 : 0.8,
                  },
                }),
            layout: ANIMATION_CONFIG.glassPill.transition.layout,
          }}
          layout
        />
      )}
    </AnimatePresence>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const GlassPill = memo(GlassPillComponent);

// Add display name for debugging
GlassPill.displayName = "GlassPill";
