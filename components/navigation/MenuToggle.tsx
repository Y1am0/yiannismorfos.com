"use client";

import { motion } from "motion/react";
import { memo, useCallback, useRef, useState } from "react";
import { GlassPill } from "./GlassPill";
import { useNavigationActions, useNavigationSelectors } from "./stores";
import { useNavigationPill } from "./useNavigationPill";

const MenuToggleComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const { isMobileMenuOpen } = useNavigationSelectors();
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    toggleMenu,
    clearExitingItem,
  } = useNavigationActions();

  const pill = useNavigationPill("menu", "header");

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    setIsHovered(true);
    handleHoverStart("menu");
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
      className={`px-2 sm:px-6 py-2 cursor-pointer select-none relative`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={toggleMenu}
      role="button"
      aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
    >
      {pill.shouldRender && (
        <GlassPill
          variant={pill.variant}
          circleSizePx={pill.circleSizePx}
          isPressed={pill.isPressed}
          isExiting={pill.isExiting}
          onExitComplete={clearExitingItem}
        />
      )}
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
