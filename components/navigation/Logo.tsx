"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef } from "react";
import { LAYOUT_CONSTANTS } from "./constants";
import { useNavigationActions, useNavigationSelectors } from "./stores";

interface LogoProps {
  className?: string;
  href?: string;
}

const LogoComponent = ({ className = "text-white/90", href }: LogoProps) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isMobileMenuOpen } = useNavigationSelectors();

  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    closeMenu,
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

  // Memoized click handler with mobile menu animation support
  const handleLogoClickCallback = useCallback(
    (e?: React.MouseEvent) => {
      // If mobile menu is open and we have a href, delay navigation for animation
      if (href && isMobileMenuOpen) {
        e?.preventDefault();

        // Start the close menu animation
        closeMenu();

        // Wait for the mobile menu exit animation to complete before navigating
        setTimeout(() => {
          router.push(href);
        }, 300); // Match the exit animation duration from MobileMenu.tsx
      }
      // For when mobile menu is closed, Link handles navigation normally
    },
    [href, isMobileMenuOpen, closeMenu, router]
  );

  const content = (
    <div
      ref={logoRef}
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEnd}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={handleLogoClickCallback}
    >
      <svg
        className={className}
        width="65"
        height="23"
        viewBox="0 0 268.74 93.37"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <g>
          <path d="M221.44,6c18.64,0,25.02,15.11,14.26,33.74l-18.51,32.06h-30.38l13.08-22.66c5.23-9.06,2.22-16.62-6.68-16.62h-1.68c-8.89,0-20.64,7.56-25.88,16.62l-13.08,22.66h-33.57l13.08-22.66c5.23-9.06,2.38-16.62-6.68-16.62h-1.51c-8.79,0-19.92,7.09-25.37,15.78-.17.28-.34.56-.51.84l-22.07,38.23h-28.52l20.27-35.1c-12.02,11.54-28.33,19.53-41.89,19.53h-.33c-18.63,0-25.02-15.1-14.26-33.74L29.72,6h30.55l-13.08,22.66c-5.24,9.07-2.38,16.62,6.68,16.62h1.51c9.06,0,20.64-7.55,25.88-16.62l13.08-22.66h28.6l-11.18,19.37c12-11.45,28.21-19.37,41.7-19.37h.34c18.63,0,25.02,15.11,14.26,33.74,10.76-18.63,34.42-33.74,53.05-33.74h.33M250.14,46.6c6.96,0,12.6,5.64,12.6,12.6s-5.64,12.6-12.6,12.6-12.6-5.64-12.6-12.6,5.64-12.6,12.6-12.6M98.52,48.3l-13.57,23.5h-.02l13.08-22.66c.16-.28.33-.56.51-.84M221.44,0h-.33c-13.78,0-29.69,7.11-42.31,17.92-.47-2.39-1.29-4.64-2.48-6.69-4.18-7.24-12.18-11.23-22.52-11.23h-.34c-7.37,0-15.46,2.03-23.41,5.69l3.28-5.69h-42.46l-1.73,3-13.08,22.66c-4.19,7.26-13.85,13.62-20.68,13.62h-1.51c-1.54,0-2.71-.36-3.04-.93-.4-.69-.59-2.98,1.55-6.69l13.08-22.66,5.2-9H26.25l-1.73,3L6.01,35.06c-6.76,11.7-7.88,23.19-3.07,31.51,4.18,7.24,12.18,11.23,22.53,11.23h.33c7.41,0,15.54-2.04,23.53-5.73l-7.1,12.31-5.2,9h42.38l1.73-3,7.26-12.57h0l1.75-3,13.51-23.4c4.43-6.99,13.67-12.88,20.23-12.88h1.51c1.54,0,2.7.36,3.03.93.4.69.59,2.98-1.55,6.69l-13.08,22.66-5.2,9h47.43l1.73-3,13.08-22.66c4.12-7.13,13.97-13.62,20.68-13.62h1.68c.57,0,2.47.07,2.98.96.57.98.34,3.48-1.49,6.66l-13.08,22.66-5.2,9h44.24l1.73-3,9.16-15.86c0,.09,0,.18,0,.27,0,10.26,8.34,18.6,18.6,18.6s18.6-8.34,18.6-18.6-8.34-18.6-18.6-18.6c-3.48,0-6.74.96-9.53,2.63l.29-.49c6.76-11.7,7.88-23.19,3.07-31.52-4.18-7.24-12.18-11.22-22.53-11.22h0Z" />
        </g>
      </svg>
    </div>
  );

  // Always wrap in Link for consistent DOM structure, but handle navigation manually when needed
  return href ? (
    <Link
      href={href}
      onClick={(e) => {
        // Only prevent default for mobile menu scenarios
        if (isMobileMenuOpen) {
          e.preventDefault();
          handleLogoClickCallback(e);
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
export const Logo = memo(LogoComponent);

// Add display name for debugging
Logo.displayName = "Logo";
