"use client";
import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";
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
  const {
    glassPillStyle,
    glassPillVisible,
    pressedItem,
    glassPillPositionMode,
  } = useNavigationSelectors();

  // Viewport gating: use global store isMobile to mirror Navigation.tsx logic
  // Subscribe to mobile state for parity with Navigation.tsx; value unused here
  useMobileMenuState((s) => s.isMobile);

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
    const isMobileMenuItem = glassPillPositionMode === "fixed";
    const isNavOrBlog = displayedItem
      ? NAVIGATION_CATEGORIES.navigationItems.includes(
          displayedItem as NavigationItemId
        ) || displayedItem === "blog"
      : false;
    // When mobile menu is open and we're showing a nav/blog item, force non-circular even if hovered a circular item elsewhere
    const forceNonCircular = isMobileMenuItem && isNavOrBlog;
    const isBlogInMobileMenu = displayedItem === "blog" && isMobileMenuItem;
    const shouldBeCircular =
      !forceNonCircular && isCircular && !isBlogInMobileMenu;
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
    glassPillVisible,
    displayedItem,
    glassPillStyle,
    pressedItem,
    circularItems,
    glassPillPositionMode,
  ]);

  // Determine if pill should render – rely on centralized visibility logic
  const cfg = pillConfiguration;
  const shouldRender = glassPillVisible && !!cfg;

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
            scale: cfg.isPressed ? 1.1 : 1,
          }}
          initial={ANIMATION_CONFIG.glassPill.initial}
          exit={ANIMATION_CONFIG.glassPill.exit}
          transition={{
            opacity: ANIMATION_CONFIG.glassPill.transition,
            scale: {
              type: "spring",
              stiffness: cfg.isPressed ? 400 : 300,
              damping: cfg.isPressed ? 25 : 20,
              bounce: cfg.isPressed ? 0.3 : 0.8,
            },
            layout: {
              ...ANIMATION_CONFIG.glassPill.transition.layout,
              // Slightly reduce duration on fixed mode to avoid perceptible lag during menu interactions
              duration:
                (
                  ANIMATION_CONFIG.glassPill.transition.layout as {
                    duration: number;
                  }
                ).duration * (cfg.isMobileMenuItem ? 0.8 : 1),
            },
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
