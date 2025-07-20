"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef } from "react";
import { LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions } from "./stores";

interface LogoProps {
  className?: string;
  href?: string;
}

const LogoComponent = ({ className = "text-white/90", href }: LogoProps) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleLogoClick,
    handleElementMount,
  } = useNavigationActions();

  // Register element on mount
  useEffect(() => {
    if (logoRef.current) {
      handleElementMount("logo", logoRef.current);
    }
  }, [handleElementMount]);

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    if (logoRef.current) {
      handleHoverStart("logo", logoRef.current);
    }
  }, [handleHoverStart]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown("logo");
  }, [handleMouseDown]);

  const content = (
    <div
      ref={logoRef}
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEnd}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={handleLogoClick}
    >
      <svg
        className={className}
        width="65"
        height="17"
        viewBox="0 0 260.68 65.8"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <g>
          <path d="M93.22,42.3v23.5h-.02v-22.66c0-.28.01-.56.02-.84Z" />
          <path d="M225.46,33.74v32.06h-30.38v-22.66c0-9.06-7.38-16.62-16.28-16.62h-1.68c-8.89,0-16.28,7.56-16.28,16.62v22.66h-33.57v-22.66c0-9.06-7.22-16.62-16.28-16.62h-1.51c-8.79,0-15.83,7.09-16.26,15.78-.01.28-.02.56-.02.84v22.66h-28.52v-19.53c-5.36,11.54-17.05,19.53-30.61,19.53h-.33C15.11,65.8,0,50.7,0,32.06V0h30.55v22.66c0,9.07,7.22,16.62,16.28,16.62h1.51c9.06,0,16.28-7.55,16.28-16.62V0h28.6v19.37C98.61,7.92,110.25,0,123.74,0h.34c18.63,0,33.74,15.11,33.74,33.74,0-18.63,14.94-33.74,33.57-33.74h.33c18.64,0,33.74,15.11,33.74,33.74Z" />
          <circle cx="248.08" cy="53.2" r="12.6" />
        </g>
      </svg>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

// Memoize the component to prevent unnecessary re-renders
export const Logo = memo(LogoComponent);

// Add display name for debugging
Logo.displayName = "Logo";
