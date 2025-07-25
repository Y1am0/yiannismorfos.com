"use client";

import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
} from "@/components/icons";
import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimation,
} from "@/lib/usePageLoadAnimation";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ANIMATION_CONFIG,
  EXTERNAL_LINKS,
  EXTERNAL_LINK_ROTATION_INTERVAL,
  LAYOUT_CONSTANTS,
} from "./constants";
import { getExternalLinks } from "./menu-items";
import { useNavigationActions } from "./stores";
import { ExternalLinkId, NavigationItemId } from "./types";

interface ExternalLinkItemProps {
  id: NavigationItemId;
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
  const itemRef = useRef<HTMLAnchorElement>(null);
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
  } = useNavigationActions();

  // Register element on mount
  useEffect(() => {
    if (itemRef.current) {
      handleElementMount(id, itemRef.current);
    }
  }, [id, handleElementMount]);

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    if (itemRef.current) {
      handleHoverStart(id, itemRef.current);
    }
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
      ref={itemRef}
      {...ANIMATION_CONFIG.externalLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none block`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      aria-label={label}
    >
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
  const { isExternalLinksVisible } = usePageLoadAnimation();

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
  const [isLineHovered, setIsLineHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  const handleLineHover = useCallback((hovered: boolean) => {
    setIsPaused(hovered);
    setIsLineHovered(hovered);
  }, []);

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
      className="absolute right-4 bottom-8 lg:right-12 z-20 flex flex-col items-center space-y-2"
      initial={PAGE_LOAD_ANIMATIONS.externalLinks.initial}
      animate={
        isExternalLinksVisible
          ? PAGE_LOAD_ANIMATIONS.externalLinks.animate
          : PAGE_LOAD_ANIMATIONS.externalLinks.initial
      }
      transition={PAGE_LOAD_ANIMATIONS.externalLinks.transition}
    >
      {/* Animated vertical line with inner indicator - wrapped with padding for easier hover */}
      <div
        className={`relative ${LAYOUT_CONSTANTS.externalLinksLineContainer} cursor-pointer px-3 py-1`}
        onMouseEnter={() => handleLineHover(true)}
        onMouseLeave={() => handleLineHover(false)}
        onClick={handleLineClick}
      >
        {/* Hover tooltip with context-aware text */}
        <AnimatePresence>
          {isLineHovered && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full pr-4 top-1/2 -translate-y-1/2 text-right text-xs text-white/70 whitespace-nowrap"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={setIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  {setIndex === 0 ? (
                    <>
                      <div className="text-white">Development Socials</div>
                      <div className="italic">
                        Press to show Content Creation Socials
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-white">Content Creation Socials</div>
                      <div className="italic">
                        Press to show Development Socials
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`line-${setIndex}`}
            className={`w-px ${LAYOUT_CONSTANTS.externalLinksLineHeight} bg-white/40 absolute top-1 left-1/2 -translate-x-1/2 origin-top`}
            {...ANIMATION_CONFIG.stretchingLine}
          />
        </AnimatePresence>
        {/* Inner indicator line that slides between top and bottom half - outside AnimatePresence */}
        <motion.div
          key={`indicator-${setIndex}`} // Force recreation to ensure stretch animation plays
          className={`${LAYOUT_CONSTANTS.externalLinksIndicatorHeight} bg-white/70 absolute top-1 left-1/2 -translate-x-1/2 origin-top`}
          initial={{
            y:
              setIndex === 0
                ? EXTERNAL_LINKS.indicatorPositions.bottom
                : EXTERNAL_LINKS.indicatorPositions.top, // Start from opposite position to slide
            scaleY: 1,
            width: "1px",
          }}
          animate={{
            y:
              setIndex === 0
                ? EXTERNAL_LINKS.indicatorPositions.top
                : EXTERNAL_LINKS.indicatorPositions.bottom, // Slide to target position
            scaleY: [1, EXTERNAL_LINKS.stretchScale.indicator, 1], // More pronounced stretch to match proportional scaling
            width: isLineHovered ? "4px" : "1px",
          }}
          transition={{
            ...ANIMATION_CONFIG.indicatorLine.transition,
            width: { duration: 0.2, ease: "easeInOut" },
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
