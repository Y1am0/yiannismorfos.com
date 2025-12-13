"use client";

import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
} from "@/components/icons";
import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimationContext,
} from "@/components/PageLoadAnimationProvider";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ANIMATION_CONFIG,
  EXTERNAL_LINK_ROTATION_INTERVAL,
  LAYOUT_CONSTANTS,
} from "./constants";
import { GlassPill } from "./GlassPill";
import { getExternalLinks } from "./menu-items";
import { useNavigationActions } from "./stores";
import { ExternalLinkId } from "./types";
import { useNavigationPill } from "./useNavigationPill";

interface ExternalLinkItemProps {
  id: ExternalLinkId;
  href: string;
  iconType: ExternalLinkId;
  label: string;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * Individual external link item with hover states and icon rendering
 * Registers itself with the navigation system for glass pill positioning
 */
const ExternalLinkItem = ({
  id,
  href,
  iconType,
  label,
  onHoverChange,
}: ExternalLinkItemProps) => {
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    clearExitingItem,
  } = useNavigationActions();

  const pill = useNavigationPill(id, "fixed");

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    handleHoverStart(id);
    onHoverChange?.(true);
  }, [handleHoverStart, id, onHoverChange]);

  // Memoized hover end handler
  const handleHoverEndCallback = useCallback(() => {
    handleHoverEnd();
    onHoverChange?.(false);
  }, [handleHoverEnd, onHoverChange]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown(id);
  }, [handleMouseDown, id]);

  // Memoized icon renderer based on iconType
  const renderIcon = useCallback(() => {
    const iconProps = {
      size: 20,
      className: "text-white/70 transition-colors",
    };

    switch (iconType) {
      case "github":
        return <GitHubIcon {...iconProps} />;
      case "linkedin":
        return <LinkedInIcon {...iconProps} />;
      case "instagram":
        return <InstagramIcon {...iconProps} />;
      case "tiktok":
        return <TikTokIcon {...iconProps} />;
      default:
        return null;
    }
  }, [iconType]);

  return (
    <motion.a
      {...ANIMATION_CONFIG.externalLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none block relative`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      aria-label={label}
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
      {renderIcon()}
    </motion.a>
  );
};

/**
 * External links component with rotating social media icons
 * Features:
 * - Rotates between two sets of social icons (GitHub/LinkedIn & Instagram/TikTok)
 * - Visual indicator line shows which set is currently active
 * - Pauses rotation on hover (both icons and line)
 * - Synchronized animations with stretching effects
 */
const ExternalLinksComponent = () => {
  const allLinks = getExternalLinks();

  // Page load animation state
  const { isExternalLinksVisible, shouldAnimate } = usePageLoadAnimationContext();

  // Define rotating sets by id order
  const linkSets = useMemo(
    () => [
      ["github", "linkedin"] as [ExternalLinkId, ExternalLinkId],
      ["instagram", "tiktok"] as [ExternalLinkId, ExternalLinkId],
    ],
    []
  );
  const [setIndex, setSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Hover state removed for simplified horizontal-only variant
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle through sets on interval, pause if hovered
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setSetIndex((prev) => (prev + 1) % linkSets.length);
    }, EXTERNAL_LINK_ROTATION_INTERVAL);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, linkSets.length]);

  // Pause timer on hover
  const handleHoverChange = useCallback((hovered: boolean) => {
    setIsPaused(hovered);
  }, []);

  // Handle line hover to pause timer and animate width
  // Hover handlers removed; no hover UI for the indicator

  // Handle line click to manually change set and reset timer
  const handleLineClick = useCallback(() => {
    // Change to next set
    setSetIndex((prev) => (prev + 1) % linkSets.length);

    // Reset the timer by clearing current one and restarting
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Restart timer after a brief delay to allow the transition to play
    setTimeout(() => {
      if (!isPaused) {
        timerRef.current = setInterval(() => {
          setSetIndex((prev) => (prev + 1) % linkSets.length);
        }, EXTERNAL_LINK_ROTATION_INTERVAL);
      }
    }, 100);
  }, [linkSets.length, isPaused]);

  const visibleLinks = allLinks.filter((l) =>
    linkSets[setIndex].includes(l.id as ExternalLinkId)
  );

  return (
    <motion.div
      className="z-20 flex flex-col items-center space-y-2"
      initial={
        shouldAnimate
          ? PAGE_LOAD_ANIMATIONS.externalLinks.initial
          : PAGE_LOAD_ANIMATIONS.externalLinks.animate
      }
      animate={
        isExternalLinksVisible
          ? PAGE_LOAD_ANIMATIONS.externalLinks.animate
          : PAGE_LOAD_ANIMATIONS.externalLinks.initial
      }
      transition={
        shouldAnimate
          ? PAGE_LOAD_ANIMATIONS.externalLinks.transition
          : { duration: 0 }
      }
    >
      {/* Horizontal line (all sizes) */}
      <div
        className="relative w-16 cursor-pointer py-2"
        onClick={handleLineClick}
      >
        {/* Base line */}
        <div className="h-px w-full bg-white/40 relative" />
        {/* Indicator segment */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-white/80"
          initial={false}
          animate={{
            x: setIndex === 0 ? "0%" : "100%",
            width: "50%",
            scaleX: [1, 1.05, 1],
          }}
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* External links with fixed height to prevent line movement */}
      <div
        className={`flex flex-col ${LAYOUT_CONSTANTS.externalLinksContainerHeight}`}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={setIndex}
            className="flex flex-col space-y-1"
            {...ANIMATION_CONFIG.externalLinksContainer}
          >
            {visibleLinks.map((link) => (
              <ExternalLinkItem
                key={link.id}
                id={link.id}
                href={link.href}
                iconType={link.iconType}
                label={link.label}
                onHoverChange={handleHoverChange}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ExternalLinks = memo(ExternalLinksComponent);

// Add display name for debugging
ExternalLinks.displayName = "ExternalLinks";
