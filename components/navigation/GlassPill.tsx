"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";
import {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES,
  LAYOUT_CONSTANTS,
  Z_INDEX,
} from "./constants";
import { useNavigationSelectors } from "./stores";

interface GlassPillProps {
  displayedItem?: string | null;
}

const GlassPillComponent = ({ displayedItem }: GlassPillProps) => {
  const { glassPillStyle, glassPillVisible, pressedItem } =
    useNavigationSelectors();

  // Define which items should have circular glass pills
  const circularItems = useMemo(() => new Set(["logo", "menu", "blog"]), []);

  // Memoized calculations for pill styling
  const pillConfiguration = useMemo(() => {
    // Only check glassPillVisible for rendering - displayedItem can be null during exit animation
    if (!glassPillVisible) return null;

    // Use displayedItem for configuration, but allow it to be null during exit
    const itemForConfig = displayedItem || "default";

    const isCircular = displayedItem ? circularItems.has(displayedItem) : false;
    const isMobileMenuItem = glassPillStyle.top > 100;
    const isBlogInMobileMenu = displayedItem === "blog" && isMobileMenuItem;
    const shouldBeCircular = isCircular && !isBlogInMobileMenu;
    const isPressed = pressedItem === displayedItem;

    const circularSize = shouldBeCircular
      ? LAYOUT_CONSTANTS.circularPillSize
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

  // Always render AnimatePresence, let glassPillVisible control the animation
  return (
    <AnimatePresence>
      {glassPillVisible && pillConfiguration && (
        <motion.div
          className={`${
            pillConfiguration.isMobileMenuItem ? "fixed" : "absolute"
          } rounded-full pointer-events-none py-2`}
          style={pillConfiguration.positionStyle}
          animate={{
            opacity: 1,
            scale: pillConfiguration.isPressed ? 1.1 : 1,
          }}
          initial={ANIMATION_CONFIG.glassPill.initial}
          exit={ANIMATION_CONFIG.glassPill.exit}
          transition={{
            opacity: ANIMATION_CONFIG.glassPill.transition,
            scale: {
              type: "spring",
              stiffness: pillConfiguration.isPressed ? 400 : 300,
              damping: pillConfiguration.isPressed ? 25 : 20,
              bounce: pillConfiguration.isPressed ? 0.3 : 0.8,
            },
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
