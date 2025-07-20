"use client";

import { motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions, useNavigationSelectors } from "./stores";

const MenuToggleComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const { isMobileMenuOpen } = useNavigationSelectors();
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    toggleMenu,
  } = useNavigationActions();

  // Register element on mount
  useEffect(() => {
    if (iconRef.current) {
      handleElementMount("menu", iconRef.current);
    }
  }, [handleElementMount]);

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    setIsHovered(true);
    if (iconRef.current) {
      handleHoverStart("menu", iconRef.current);
    }
  }, [handleHoverStart]);

  // Memoized hover end handler
  const handleHoverEndCallback = useCallback(() => {
    setIsHovered(false);
    handleHoverEnd();
  }, [handleHoverEnd]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown("menu");
  }, [handleMouseDown]);

  return (
    <div
      ref={iconRef}
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={toggleMenu}
      role="button"
      aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center relative">
        {/* Top line */}
        <motion.div
          className="w-full h-0.5 bg-current absolute"
          animate={{
            rotate: isMobileMenuOpen ? 45 : 0,
            y: isMobileMenuOpen ? 0 : isHovered ? -4 : -6,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        />

        {/* Middle line */}
        <motion.div
          className="w-full h-0.5 bg-current absolute"
          animate={{
            opacity: isMobileMenuOpen ? 0 : 1,
            scale: isMobileMenuOpen ? 0 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        />

        {/* Bottom line */}
        <motion.div
          className="w-full h-0.5 bg-current absolute"
          animate={{
            rotate: isMobileMenuOpen ? -45 : 0,
            y: isMobileMenuOpen ? 0 : isHovered ? 4 : 6,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MenuToggle = memo(MenuToggleComponent);

// Add display name for debugging
MenuToggle.displayName = "MenuToggle";
