"use client";

import { motion } from "motion/react";
import { memo, useCallback, useState } from "react";
import { useNavigationPill } from "../hooks/useNavigationPill";
import { useNavigationActions } from "../stores";
import { GlassPill } from "./GlassPill";

type Props = {
  isOpen: boolean;
  toggleMenu: () => void;
};

const MenuToggleComponent = ({ isOpen, toggleMenu }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
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
      className={`px-2 sm:px-6 py-2 cursor-pointer select-none relative`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={toggleMenu}
      role="button"
      aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
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
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 0 : isHovered ? -4 : -6,
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
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0 : 1,
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
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 0 : isHovered ? 4 : 6,
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
