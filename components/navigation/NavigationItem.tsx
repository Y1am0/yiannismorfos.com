"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef } from "react";
import { ANIMATION_CONFIG, LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions } from "./stores";

interface NavigationItemProps {
  children: React.ReactNode;
  itemId: string;
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
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    handleMobileElementMount,
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

  // Memoized click handler
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
      className={`text-2xl font-thin ${LAYOUT_CONSTANTS.itemPadding} cursor-pointer relative`}
      onHoverStart={handleHoverStartCallback}
      onHoverEnd={handleHoverEnd}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={handleClickCallback}
      {...ANIMATION_CONFIG.navigationItem}
    >
      {children}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

// Memoize the component to prevent unnecessary re-renders
export const NavigationItem = memo(NavigationItemComponent);

// Add display name for debugging
NavigationItem.displayName = "NavigationItem";
