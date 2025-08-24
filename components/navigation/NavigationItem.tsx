"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
// Removed useDelayedNavigation in favor of DelayedLink wrapper
import { motion } from "motion/react";
// Removed next/link in favor of DelayedLink
import { DelayedLink } from "@/components/DelayedLink";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ANIMATION_CONFIG, LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions } from "./stores";
import { NavigationItemId } from "./types";

interface NavigationItemProps {
  children: React.ReactNode;
  itemId: NavigationItemId;
  href?: string;
  onClick?: () => void;
  isMobile?: boolean;
}

const NavigationItemComponent = ({
  children,
  itemId,
  href,
  onClick,
  isMobile = false,
}: NavigationItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const startExit = useRouteTransitionStore((s) => s.startExit);

  // Detect touch / coarse pointer devices to disable hover logic
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

  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    handleMobileElementMount,
    closeMenu,
    setActiveItem,
    setLastClickedItem,
  } = useNavigationActions();

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    if (itemRef.current) {
      handleHoverStart(itemId, itemRef.current);
    }
  }, [handleHoverStart, itemId]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown(itemId);
  }, [handleMouseDown, itemId]);

  // Local click side-effect handler for non-link items
  const handleClickCallback = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Register element on mount
  useEffect(() => {
    if (itemRef.current) {
      if (isMobile) {
        handleMobileElementMount(itemId, itemRef.current);
      } else {
        handleElementMount(itemId, itemRef.current);
      }
    }
  }, [itemId, isMobile, handleElementMount, handleMobileElementMount]);

  const content = (
    <motion.div
      ref={itemRef}
      className={`text-2xl font-thin ${LAYOUT_CONSTANTS.itemPadding} cursor-pointer relative focus-visible:outline-none`}
      onHoverStart={isTouchDevice ? undefined : handleHoverStartCallback}
      onHoverEnd={isTouchDevice ? undefined : handleHoverEnd}
      onTouchStart={isTouchDevice ? undefined : handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      // Only attach onClick for non-link items to avoid double-calling with the outer Link
      onClick={href ? undefined : handleClickCallback}
      onFocus={handleHoverStartCallback}
      onBlur={handleHoverEnd}
      {...ANIMATION_CONFIG.navigationItem}
      tabIndex={href ? undefined : 0}
    >
      {children}
    </motion.div>
  );

  // Wrap with DelayedLink when href exists; centralize navigation/delay and side effects
  return href ? (
    <DelayedLink
      href={href}
      delay={300}
      // Run lightweight side-effects even on same-route clicks
      onClick={() => {
        onClick?.();
        closeMenu();
      }}
      // Only start exit when navigation will proceed
      beforeNavigate={() => {
        startExit();
        // Set active item immediately on click to prevent glass pill from unmounting
        setActiveItem(itemId);
        // Track what we clicked for route validation
        setLastClickedItem(itemId);
      }}
    >
      {content}
    </DelayedLink>
  ) : (
    content
  );
};

// Memoize the component to prevent unnecessary re-renders
export const NavigationItem = memo(NavigationItemComponent);

// Add display name for debugging
NavigationItem.displayName = "NavigationItem";
