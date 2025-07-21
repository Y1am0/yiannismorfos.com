"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef } from "react";
import { ANIMATION_CONFIG, LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions, useNavigationSelectors } from "./stores";
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
  const router = useRouter();
  const { isMobileMenuOpen } = useNavigationSelectors();

  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    handleMobileElementMount,
    closeMenu,
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

  // Memoized click handler with mobile menu animation support
  const handleClickCallback = useCallback(
    (e?: React.MouseEvent) => {
      // If this is a mobile navigation item with a href and mobile menu is open,
      // we need to delay navigation to allow exit animation
      if (href && isMobile && isMobileMenuOpen) {
        e?.preventDefault();

        // First trigger the custom onClick (if any)
        onClick?.();

        // Start the close menu animation
        closeMenu();

        // Wait for the mobile menu exit animation to complete before navigating
        setTimeout(() => {
          router.push(href);
        }, 300); // Match the exit animation duration from MobileMenu.tsx
      } else {
        // For desktop or non-href items, proceed normally
        onClick?.();
      }
    },
    [onClick, href, isMobile, isMobileMenuOpen, closeMenu, router]
  );

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
      onHoverStart={handleHoverStartCallback}
      onHoverEnd={handleHoverEnd}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={handleClickCallback}
      onFocus={handleHoverStartCallback}
      onBlur={handleHoverEnd}
      {...ANIMATION_CONFIG.navigationItem}
      tabIndex={href ? undefined : 0}
    >
      {children}
    </motion.div>
  );

  // Always wrap in Link for consistent DOM structure, but handle navigation manually when needed
  return href ? (
    <Link
      href={href}
      onClick={(e) => {
        // Only prevent default for mobile menu scenarios
        if (isMobile && isMobileMenuOpen) {
          e.preventDefault();
          handleClickCallback(e);
        }
      }}
    >
      {content}
    </Link>
  ) : (
    content
  );
};

// Memoize the component to prevent unnecessary re-renders
export const NavigationItem = memo(NavigationItemComponent);

// Add display name for debugging
NavigationItem.displayName = "NavigationItem";
